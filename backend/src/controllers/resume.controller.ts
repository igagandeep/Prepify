import { Request, Response } from 'express';
import Groq from 'groq-sdk';

interface Suggestion {
  id: string;
  category: 'Experience' | 'Skills' | 'Education' | 'Summary';
  text: string;
}

interface KeywordFrequency {
  keyword: string;
  jobDescriptionCount: number;
  resumeCount: number;
}

interface AnalyzeResult {
  score: number;
  message?: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  keywordFrequency: KeywordFrequency[];
  suggestions: Suggestion[];
}

const SYSTEM_PROMPT = `You are an expert ATS resume analyzer. Analyze the provided resume against the job description and return ONLY a valid JSON object with this exact structure:

{
  "score": <integer 0-100, ATS match score based on keyword coverage, skills alignment, and experience relevance>,
  "message": "<professional assessment — see MESSAGE rules below>",
  "matchedKeywords": [<10-15 specific keywords found in BOTH documents>],
  "missingKeywords": [<high-value keywords from job description absent from resume>],
  "keywordFrequency": [
    {"keyword": "<keyword>", "jobDescriptionCount": <integer>, "resumeCount": <integer>}
  ],
  "suggestions": [
    {"id": "1", "category": "<Summary|Experience|Skills|Education>", "text": "<copy-pasteable suggestion>"}
  ]
}

SCORING:
- 0 = no match, 100 = perfect and complete match
- If missingKeywords is empty, score must be 100 and suggestions must be empty

MESSAGE (always include):
- Score 100: "Congratulations! Your resume perfectly matches this job description. No additional changes are required."
- Score 80-99: "Your resume is well-aligned with this position. A few targeted improvements could strengthen your candidacy."
- Score below 80: "Your resume needs improvement to better match this role. The suggestions below will help you close the gap."

KEYWORD FREQUENCY:
- List the 10-15 most important keywords from the job description (technical skills, role-specific terms, required tools)
- For each keyword, count exact occurrences (case-insensitive) in the job description AND in the resume
- Include both matched and missing keywords so the UI can display coverage gaps

THE "text" FIELD IS WHAT THE USER WILL COPY AND PASTE DIRECTLY INTO THEIR RESUME. IT MUST CONTAIN ONLY THE CONTENT ITSELF — NO INSTRUCTIONS, NO PREAMBLE, NO QUOTES AROUND IT.

SUGGESTIONS — STRICT RULES:

Skills:
- One suggestion = one skill name, nothing else
- The "text" field must be ONLY the skill name. Examples: "OAuth", "OpenID Connect", "Kubernetes", "Leadership"
- NEVER: "Add the following skills: ...", "Consider adding ...", "You should include ..."
- NEVER bundle multiple skills into one suggestion — one skill per suggestion object
- NEVER use phrases like "Experience with X", "Knowledge of Y", "Certification in Z" — those are not skill names
- Only suggest skills explicitly required by the job description AND completely absent from the resume
- If the resume already has all required skills → return ZERO Skills suggestions

Experience:
- The "text" field must be ONLY the bullet point text the user will paste, starting with an action verb
- NEVER wrap it in: "Add a bullet point that...", "Consider adding...", "You could write..."
- Example of CORRECT text: "Designed and deployed a high-availability authentication system using Python and Kubernetes, reducing latency by 25%"
- Example of WRONG text: "Add a bullet point to your experience section that demonstrates... such as: 'Designed and deployed...'"
- Only suggest if the resume lacks coverage for a specific job requirement
- If existing experience already covers the key requirements well → return ZERO Experience suggestions

Summary:
- Only suggest if the resume has NO existing summary or profile section
- If a summary section already exists → return ZERO Summary suggestions
- When needed: provide 2-3 alternative summaries at most
- The "text" field must be ONLY the summary paragraph itself

Education:
- Only suggest if the job description explicitly requires a degree, certification, or coursework absent from the resume
- If the resume already satisfies education requirements → return ZERO Education suggestions
- The "text" field must be ONLY the degree/certification line itself

GENERAL PRINCIPLE: Only surface what is genuinely missing. If something already matches, do NOT suggest it. Use unique incremental ids (1, 2, 3, …). Do not include any text outside the JSON object.`;


