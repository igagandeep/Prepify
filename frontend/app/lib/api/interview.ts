import axios from 'axios';

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

const interviewClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 45000, // AI calls can take a while
});

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

// ─── API functions ────────────────────────────────────────────────────────────

export async function apiStartInterview(
  req: StartInterviewRequest,
): Promise<StartInterviewResponse> {
  const res = await interviewClient.post<StartInterviewResponse>(
    '/api/interview/start',
    req,
  );
  return res.data;
}

export async function apiEvaluateAnswer(
  req: EvaluateAnswerRequest,
): Promise<LiveFeedback> {
  const res = await interviewClient.post<LiveFeedback>('/api/interview/answer', req);
  return res.data;
}

export async function apiCompleteInterview(
  req: CompleteInterviewRequest,
): Promise<CompleteInterviewResponse> {
  const res = await interviewClient.post<CompleteInterviewResponse>(
    '/api/interview/complete',
    req,
  );
  return res.data;
}

// ─── Error helper (call from components) ──────────────────────────────────────

export function extractInterviewError(err: unknown): string {
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
