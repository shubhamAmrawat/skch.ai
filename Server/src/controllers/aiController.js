import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
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

function isClaudeModel(model) {
  return model && String(model).startsWith('claude-');
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
      messages = messages.concat(history);
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
        max_tokens: 16384,
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
    } else {
      const client = getOpenAIClient();
      const completion = await client.chat.completions.create({
        model,
        max_tokens: 16384,
        temperature: 0.3,
        top_p: 0.95,
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

    const { code: codeWithoutReply, assistantReply } = extractAssistantReply(generatedCode);
    let cleanedCode = cleanCodeResponse(codeWithoutReply);
    cleanedCode = replaceBrokenPlaceholderUrls(cleanedCode);

    console.log(`[AI] Successfully generated ${cleanedCode.length} characters of code`);

    return res.json({
      success: true,
      code: cleanedCode,
      assistantReply: assistantReply || null,
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
 * Extract ASSISTANT_REPLY from AI response if present
 * @param {string} raw - Raw AI response
 * @returns {{ code: string, assistantReply: string | null }}
 */
function extractAssistantReply(raw) {
  const match = raw.match(/\s*<!--\s*ASSISTANT_REPLY:\s*([\s\S]*?)\s*-->\s*$/);
  if (match) {
    const summary = match[1].trim();
    const code = raw.replace(/\s*<!--\s*ASSISTANT_REPLY:[\s\S]*?-->\s*$/, '').trim();
    return { code, assistantReply: summary || null };
  }
  return { code: raw, assistantReply: null };
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

