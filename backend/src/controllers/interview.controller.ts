import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import Groq from 'groq-sdk';

const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

// ─── Shared helpers ───────────────────────────────────────────────────────────

/** Strip markdown code fences the model sometimes wraps JSON in. */
function stripMarkdown(content: string): string {
  return content.replace(/```json|```/g, '').trim();
}

/** Parse AI output, stripping fences first. Throws SyntaxError on bad JSON. */
function parseAI(content: string): unknown {
  return JSON.parse(stripMarkdown(content));
}

/**
 * Centralised Groq error → HTTP response mapping.
 * Must be called as the last statement in a catch block.
 */
function handleGroqError(err: unknown, res: Response): void {
  if (err instanceof Groq.AuthenticationError) {
    res.status(401).json({ error: 'Invalid Groq API key.' });
    return;
  }
  if (err instanceof Groq.RateLimitError) {
    res.status(503).json({ error: 'AI service temporarily unavailable. Please try again.' });
    return;
  }
  if (err instanceof Groq.APIError) {
    res.status(503).json({ error: 'AI service temporarily unavailable. Please try again.' });
    return;
  }
  if (err instanceof SyntaxError) {
    res.status(500).json({ error: 'Failed to parse AI response.' });
    return;
  }
  console.error('Unexpected interview error:', err);
  res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
}

/** Validate that a value is one of the three rating strings. */
const RATINGS = ['High', 'Medium', 'Low'] as const;
type Rating = (typeof RATINGS)[number];
function isRating(v: unknown): v is Rating {
  return typeof v === 'string' && (RATINGS as readonly string[]).includes(v);
}

// ─── 1. POST /api/interview/start ─────────────────────────────────────────────

export const startInterview = async (req: Request, res: Response): Promise<void> => {
  const { role, type, questionCount, difficulty, apiKey } = req.body as {
    role?: string;
    type?: string;
    questionCount?: unknown;
    difficulty?: string;
    apiKey?: string;
  };

  if (!apiKey?.trim()) {
    res.status(400).json({ error: 'API key is required.' });
    return;
  }

  const missing: string[] = [];
  if (!role?.trim()) missing.push('role');
  if (!type?.trim()) missing.push('type');
  if (!questionCount) missing.push('questionCount');
  if (!difficulty?.trim()) missing.push('difficulty');
  if (missing.length) {
    res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    return;
  }

  const count = Number(questionCount);

  const systemPrompt = `You are a professional interviewer conducting a ${difficulty}-difficulty ${type} interview for a ${role} position.
Return ONLY a raw JSON object — no markdown, no code blocks, no extra text outside the JSON.
The JSON must have exactly this shape:
{
  "introduction": "<a warm, professional 2-3 sentence introduction explaining the session context and what to expect>",
  "questions": ["<question 1>", "<question 2>", ..., "<question ${count}>"]
}

Generate exactly ${count} interview questions appropriate for:
- Role: ${role}
- Type: ${type} (Technical = algorithms/system-design/coding concepts; Behavioral = situational/competency; Mixed = alternate both)
- Difficulty: ${difficulty} (Easy = foundational; Medium = practical experience; Hard = senior/complex)

Questions must be specific to the role and varied — no duplicates.`;

  const userPrompt = `Generate ${count} ${difficulty} ${type} interview questions for a ${role} position. Return only the raw JSON object.`;

  try {
    const groq = new Groq({ apiKey });
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const content = response.choices[0]?.message?.content ?? '';
    const parsed = parseAI(content) as {
      introduction?: unknown;
      questions?: unknown;
    };

    if (
      typeof parsed.introduction !== 'string' ||
      !parsed.introduction.trim() ||
      !Array.isArray(parsed.questions) ||
      parsed.questions.length === 0 ||
      !parsed.questions.every((q) => typeof q === 'string' && q.trim())
    ) {
      console.error('[interview/start] Invalid AI shape:', parsed);
      res.status(500).json({ error: 'Failed to parse AI response.' });
      return;
    }

    res.json({
      sessionId: randomUUID(),
      introduction: parsed.introduction.trim(),
      questions: (parsed.questions as string[]).map((q) => q.trim()),
    });
  } catch (err) {
    handleGroqError(err, res);
  }
};

// ─── 2. POST /api/interview/answer ────────────────────────────────────────────