export const analyzeResume = async (req: Request, res: Response) => {
  const { resumeText, jobDescription, apiKey } = req.body as {
    resumeText?: string;
    jobDescription?: string;
    apiKey?: string;
  };

  if (!resumeText?.trim()) {
    res.status(400).json({ error: 'resumeText is required.' });
    return;
  }
  if (!jobDescription?.trim()) {
    res.status(400).json({ error: 'jobDescription is required.' });
    return;
  }
  if (!apiKey?.trim()) {
    res.status(400).json({ error: 'apiKey is required.' });
    return;
  }

  const client = new Groq({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.4,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    console.log('Groq API raw response:', raw);

    // Try to robustly extract a JSON object from the model output.
    const tryParse = (text: string): Partial<AnalyzeResult> | null => {
      try {
        return JSON.parse(text) as Partial<AnalyzeResult>;
      } catch {
        return null;
      }
    };

    let parsed: Partial<AnalyzeResult> | null = null;

    // 1. Direct parse
    parsed = tryParse(raw.trim());

    // 2. If wrapped in markdown code fences (```json ... ```)
    if (!parsed) {
      const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (fenceMatch?.[1]) {
        parsed = tryParse(fenceMatch[1].trim());
      }
    }

    // 3. Fallback: grab text between first "{" and last "}"
    if (!parsed) {
      const firstBrace = raw.indexOf('{');
      const lastBrace = raw.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const candidate = raw.slice(firstBrace, lastBrace + 1);
        parsed = tryParse(candidate);
      }
    }

    if (!parsed) {
      console.error('Failed to parse Groq JSON response:', raw);
      res.status(500).json({
        error: 'Failed to parse AI response. Please try again.',
      });
      return;
    }

    // Normalise and validate the shape before sending to the client
    const clampScore = (value: unknown) =>
      typeof value === 'number' ? Math.min(100, Math.max(0, Math.round(value))) : 0;

    const baseScore = clampScore(parsed.score);

    let matchedKeywords = Array.isArray(parsed.matchedKeywords)
      ? (parsed.matchedKeywords as string[]).filter((k) => typeof k === 'string')
      : [];

    let missingKeywords = Array.isArray(parsed.missingKeywords)
      ? (parsed.missingKeywords as string[]).filter((k) => typeof k === 'string')
      : [];

    const normaliseForSearch = (text: string) =>
      text.toLowerCase().replace(/[\s,.;:()\-]+/g, ' ').trim();

    const normalisedResume = normaliseForSearch(resumeText);
    const isDuplicateOfResume = (text: string) => {
      const normalisedText = normaliseForSearch(text);
      if (normalisedText.length < 20) return false;
      // Exact substring match
      if (normalisedResume.includes(normalisedText)) return true;
      // Near-duplicate: if ≥65% of content words (length > 3) appear in the resume,
      // the topic is already covered and this suggestion adds nothing new.
      const words = normalisedText.split(/\s+/).filter((w) => w.length > 3);
      if (words.length < 5) return false;
      const matchCount = words.filter((w) => normalisedResume.includes(w)).length;
      return matchCount / words.length >= 0.65;
    };

    // If resume already has a summary section, we will strip all Summary suggestions.
    const hasSummaryInResume =
      normalisedResume.length > 200 &&
      (normalisedResume.includes('summary') ||
        (resumeText.trim().length > 400 && normalisedResume.indexOf('experience') > 150));

    // Phrases that are methodologies/statements, not resume Skills section items.
    const nonSkillPhrases = [
      'root cause analysis',
      'system analysis',
      'functional design',
      'technical documentation',
    ];
    const looksLikeNonSkill = (skillText: string) => {
      const n = normaliseForSearch(skillText);
      return nonSkillPhrases.some((phrase) => n === phrase || n.includes(phrase));
    };

    let suggestions = Array.isArray(parsed.suggestions)
      ? (parsed.suggestions as Suggestion[]).filter(
          (s) =>
            s &&
            typeof s.id === 'string' &&
            ['Experience', 'Skills', 'Education', 'Summary'].includes(s.category) &&
            typeof s.text === 'string' &&
            !isDuplicateOfResume(s.text) &&
            !(s.category === 'Summary' && hasSummaryInResume) &&
            !(s.category === 'Skills' && looksLikeNonSkill(s.text)),
        )
      : [];

    // Deduplicate Skills suggestions by normalized text so we don't show the same skill twice.
    const seenSkillNorm = new Set<string>();
    suggestions = suggestions.filter((s) => {
      if (s.category !== 'Skills') return true;
      const n = normaliseForSearch(s.text);
      if (seenSkillNorm.has(n)) return false;
      seenSkillNorm.add(n);
      return true;
    });

    // Sanitize suggestion text: the model sometimes wraps content in instructional
    // sentences instead of returning the raw copy-pasteable value.
    // Skills: split bundled multi-skill sentences into individual skill names.
    // Experience/Summary: extract the actual bullet from any instructional prose.
    const instructionalPrefix = /^(add|consider|include|write|you (could|should|can)|this bullet)\b/i;
    const sanitized: Suggestion[] = [];
    const seenSanitizedSkillNorm = new Set<string>();
    let sanitizedId = 1;

    for (const s of suggestions) {
      if (s.category === 'Skills') {
        const skillTexts: string[] = [];

        if (instructionalPrefix.test(s.text.trim())) {
          // Pull out individually quoted tokens e.g. "Add 'OAuth', 'OpenID Connect'"
          const quoted = [...s.text.matchAll(/['"]([^'"]{1,60})['"]/g)].map((m) => m[1].trim());
          if (quoted.length > 0) {
            skillTexts.push(...quoted);
          } else {
            // Fallback: grab everything after the last colon and split by comma
            const colonIdx = s.text.lastIndexOf(':');
            if (colonIdx !== -1) {
              skillTexts.push(
                ...s.text
                  .slice(colonIdx + 1)
                  .split(',')
                  .map((t) => t.trim().replace(/^['"]|['"]$/g, '')),
              );
            }
          }
        } else {
          // Strip stray wrapping quotes from a plain skill name
          skillTexts.push(s.text.replace(/^['"]|['"]$/g, '').trim());
        }

        for (const skill of skillTexts) {
          if (!skill || looksLikeNonSkill(skill) || isDuplicateOfResume(skill)) continue;
          const norm = normaliseForSearch(skill);
          if (seenSanitizedSkillNorm.has(norm)) continue;
          seenSanitizedSkillNorm.add(norm);
          sanitized.push({ id: String(sanitizedId++), category: 'Skills', text: skill });
        }
        continue;
      }

      if (s.category === 'Experience' || s.category === 'Summary') {
        if (instructionalPrefix.test(s.text.trim())) {
          // Try to extract a quoted bullet
          const quotedMatch = s.text.match(/['"]([^'"]{20,})['"]/);
          if (quotedMatch) {
            sanitized.push({ id: String(sanitizedId++), category: s.category, text: quotedMatch[1].trim() });
          } else {
            // Grab everything after the last colon if substantial
            const colonIdx = s.text.lastIndexOf(':');
            const afterColon =
              colonIdx !== -1 ? s.text.slice(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '') : '';
            if (afterColon.length > 20) {
              sanitized.push({ id: String(sanitizedId++), category: s.category, text: afterColon });
            }
            // otherwise drop — no extractable content
          }
          continue;
        }
      }

      sanitized.push({ ...s, id: String(sanitizedId++) });
    }

    suggestions = sanitized;

    // Normalise keywordFrequency — validate shape and clamp values.
    const keywordFrequency: KeywordFrequency[] = Array.isArray(parsed.keywordFrequency)
      ? (parsed.keywordFrequency as Array<Partial<KeywordFrequency>>)
          .filter(
            (kf) =>
              kf &&
              typeof kf.keyword === 'string' &&
              kf.keyword.trim().length > 0 &&
              typeof kf.jobDescriptionCount === 'number' &&
              typeof kf.resumeCount === 'number',
          )
          .map((kf) => ({
            keyword: kf.keyword!.trim(),
            jobDescriptionCount: Math.max(0, Math.round(kf.jobDescriptionCount!)),
            resumeCount: Math.max(0, Math.round(kf.resumeCount!)),
          }))
      : [];

    // Fix up missing vs matched keywords by deterministically checking
    // whether each "missing" keyword actually appears in the resume text.
    if (missingKeywords.length > 0) {
      const newMissing: string[] = [];
      const currentMatchedSet = new Set(
        matchedKeywords.map((k) => normaliseForSearch(k)),
      );

      for (const kw of missingKeywords) {
        const cleanedKw = kw.replace(/^["']|["']$/g, '');
        const normalisedKw = normaliseForSearch(cleanedKw);
        if (!normalisedKw || normalisedKw.length < 3) {
          newMissing.push(kw);
          continue;
        }

        if (normalisedResume.includes(normalisedKw)) {
          // It is actually present in the resume; treat as matched.
          if (!currentMatchedSet.has(normalisedKw)) {
            matchedKeywords.push(cleanedKw);
            currentMatchedSet.add(normalisedKw);
          }
        } else {
          newMissing.push(kw);
        }
      }

      missingKeywords = newMissing;
    }

    const hasAnyKeywords =
      matchedKeywords.length + missingKeywords.length > 0;

    // Use model score as a baseline, but ensure that if the user
    // covers all keywords we give full credit.
    let finalScore = baseScore;
    if (hasAnyKeywords) {
      const keywordScore = Math.round(
        (matchedKeywords.length / (matchedKeywords.length + missingKeywords.length)) *
          100,
      );
      finalScore = Math.max(finalScore, keywordScore);

      if (missingKeywords.length === 0) {
        finalScore = 100;
      }
    }

    let message = typeof parsed.message === 'string' ? parsed.message : undefined;

    // If we now consider it a perfect match, suppress all suggestions
    if (finalScore === 100) {
      missingKeywords = [];
      suggestions = [];
      if (!message) {
        message =
          'Congratulations! Your resume perfectly matches this job description. No additional changes are required.';
      }
    }

    const result: AnalyzeResult = {
      score: finalScore,
      message,
      matchedKeywords,
      missingKeywords,
      keywordFrequency,
      suggestions,
    };

    res.json(result);
  } catch (err) {
    if (err instanceof Groq.AuthenticationError) {
      res.status(401).json({ error: 'Invalid API key. Please check and re-enter.' });
      return;
    }
    if (err instanceof Groq.RateLimitError) {
      res.status(429).json({ error: 'Rate limit reached. Please wait and try again.' });
      return;
    }
    if (err instanceof Groq.APIError) {
      console.error('Groq API error:', err.status, err.message);
      res.status(err.status ?? 500).json({ error: err.message });
      return;
    }
    console.error('Unexpected error in analyzeResume:', err);
    res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
  }
};
