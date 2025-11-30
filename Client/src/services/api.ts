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
}

/**
 * Generate UI code from a wireframe image
 */
export async function generateUI(request: GenerateRequest): Promise<GenerateResponse> {
  try {
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
  feedback: string
): Promise<GenerateResponse> {
  return generateUI({
    feedback,
    currentCode,
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

