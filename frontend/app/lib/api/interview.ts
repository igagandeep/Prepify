import { api } from './client';

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
  overallScore: number;
  summary: string;
  topStrengths: string[];
  areasToImprove: string[];
  recommendation: string;
}

export function apiStartInterview(req: StartInterviewRequest): Promise<StartInterviewResponse> {
  return api.post<StartInterviewResponse>('/api/interview/start', req);
}

export function apiEvaluateAnswer(req: EvaluateAnswerRequest): Promise<LiveFeedback> {
  return api.post<LiveFeedback>('/api/interview/answer', req);
}

export function apiCompleteInterview(req: CompleteInterviewRequest): Promise<CompleteInterviewResponse> {
  return api.post<CompleteInterviewResponse>('/api/interview/complete', req);
}

