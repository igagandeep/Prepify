import { api } from './client';

export interface Suggestion {
  id: string;
  category: 'Experience' | 'Skills' | 'Education' | 'Summary';
  text: string;
}

export interface KeywordFrequency {
  keyword: string;
  jobDescriptionCount: number;
  resumeCount: number;
}

export interface AnalyzeResult {
  score: number;
  message?: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  keywordFrequency: KeywordFrequency[];
  suggestions: Suggestion[];
}

export async function analyzeResume(params: {
  resumeText: string;
  jobDescription: string;
  apiKey: string;
}): Promise<AnalyzeResult> {
  const { resumeText, jobDescription, apiKey } = params;

  const data = await api.post<Partial<AnalyzeResult>>('/api/resume/analyze', {
    resumeText,
    jobDescription,
    apiKey,
  });

  return {
    score: typeof data.score === 'number' ? data.score : 0,
    message: data.message,
    matchedKeywords: Array.isArray(data.matchedKeywords) ? data.matchedKeywords : [],
    missingKeywords: Array.isArray(data.missingKeywords) ? data.missingKeywords : [],
    keywordFrequency: Array.isArray(data.keywordFrequency) ? data.keywordFrequency : [],
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
  };
}
