import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import {GoogleGenerativeAI} from '@google/generative-ai';
import {
  SYSTEM_PROMPT,
  ITERATION_PROMPT,
  buildInitialMessage,
  buildIterationMessage,
  buildRegenerateFromDrawingMessage
} from '../utils/prompts.js';

// Initialize clients lazily to avoid startup errors
let openai = null;
let anthropic = null;
let gemini = null;
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured. Please add it to your .env file.');
  }
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not configured. Please add it to your .env file.');
  }
  if (!anthropic) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropic;
}

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured. Please add it to your .env file.');
  }
  if (!gemini) {
    gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return gemini;
}
function isClaudeModel(model) {
  return model && String(model).startsWith('claude-');
}
function isGeminiModel(model) {
  return model && String(model).startsWith('gemini-');
}
/**
 * Convert OpenAI-style messages to Anthropic format.
 * Anthropic: system (string), messages: [{ role, content }] where content is string or array of blocks.
 */
function toAnthropicFormat(openaiMessages) {
  let system = '';
  const messages = [];

  for (const m of openaiMessages) {
    if (m.role === 'system') {
      system = typeof m.content === 'string' ? m.content : '';
      continue;
    }
    if (m.role === 'user') {
      let content;
      if (Array.isArray(m.content)) {
        content = m.content.map((block) => {
          if (block.type === 'text') return { type: 'text', text: block.text };
          if (block.type === 'image_url') {
            const url = block.image_url?.url || '';
            const base64Match = url.match(/^data:image\/(\w+);base64,(.+)$/);
            if (base64Match) {
              return {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: `image/${base64Match[1]}`,
                  data: base64Match[2],
                },
              };
            }
            return { type: 'text', text: '[Image]' };
          }
          return { type: 'text', text: '[Unknown block]' };
        });
      } else {
        content = typeof m.content === 'string' ? m.content : String(m.content);
      }
      messages.push({ role: 'user', content });
    } else if (m.role === 'assistant') {
      const text = typeof m.content === 'string' ? m.content : '';
      messages.push({ role: 'assistant', content: text });
    }
  }
  return { system, messages };
}
/**
 * Convert OpenAI-style messages to Gemini format.
 * Gemini: { contents: [{ role, parts }], systemInstruction }
 * roles must be 'user' or 'model' (not 'assistant')
 */
function toGeminiFormat(openaiMessages) {
  let systemInstruction = '';
  const contents = [];

  for (const m of openaiMessages) {
    if (m.role === 'system') {
      systemInstruction = typeof m.content === 'string' ? m.content : '';
      continue;
    }

    let parts = [];

    if (Array.isArray(m.content)) {
      for (const block of m.content) {
        if (block.type === 'text') {
          parts.push({ text: block.text });
        } else if (block.type === 'image_url') {
          const url = block.image_url?.url || '';
          const base64Match = url.match(/^data:image\/(\w+);base64,(.+)$/);
          if (base64Match) {
            parts.push({
              inlineData: {
                mimeType: `image/${base64Match[1]}`,
                data: base64Match[2],
              },
            });
          }
        }
      }
    } else {
      parts = [{ text: typeof m.content === 'string' ? m.content : String(m.content) }];
    }

    // Gemini uses 'model' instead of 'assistant'
    const role = m.role === 'assistant' ? 'model' : 'user';
    contents.push({ role, parts });
  }

  return { systemInstruction, contents };
}
/**
 * Send SSE event to client
 */
function sendSSE(res, data) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

/**
 * Stream UI code generation (SSE)
 * POST /api/generate with stream: true in body
 */
