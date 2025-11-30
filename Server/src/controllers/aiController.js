import OpenAI from 'openai';
import {
  SYSTEM_PROMPT,
  ITERATION_PROMPT,
  buildInitialMessage,
  buildIterationMessage
} from '../utils/prompts.js';

// Initialize OpenAI client lazily to avoid startup errors
let openai = null;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured. Please add it to your .env file.');
  }

  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return openai;
}

/**
 * Generate UI code from a wireframe image
 * POST /api/generate
 */
export async function generateUI(req, res) {
  try {
    const { image, history, feedback, currentCode } = req.body;

    // Validation
    if (!image && !feedback) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field',
        details: 'Either "image" (base64 string) or "feedback" with "currentCode" is required'
      });
    }

    // Determine if this is an iteration or initial generation
    const isIteration = Boolean(feedback && currentCode);

    // Build messages array
    let messages = [
      {
        role: "system",
        content: isIteration ? ITERATION_PROMPT : SYSTEM_PROMPT
      }
    ];

    // Add history if provided (for context in multi-turn conversations)
    if (history && Array.isArray(history)) {
      messages = messages.concat(history);
    }

    // Add the appropriate user message
    if (isIteration) {
      messages = messages.concat(buildIterationMessage(currentCode, feedback));
    } else {
      messages = messages.concat(buildInitialMessage(image));
    }

    console.log(`[AI] Processing ${isIteration ? 'iteration' : 'generation'} request...`);

    // Get OpenAI client (throws if not configured)
    const client = getOpenAIClient();

    // Call OpenAI API with high token limit for complex UI layouts
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 16384,
      temperature: 0.3, // Low temperature for consistent, high-quality output
      top_p: 0.95,
      messages: messages
    });

    // Extract the generated code
    const generatedCode = completion.choices[0]?.message?.content;

    if (!generatedCode) {
      throw new Error('No content received from OpenAI');
    }

    // Clean up the response (remove any accidental markdown code blocks)
    const cleanedCode = cleanCodeResponse(generatedCode);

    console.log(`[AI] Successfully generated ${cleanedCode.length} characters of code`);

    // Return success response
    return res.json({
      success: true,
      code: cleanedCode,
      usage: {
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens
      }
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
  const hasApiKey = Boolean(process.env.OPENAI_API_KEY);

  return res.json({
    status: 'ok',
    service: 'sketch2code-ai',
    timestamp: new Date().toISOString(),
    openai: {
      configured: hasApiKey,
      keyPrefix: hasApiKey ? process.env.OPENAI_API_KEY.substring(0, 7) + '...' : null
    }
  });
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