export const evaluateAnswer = async (req: Request, res: Response): Promise<void> => {
  const { sessionId, questionIndex, question, answer, apiKey } = req.body as {
    sessionId?: string;
    questionIndex?: unknown;
    question?: string;
    answer?: string;
    apiKey?: string;
  };

  if (!apiKey?.trim()) {
    res.status(400).json({ error: 'API key is required.' });
    return;
  }

  const missing: string[] = [];
  if (!sessionId?.trim()) missing.push('sessionId');
  if (questionIndex === undefined || questionIndex === null) missing.push('questionIndex');
  if (!question?.trim()) missing.push('question');
  if (!answer?.trim()) missing.push('answer');
  if (missing.length) {
    res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    return;
  }

  const systemPrompt = `You are a strict but fair interview evaluator assessing a candidate's answer.
Return ONLY a raw JSON object — no markdown, no code blocks, no extra text outside the JSON.
The JSON must have exactly this shape:
{
  "accuracy": "<High | Medium | Low>",
  "clarity": "<High | Medium | Low>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "score": <integer 1–10>
}

Rules:
- accuracy and clarity must be EXACTLY one of: "High", "Medium", "Low"
- strengths: 2–3 short, specific, positive observations about the answer
- improvements: 2–3 short, actionable suggestions for what could be better
- score: a single integer between 1 and 10 reflecting overall answer quality`;

  const userPrompt = `Interview question: ${question}\n\nCandidate's answer: ${answer}\n\nEvaluate this answer and return only the raw JSON object.`;

  try {
    const groq = new Groq({ apiKey });
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const content = response.choices[0]?.message?.content ?? '';
    const parsed = parseAI(content) as {
      accuracy?: unknown;
      clarity?: unknown;
      strengths?: unknown;
      improvements?: unknown;
      score?: unknown;
    };

    if (
      !isRating(parsed.accuracy) ||
      !isRating(parsed.clarity) ||
      !Array.isArray(parsed.strengths) ||
      !Array.isArray(parsed.improvements) ||
      typeof parsed.score !== 'number' ||
      !Number.isInteger(parsed.score) ||
      parsed.score < 1 ||
      parsed.score > 10
    ) {
      console.error('[interview/answer] Invalid AI shape:', parsed);
      res.status(500).json({ error: 'Failed to parse AI response.' });
      return;
    }

    res.json({
      accuracy: parsed.accuracy,
      clarity: parsed.clarity,
      strengths: (parsed.strengths as unknown[])
        .filter((s): s is string => typeof s === 'string')
        .slice(0, 3)
        .map((s) => s.trim()),
      improvements: (parsed.improvements as unknown[])
        .filter((s): s is string => typeof s === 'string')
        .slice(0, 3)
        .map((s) => s.trim()),
      score: parsed.score,
    });
  } catch (err) {
    handleGroqError(err, res);
  }
};

// ─── 3. POST /api/interview/complete ──────────────────────────────────────────

export const completeInterview = async (req: Request, res: Response): Promise<void> => {
  const { sessionId, role, answers, feedbacks, apiKey } = req.body as {
    sessionId?: string;
    role?: string;
    answers?: unknown;
    feedbacks?: unknown;
    apiKey?: string;
  };

  if (!apiKey?.trim()) {
    res.status(400).json({ error: 'API key is required.' });
    return;
  }

  const missing: string[] = [];
  if (!sessionId?.trim()) missing.push('sessionId');
  if (!role?.trim()) missing.push('role');
  if (!Array.isArray(answers) || answers.length === 0) missing.push('answers');
  if (!Array.isArray(feedbacks) || feedbacks.length === 0) missing.push('feedbacks');
  if (missing.length) {
    res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    return;
  }

  const feedbackList = feedbacks as Array<{ score?: unknown; accuracy?: unknown; clarity?: unknown }>;

  // Build a human-readable per-question summary for the prompt
  const feedbackSummary = feedbackList
    .map(
      (f, i) =>
        `Q${i + 1}: Score ${f.score ?? '?'}/10, Accuracy: ${f.accuracy ?? '?'}, Clarity: ${f.clarity ?? '?'}`,
    )
    .join('\n');

  const avgScore =
    feedbackList.reduce((sum, f) => sum + (typeof f.score === 'number' ? f.score : 0), 0) /
    feedbackList.length;

  const systemPrompt = `You are a senior hiring manager giving a final debrief to a candidate who just completed a ${role} interview.
Return ONLY a raw JSON object — no markdown, no code blocks, no extra text outside the JSON.
The JSON must have exactly this shape:
{
  "overallScore": <float 1.0–10.0, one decimal place>,
  "summary": "<2-3 sentence paragraph summarising overall performance>",
  "topStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areasToImprove": ["<area 1>", "<area 2>", "<area 3>"],
  "recommendation": "<single concise sentence, e.g. 'Ready for mid-level interviews'>"
}

Rules:
- overallScore must be a float between 1.0 and 10.0
- topStrengths and areasToImprove: 2–4 short, specific strings each
- recommendation: one sentence only, no period-separated clauses`;

  const userPrompt = `Role: ${role}
Average per-question score: ${avgScore.toFixed(1)}/10

Per-question breakdown:
${feedbackSummary}

Provide the final interview feedback as a raw JSON object only.`;

  try {
    const groq = new Groq({ apiKey });
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const content = response.choices[0]?.message?.content ?? '';
    const parsed = parseAI(content) as {
      overallScore?: unknown;
      summary?: unknown;
      topStrengths?: unknown;
      areasToImprove?: unknown;
      recommendation?: unknown;
    };

    if (
      typeof parsed.overallScore !== 'number' ||
      typeof parsed.summary !== 'string' ||
      !parsed.summary.trim() ||
      !Array.isArray(parsed.topStrengths) ||
      !Array.isArray(parsed.areasToImprove) ||
      typeof parsed.recommendation !== 'string' ||
      !parsed.recommendation.trim()
    ) {
      console.error('[interview/complete] Invalid AI shape:', parsed);
      res.status(500).json({ error: 'Failed to parse AI response.' });
      return;
    }

    const clamped = Math.min(10, Math.max(1, parsed.overallScore));

    res.json({
      overallScore: Math.round(clamped * 10) / 10,
      summary: parsed.summary.trim(),
      topStrengths: (parsed.topStrengths as unknown[])
        .filter((s): s is string => typeof s === 'string')
        .slice(0, 4)
        .map((s) => s.trim()),
      areasToImprove: (parsed.areasToImprove as unknown[])
        .filter((s): s is string => typeof s === 'string')
        .slice(0, 4)
        .map((s) => s.trim()),
      recommendation: parsed.recommendation.trim(),
    });
  } catch (err) {
    handleGroqError(err, res);
  }
};