export async function generateUIStream(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  try {
    const { image, history, feedback, currentCode, model: requestedModel } = req.body;
    const model = requestedModel || 'gpt-4o';

    console.log('[AI] Stream request received:', {
      model,
      isClaude: isClaudeModel(model),
      hasImage: !!image,
      hasFeedback: !!feedback,
      hasCurrentCode: !!currentCode,
    });

    if (!image && !feedback) {
      sendSSE(res, { type: 'error', error: 'Either "image" or "feedback" with "currentCode" is required' });
      return res.end();
    }

    const isTextIteration = Boolean(feedback && currentCode);
    const isIterativeDrawing = Boolean(image && currentCode && !feedback);

    let messages = [
      { role: 'system', content: (isTextIteration || isIterativeDrawing) ? ITERATION_PROMPT : SYSTEM_PROMPT },
    ];
    if (history && Array.isArray(history)) {
      // Keep only last 4 messages (2 full turns) to control context cost
      // Full history grows unboundedly — at turn 5 you're paying for 12k+ tokens of history
      const trimmedHistory = history.slice(-4);
      messages = messages.concat(trimmedHistory);
    }
    if (isTextIteration) {
      messages = messages.concat(buildIterationMessage(currentCode, feedback));
    } else if (isIterativeDrawing) {
      messages = messages.concat(buildRegenerateFromDrawingMessage(image, currentCode));
    } else {
      messages = messages.concat(buildInitialMessage(image));
    }

    const logType = isTextIteration ? 'iteration' : isIterativeDrawing ? 'iterative-drawing' : 'generation';
    console.log(`[AI] Streaming ${logType} with model: ${model}`);

    let fullText = '';
    let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

    if (isClaudeModel(model)) {
      const client = getAnthropicClient();
      const { system, messages: anthropicMessages } = toAnthropicFormat(messages);
      const stream = client.messages.stream({
        model,
        max_tokens: 4096,
        system,
        messages: anthropicMessages,
      });

      stream.on('text', (text) => {
        fullText += text;
        sendSSE(res, { type: 'delta', content: text });
      });

      const message = await stream.finalMessage();
      if (message.usage) {
        usage = {
          promptTokens: message.usage.input_tokens,
          completionTokens: message.usage.output_tokens,
          totalTokens: (message.usage.input_tokens || 0) + (message.usage.output_tokens || 0),
        };
      }
    } else if (isGeminiModel(model)) {
      const client = getGeminiClient();
      const { systemInstruction, contents } = toGeminiFormat(messages);

      const genModel = client.getGenerativeModel({
        model,
        systemInstruction: systemInstruction || undefined,
      });

      const generationConfig = model.includes('gemini-3')
        ? { thinkingConfig: { thinkingLevel: 'low' } }
        : {};

      const streamResult = await genModel.generateContentStream({
        contents,
        generationConfig,
      });

      for await (const chunk of streamResult.stream) {
        const delta = chunk.text();
        if (delta) {
          fullText += delta;
          sendSSE(res, { type: 'delta', content: delta });
        }
      }

      // Get final usage from aggregated response
      const finalResponse = await streamResult.response;
      if (finalResponse.usageMetadata) {
        usage = {
          promptTokens: finalResponse.usageMetadata.promptTokenCount || 0,
          completionTokens: finalResponse.usageMetadata.candidatesTokenCount || 0,
          totalTokens: finalResponse.usageMetadata.totalTokenCount || 0,
        };
      }
    } else {
      const client = getOpenAIClient();
      const stream = await client.chat.completions.create({
        model,
        max_tokens: 4096,
        temperature: 0.3,
        messages,
        stream: true,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content;
        if (delta) {
          fullText += delta;
          sendSSE(res, { type: 'delta', content: delta });
        }
        if (chunk.usage) {
          usage = {
            promptTokens: chunk.usage.prompt_tokens,
            completionTokens: chunk.usage.completion_tokens,
            totalTokens: chunk.usage.total_tokens,
          };
        }
      }
    }

    if (!fullText) {
      sendSSE(res, { type: 'error', error: 'No content received from AI' });
      return res.end();
    }

    const { code: codeWithoutReply, assistantReply, tags } = extractAssistantReply(fullText);
    let cleanedCode = cleanCodeResponse(codeWithoutReply);
    cleanedCode = replaceBrokenPlaceholderUrls(cleanedCode);

    console.log(`[AI] Stream complete, ${cleanedCode.length} characters, tags:`, tags);

    sendSSE(res, {
      type: 'done',
      code: cleanedCode,
      assistantReply: assistantReply || null,
      tags: tags || [],
      usage,
    });
    res.end();
  } catch (error) {
    console.error('[AI] Stream error:', error);
    const message = error?.message || 'Failed to generate UI';
    sendSSE(res, { type: 'error', error: message });
    res.end();
  }
}

/**
 * Generate UI code from a wireframe image
 * POST /api/generate
 */
export async function generateUI(req, res) {
  try {
    const { image, history, feedback, currentCode, model: requestedModel } = req.body;
    const model = requestedModel || 'gpt-4o';

    console.log('[AI] Request received:', {
      modelFromBody: requestedModel,
      modelResolved: model,
      isClaude: isClaudeModel(model),
      hasImage: !!image,
      hasFeedback: !!feedback,
      hasCurrentCode: !!currentCode,
    });

    // Validation
    if (!image && !feedback) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field',
        details: 'Either "image" (base64 string) or "feedback" with "currentCode" is required'
      });
    }

    // Determine request type: text iteration, iterative drawing (image+code), or initial generation
    const isTextIteration = Boolean(feedback && currentCode);
    const isIterativeDrawing = Boolean(image && currentCode && !feedback);

    // Build messages array
    let messages = [
      {
        role: "system",
        content: (isTextIteration || isIterativeDrawing) ? ITERATION_PROMPT : SYSTEM_PROMPT
      }
    ];

    // Add history if provided (for context in multi-turn conversations)
    if (history && Array.isArray(history)) {
      // Keep only last 4 messages (2 full turns) to control context cost
      // Full history grows unboundedly — at turn 5 you're paying for 12k+ tokens of history
      const trimmedHistory = history.slice(-4);
      messages = messages.concat(trimmedHistory);
    }

    // Add the appropriate user message
    if (isTextIteration) {
      messages = messages.concat(buildIterationMessage(currentCode, feedback));
    } else if (isIterativeDrawing) {
      messages = messages.concat(buildRegenerateFromDrawingMessage(image, currentCode));
    } else {
      messages = messages.concat(buildInitialMessage(image));
    }

    const logType = isTextIteration ? 'iteration' : isIterativeDrawing ? 'iterative-drawing' : 'generation';
    console.log(`[AI] Processing ${logType} request with model: ${model}`);

    let generatedCode;
    let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

    if (isClaudeModel(model)) {
      const client = getAnthropicClient();
      const { system, messages: anthropicMessages } = toAnthropicFormat(messages);
      const response = await client.messages.create({
        model,
        max_tokens: 4096,
        system,
        messages: anthropicMessages,
      });
      const textBlock = response.content?.find((b) => b.type === 'text');
      generatedCode = textBlock?.text;
      if (response.usage) {
        usage = {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: (response.usage.input_tokens || 0) + (response.usage.output_tokens || 0),
        };
      }
    } else if (isGeminiModel(model)) {
      const client = getGeminiClient();
      const { systemInstruction, contents } = toGeminiFormat(messages);

      const genModel = client.getGenerativeModel({
        model,
        systemInstruction: systemInstruction || undefined,
      });

      const generationConfig = model.includes('gemini-3')
        ? { thinkingConfig: { thinkingLevel: 'low' } }
        : {};

      const result = await genModel.generateContent({
        contents,
        generationConfig,
      });
      generatedCode = result.response.text();
      if (result.response.usageMetadata) {
        usage = {
          promptTokens: result.response.usageMetadata.promptTokenCount || 0,
          completionTokens: result.response.usageMetadata.candidatesTokenCount || 0,
          totalTokens: result.response.usageMetadata.totalTokenCount || 0,
        };
      }
    } else {
      const client = getOpenAIClient();
      const completion = await client.chat.completions.create({
        model,
        max_tokens: 4096,
        temperature: 0.3,
        messages,
      });
      generatedCode = completion.choices[0]?.message?.content;
      if (completion.usage) {
        usage = {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        };
      }
    }

    if (!generatedCode) {
      throw new Error('No content received from AI');
    }

    const { code: codeWithoutReply, assistantReply, tags } = extractAssistantReply(generatedCode);
    let cleanedCode = cleanCodeResponse(codeWithoutReply);
    cleanedCode = replaceBrokenPlaceholderUrls(cleanedCode);

    console.log(`[AI] Successfully generated ${cleanedCode.length} characters of code`);

    return res.json({
      success: true,
      code: cleanedCode,
      assistantReply: assistantReply || null,
      tags: tags || [],
      usage,
    });

  } catch (error) {
    console.error('[AI] Generation error:', error);

    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      const statusCode = error.status || 500;

      if (error.status === 401) {
        return res.status(401).json({
          success: false,
          error: 'Invalid API key',
          details: 'Please check your OpenAI API key configuration'
        });
      }

      if (error.status === 429) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          details: 'Too many requests. Please try again later.'
        });
      }

      if (error.status === 400) {
        return res.status(400).json({
          success: false,
          error: 'Invalid request',
          details: error.message
        });
      }

      return res.status(statusCode).json({
        success: false,
        error: 'OpenAI API error',
        details: error.message
      });
    }

    // Generic error handler
    return res.status(500).json({
      success: false,
      error: 'Failed to generate UI',
      details: error.message
    });
  }
}

