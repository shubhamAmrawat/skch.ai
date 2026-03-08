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
  stream?: boolean;
}

export interface GenerateStreamCallbacks {
  onDelta: (chunk: string) => void;
  onDone: (result: {
    code: string;
    assistantReply?: string | null;
    tags?: string[];
    usage?: GenerateResponse['usage'];
  }) => void;
  onError: (error: string) => void;
}

/**
 * Generate UI code with streaming (SSE).
 * Calls onDelta for each chunk, onDone with final post-processed result, or onError on failure.
 */
export async function generateUIStreaming(
  request: GenerateRequest,
  callbacks: GenerateStreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const body = { ...request, stream: true };
  const response = await fetch(`${API_BASE_URL}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    let errorMessage = 'Failed to generate UI';
    try {
      const data = await response.json();
      errorMessage = data.details || data.error || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    callbacks.onError(errorMessage);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.onError('No response body');
    return;
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6);
          if (jsonStr === '[DONE]' || jsonStr.trim() === '') continue;
          try {
            const data = JSON.parse(jsonStr);
            if (data.type === 'delta' && typeof data.content === 'string') {
              callbacks.onDelta(data.content);
            } else if (data.type === 'done') {
              callbacks.onDone({
                code: data.code ?? '',
                assistantReply: data.assistantReply ?? null,
                tags: data.tags ?? [],
                usage: data.usage,
              });
              return;
            } else if (data.type === 'error') {
              callbacks.onError(data.error ?? 'Unknown error');
              return;
            }
          } catch {
            // Ignore parse errors for malformed chunks
          }
        }
      }
    }
    // Stream ended without done event
    callbacks.onError('Stream ended unexpectedly');
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return; // Cancelled, no need to call onError
    }
    callbacks.onError(err instanceof Error ? err.message : 'Stream error');
  }
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

