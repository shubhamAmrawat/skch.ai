// Use environment variable in production, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Debug: Log to verify environment variable is loaded
if (import.meta.env.DEV) {
  console.log('[API] Environment Variables:', {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    'Using (final)': API_BASE_URL,
    'MODE': import.meta.env.MODE,
  });
}

interface GenerateResponse {
  success: boolean;
  code?: string;
  assistantReply?: string | null;
  error?: string;
  details?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

interface GenerateRequest {
  image?: string;
  feedback?: string;
  currentCode?: string;
  history?: Array<{ role: string; content: string }>;
  model?: string;
}

/**
 * Generate UI code from a wireframe image.
 * For iterative drawing: pass both image and currentCode to refine existing UI based on updated sketch.
 */
export async function generateUI(request: GenerateRequest): Promise<GenerateResponse> {
  try {
    console.log('[API] generateUI request:', {
      model: request.model,
      hasImage: !!request.image,
      hasFeedback: !!request.feedback,
      hasCurrentCode: !!request.currentCode,
      historyLength: request.history?.length ?? 0,
    });
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.details || data.error || 'Failed to generate UI');
    }

    return data;
  } catch (error) {
    console.error('[API] Generate error:', error);
    throw error;
  }
}

/**
 * Iterate on existing code with feedback
 */
export async function iterateUI(
  currentCode: string,
  feedback: string,
  history?: Array<{ role: string; content: string }>,
  model?: string
): Promise<GenerateResponse> {
  return generateUI({
    feedback,
    currentCode,
    history,
    model,
  });
}

/**
 * Check API health
 */
export async function checkHealth(): Promise<{
  status: string;
  openai: { configured: boolean };
}> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
}