/**
 * Health check for the AI service
 * GET /api/health
 */
export async function healthCheck(req, res) {
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);

  return res.json({
    status: 'ok',
    service: 'sketch2code-ai',
    timestamp: new Date().toISOString(),
    openai: {
      configured: hasOpenAI,
      keyPrefix: hasOpenAI ? process.env.OPENAI_API_KEY.substring(0, 7) + '...' : null
    },
    anthropic: {
      configured: hasAnthropic,
      keyPrefix: hasAnthropic ? process.env.ANTHROPIC_API_KEY.substring(0, 7) + '...' : null
    },
    gemini: {
      configured: hasGemini,
      keyPrefix: hasGemini ? process.env.GEMINI_API_KEY.substring(0, 7) + '...' : null
    }
  });
}

/**
 * Replace via.placeholder.com URLs with picsum.photos (via.placeholder causes ERR_NAME_NOT_RESOLVED)
 * @param {string} code - The code that may contain via.placeholder.com URLs
 * @returns {string} Code with placeholder URLs replaced
 */
function replaceBrokenPlaceholderUrls(code) {
  return code.replace(
    /https:\/\/via\.placeholder\.com\/(\d+)(?:x(\d+))?(?:\?[^"'\s]*)?/gi,
    (_, w, h) => {
      const width = parseInt(w, 10) || 400;
      const height = h ? parseInt(h, 10) : width;
      return `https://picsum.photos/${width}/${height}`;
    }
  );
}

/**
 * Extract ASSISTANT_REPLY and TAGS from AI response if present
 * @param {string} raw - Raw AI response
 * @returns {{ code: string, assistantReply: string | null, tags: string[] }}
 */
function extractAssistantReply(raw) {
  let code = raw;
  let assistantReply = null;
  let tags = [];

  // Extract TAGS: tag1,tag2,tag3
  const tagsMatch = raw.match(/\s*<!--\s*TAGS:\s*([\s\S]*?)\s*-->/);
  if (tagsMatch) {
    const tagStr = tagsMatch[1].trim();
    tags = tagStr
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);
    code = code.replace(/\s*<!--\s*TAGS:[\s\S]*?-->\s*/, '').trim();
  }

  // Extract ASSISTANT_REPLY
  const replyMatch = code.match(/\s*<!--\s*ASSISTANT_REPLY:\s*([\s\S]*?)\s*-->\s*$/);
  if (replyMatch) {
    assistantReply = replyMatch[1].trim() || null;
    code = code.replace(/\s*<!--\s*ASSISTANT_REPLY:[\s\S]*?-->\s*$/, '').trim();
  }

  return { code, assistantReply, tags };
}

/**
 * Clean up code response by removing markdown formatting and explanatory text
 * @param {string} code - The raw code from OpenAI
 * @returns {string} Cleaned code
 */
function cleanCodeResponse(code) {
  let cleaned = code.trim();

  // Check if response contains markdown code blocks
  const codeBlockMatch = cleaned.match(/```(?:jsx|tsx|javascript|typescript|react|js)?\n([\s\S]*?)```/);

  if (codeBlockMatch) {
    // Extract just the code from inside the code block
    cleaned = codeBlockMatch[1].trim();
  } else if (cleaned.startsWith('```')) {
    // Fallback: Remove opening ``` with optional language tag
    cleaned = cleaned.replace(/^```(?:jsx|tsx|javascript|typescript|react|js)?\n?/, '');
    // Remove closing ```
    cleaned = cleaned.replace(/\n?```$/, '');
  }

  // Remove any leading explanatory text before "import" or "export" or "const" or "function"
  const codeStartMatch = cleaned.match(/^[\s\S]*?((?:import|export|const|function|\/\/|\/\*)\s)/);
  if (codeStartMatch && codeStartMatch.index !== undefined && codeStartMatch.index > 0) {
    // There's text before the actual code, find where the code starts
    const importIndex = cleaned.indexOf('import ');
    const exportIndex = cleaned.indexOf('export ');
    const constIndex = cleaned.indexOf('const ');
    const functionIndex = cleaned.indexOf('function ');
    const commentIndex = cleaned.indexOf('//');
    const multiCommentIndex = cleaned.indexOf('/*');

    // Find the earliest code indicator
    const indices = [importIndex, exportIndex, constIndex, functionIndex, commentIndex, multiCommentIndex]
      .filter(i => i !== -1);

    if (indices.length > 0) {
      const startIndex = Math.min(...indices);
      if (startIndex > 0) {
        cleaned = cleaned.substring(startIndex);
      }
    }
  }

  return cleaned.trim();
}

