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

const SYSTEM_PROMPT = `You are an expert ATS resume analyzer and career coach.

Analyze the provided resume against the job description and return ONLY a valid JSON object with this exact structure:

{
  "score": <integer 0-100, overall ATS keyword and relevance match>,
  "matchedKeywords": [<5-15 specific technical/role keywords found in both documents>],
  "missingKeywords": [<5-10 important keywords from the job description absent from the resume>],
  "suggestions": [
    {
      "id": "1",
      "category": "Experience",
      "text": "<a rewritten or new bullet point, action-verb led and quantified, optimized for this role>"
    },
    {
      "id": "2",
      "category": "Skills",
      "text": "<a single skill, tool, or technology from the job description to add>"
    },
    {
      "id": "3",
      "category": "Education",
      "text": "<an education line or coursework suggestion relevant to this role>"
    }
  ]
}

Guidelines:
- score: Base it on keyword density, skills match, and experience alignment (0 = no match, 100 = perfect).
- matchedKeywords: Exact technical terms, tools, or role-specific phrases found in both documents.
- missingKeywords: High-value keywords from the job description completely absent from the resume.
- suggestions: Return 3-5 Experience items, 4-8 Skills items, and 1-2 Education items (skip Education if not relevant). Each suggestion must have a unique incremental id.
- Do not include any text outside the JSON object.`;

export async function analyzeResume(params: {
  resumeText: string;
  jobDescription: string;
  apiKey: string;
}): Promise<AnalyzeResult> {
  const { resumeText, jobDescription, apiKey } = params;

  const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/resume/analyze`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText,
        jobDescription,
        apiKey,
      }),
    });
  } catch {
    throw new Error('Could not reach the server. Check your internet connection.');
  }

  if (!response.ok) {
    let message = 'An unexpected error occurred.';
    try {
      const body = await response.json();
      message = body?.error ?? message;
    } catch {}

    if (response.status === 401)
      throw new Error('Invalid API key. Please check and re-enter.');
    if (response.status === 429)
      throw new Error('Rate limit reached. Please wait a moment and try again.');
    throw new Error(message);
  }

  try {
    const data = (await response.json()) as Partial<AnalyzeResult>;
    return {
      score: typeof data.score === 'number' ? data.score : 0,
      message: data.message,
      matchedKeywords: Array.isArray(data.matchedKeywords) ? data.matchedKeywords : [],
      missingKeywords: Array.isArray(data.missingKeywords) ? data.missingKeywords : [],
      keywordFrequency: Array.isArray(data.keywordFrequency) ? data.keywordFrequency : [],
      suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    };
  } catch {
    throw new Error('Failed to parse AI response. Please try again.');
  }
}
