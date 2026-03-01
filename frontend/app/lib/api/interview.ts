// ─── Request / Response types ─────────────────────────────────────────────────

export interface StartInterviewRequest {
  role: string;
  type: string;
  questionCount: number;
  difficulty: string;
  apiKey: string;
}

export interface StartInterviewResponse {
  sessionId: string;
  introduction: string;
  questions: string[];
}

export interface EvaluateAnswerRequest {
  sessionId: string;
  questionIndex: number;
  question: string;
  answer: string;
  apiKey: string;
}

export interface LiveFeedback {
  accuracy: 'High' | 'Medium' | 'Low';
  clarity: 'High' | 'Medium' | 'Low';
  strengths: string[];
  improvements: string[];
  score: number;
}

export interface CompleteInterviewRequest {
  sessionId: string;
  role: string;
  answers: string[];
  feedbacks: LiveFeedback[];
  apiKey: string;
}

export interface CompleteInterviewResponse {
  overallScore: number; // 1.0–10.0
  summary: string;
  topStrengths: string[];
  areasToImprove: string[];
  recommendation: string;
}

// ─── Base URL ─────────────────────────────────────────────────────────────────

const isElectron =
  typeof window !== 'undefined' &&
  navigator.userAgent.toLowerCase().includes('electron');

const isDevelopment =
  process.env.NODE_ENV === 'development' ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost');

const BASE_URL =
  isElectron || isDevelopment
    ? 'http://localhost:5000'
    : 'https://prepify-7vah.onrender.com';

// ─── API functions ────────────────────────────────────────────────────────────

export async function apiStartInterview(
  req: StartInterviewRequest,
): Promise<StartInterviewResponse> {
  const url = `${BASE_URL}/api/interview/start`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
  } catch {
    throw new Error('Cannot reach the server. Make sure the backend is running on port 5000.');
  }

  if (!response.ok) {
    let message = 'An unexpected error occurred.';
    try {
      const body = await response.json();
      message = body?.error ?? message;
    } catch {}

    if (response.status === 401)
      throw new Error('Invalid API key. Please check and re-enter.');
    if (response.status === 503)
      throw new Error('AI service temporarily unavailable. Please try again.');
    throw new Error(message);
  }

  try {
    return await response.json();
  } catch {
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

export async function apiEvaluateAnswer(
  req: EvaluateAnswerRequest,
): Promise<LiveFeedback> {
  const url = `${BASE_URL}/api/interview/answer`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
  } catch {
    throw new Error('Cannot reach the server. Make sure the backend is running on port 5000.');
  }

  if (!response.ok) {
    let message = 'An unexpected error occurred.';
    try {
      const body = await response.json();
      message = body?.error ?? message;
    } catch {}

    if (response.status === 401)
      throw new Error('Invalid API key. Please check and re-enter.');
    if (response.status === 503)
      throw new Error('AI service temporarily unavailable. Please try again.');
    throw new Error(message);
  }

  try {
    return await response.json();
  } catch {
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

export async function apiCompleteInterview(
  req: CompleteInterviewRequest,
): Promise<CompleteInterviewResponse> {
  const url = `${BASE_URL}/api/interview/complete`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
  } catch {
    throw new Error('Cannot reach the server. Make sure the backend is running on port 5000.');
  }

  if (!response.ok) {
    let message = 'An unexpected error occurred.';
    try {
      const body = await response.json();
      message = body?.error ?? message;
    } catch {}

    if (response.status === 401)
      throw new Error('Invalid API key. Please check and re-enter.');
    if (response.status === 503)
      throw new Error('AI service temporarily unavailable. Please try again.');
    throw new Error(message);
  }

  try {
    return await response.json();
  } catch {
    throw new Error('Failed to parse AI response. Please try again.');
  }
}

// ─── Error helper (call from components) ──────────────────────────────────────

export function extractInterviewError(err: unknown): string {
  // If it's an Error, use its message
  if (err instanceof Error) {
    return err.message;
  }
  // Support legacy axios error structure
  if (err && typeof err === 'object' && 'response' in err) {
    const e = err as {
      response?: { data?: { error?: string }; status?: number };
      code?: string;
    };
    if (e.response?.data?.error) return e.response.data.error;
    if (e.response?.status === 401)
      return 'Invalid API key. Please check and re-enter.';
    if (e.response?.status === 503)
      return 'AI service temporarily unavailable. Please try again.';
    if (e.code === 'ECONNREFUSED' || e.code === 'ERR_NETWORK')
      return 'Cannot reach the server. Make sure the backend is running on port 5000.';
  }
  return 'Something went wrong. Please try again.';
}
