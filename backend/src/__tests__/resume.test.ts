import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// ---------------------------------------------------------------------------
// Hoisted mocks — must be declared before any imports that use them
// ---------------------------------------------------------------------------
const { mockCreate, MockAuthenticationError, MockRateLimitError, MockAPIError } = vi.hoisted(() => {
  class MockAuthenticationError extends Error {
    constructor(msg = 'Authentication error') {
      super(msg);
      this.name = 'AuthenticationError';
    }
  }
  class MockRateLimitError extends Error {
    constructor(msg = 'Rate limit exceeded') {
      super(msg);
      this.name = 'RateLimitError';
    }
  }
  class MockAPIError extends Error {
    status?: number;
    constructor(msg = 'API error', status = 500) {
      super(msg);
      this.name = 'APIError';
      this.status = status;
    }
  }
  return { mockCreate: vi.fn(), MockAuthenticationError, MockRateLimitError, MockAPIError };
});

vi.mock('groq-sdk', () => {
  // Must use a real class so `new Groq(...)` properly instantiates
  // and `instanceof Groq.AuthenticationError` checks work in the controller.
  class MockGroq {
    chat: { completions: { create: typeof mockCreate } };
    constructor(_opts?: unknown) {
      this.chat = { completions: { create: mockCreate } };
    }
  }
  Object.assign(MockGroq, {
    AuthenticationError: MockAuthenticationError,
    RateLimitError: MockRateLimitError,
    APIError: MockAPIError,
  });
  return { default: MockGroq };
});

vi.mock('../lib/prisma', () => ({
  default: {
    $queryRaw: vi.fn().mockResolvedValue([]),
    $disconnect: vi.fn(),
  },
}));

// Import app after mocks are set up
import app from '../index';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const VALID_BODY = {
  resumeText: 'Experienced software engineer with Python and React skills. Designed scalable backend systems.',
  jobDescription: 'We are looking for a Python developer with React and Docker experience.',
  apiKey: 'test-api-key',
};

const MOCK_AI_RESPONSE = {
  score: 80,
  message: 'Your resume is well-aligned with this position.',
  matchedKeywords: ['Python', 'React'],
  missingKeywords: ['Docker'],
  keywordFrequency: [
    { keyword: 'Python', jobDescriptionCount: 2, resumeCount: 1 },
    { keyword: 'Docker', jobDescriptionCount: 1, resumeCount: 0 },
  ],
  suggestions: [
    { id: '1', category: 'Skills', text: 'Docker' },
  ],
};

const makeGroqResponse = (data: object) => ({
  choices: [{ message: { content: JSON.stringify(data) } }],
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('POST /api/resume/analyze', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue(makeGroqResponse(MOCK_AI_RESPONSE));
  });

  // -------------------------------------------------------------------------
  // Input validation
  // -------------------------------------------------------------------------
  describe('input validation', () => {
    it('returns 400 when resumeText is missing', async () => {
      const res = await request(app)
        .post('/api/resume/analyze')
        .send({ jobDescription: VALID_BODY.jobDescription, apiKey: VALID_BODY.apiKey });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/resumeText/i);
    });

    it('returns 400 when resumeText is blank', async () => {
      const res = await request(app)
        .post('/api/resume/analyze')
        .send({ ...VALID_BODY, resumeText: '   ' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/resumeText/i);
    });

    it('returns 400 when jobDescription is missing', async () => {
      const res = await request(app)
        .post('/api/resume/analyze')
        .send({ resumeText: VALID_BODY.resumeText, apiKey: VALID_BODY.apiKey });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/jobDescription/i);
    });

    it('returns 400 when apiKey is missing', async () => {
      const res = await request(app)
        .post('/api/resume/analyze')
        .send({ resumeText: VALID_BODY.resumeText, jobDescription: VALID_BODY.jobDescription });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/apiKey/i);
    });
  });

  // -------------------------------------------------------------------------
  // Successful analysis
  // -------------------------------------------------------------------------
  describe('successful analysis', () => {
    it('returns 200 with the expected response shape', async () => {
      const res = await request(app).post('/api/resume/analyze').send(VALID_BODY);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        score: expect.any(Number),
        matchedKeywords: expect.any(Array),
        missingKeywords: expect.any(Array),
        keywordFrequency: expect.any(Array),
        suggestions: expect.any(Array),
      });
    });

    it('clamps score to 0–100 when model returns out-of-range value', async () => {
      mockCreate.mockResolvedValueOnce(makeGroqResponse({ ...MOCK_AI_RESPONSE, score: 150 }));
      const res = await request(app).post('/api/resume/analyze').send(VALID_BODY);
      expect(res.body.score).toBeGreaterThanOrEqual(0);
      expect(res.body.score).toBeLessThanOrEqual(100);
    });

    it('parses AI response wrapped in markdown code fences', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: '```json\n' + JSON.stringify(MOCK_AI_RESPONSE) + '\n```' } }],
      });
      const res = await request(app).post('/api/resume/analyze').send(VALID_BODY);
      expect(res.status).toBe(200);
      expect(res.body.score).toBeDefined();
    });

    it('keywordFrequency entries have keyword, jobDescriptionCount, and resumeCount', async () => {
      const res = await request(app).post('/api/resume/analyze').send(VALID_BODY);
      for (const kf of res.body.keywordFrequency) {
        expect(typeof kf.keyword).toBe('string');
        expect(typeof kf.jobDescriptionCount).toBe('number');
        expect(typeof kf.resumeCount).toBe('number');
        expect(kf.jobDescriptionCount).toBeGreaterThanOrEqual(0);
        expect(kf.resumeCount).toBeGreaterThanOrEqual(0);
      }
    });

    it('drops keywordFrequency entries with missing or non-numeric count fields', async () => {
      mockCreate.mockResolvedValueOnce(
        makeGroqResponse({
          ...MOCK_AI_RESPONSE,
          keywordFrequency: [
            { keyword: 'Python', jobDescriptionCount: 2, resumeCount: 1 }, // valid
            { keyword: 'Bad', jobDescriptionCount: 'two', resumeCount: 0 }, // invalid — string count
            { keyword: '', jobDescriptionCount: 1, resumeCount: 0 },        // invalid — empty keyword
          ],
        }),
      );
      const res = await request(app).post('/api/resume/analyze').send(VALID_BODY);
      expect(res.status).toBe(200);
      // Only the valid entry should survive
      expect(res.body.keywordFrequency).toHaveLength(1);
      expect(res.body.keywordFrequency[0].keyword).toBe('Python');
    });

    it('returns 500 when AI response is not parseable JSON', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: 'This is not JSON at all.' } }],
      });
      const res = await request(app).post('/api/resume/analyze').send(VALID_BODY);
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/parse/i);
    });
  });

  // -------------------------------------------------------------------------
  // Near-duplicate deduplication
  // -------------------------------------------------------------------------
  describe('near-duplicate deduplication', () => {
    it('filters out experience suggestions whose words heavily overlap with existing resume content', async () => {
      const resumeText =
        'Designed and developed scalable backend systems using Python and Kotlin, resulting in high-availability systems.';
      mockCreate.mockResolvedValueOnce(
        makeGroqResponse({
          ...MOCK_AI_RESPONSE,
          suggestions: [
            {
              id: '1',
              category: 'Experience',
              // Same key words as the resume bullet above — should be deduplicated
              text: 'Designed and developed scalable backend systems using Python and Kotlin, resulting in improved performance.',
            },
          ],
        }),
      );
      const res = await request(app)
        .post('/api/resume/analyze')
        .send({ ...VALID_BODY, resumeText });
      expect(res.status).toBe(200);
      const expSuggestions = res.body.suggestions.filter(
        (s: { category: string }) => s.category === 'Experience',
      );
      expect(expSuggestions).toHaveLength(0);
    });

    it('keeps experience suggestions that are genuinely new', async () => {
      mockCreate.mockResolvedValueOnce(
        makeGroqResponse({
          ...MOCK_AI_RESPONSE,
          suggestions: [
            {
              id: '1',
              category: 'Experience',
              text: 'Architected a distributed microservices platform using Kubernetes and Kafka, reducing deployment time by 40%.',
            },
          ],
        }),
      );
      const res = await request(app).post('/api/resume/analyze').send(VALID_BODY);
      expect(res.status).toBe(200);
      const expSuggestions = res.body.suggestions.filter(
        (s: { category: string }) => s.category === 'Experience',
      );
      expect(expSuggestions).toHaveLength(1);
    });
  });

  // -------------------------------------------------------------------------
  // Error handling
  // -------------------------------------------------------------------------
  describe('error handling', () => {
    it('returns 401 on Groq AuthenticationError', async () => {
      mockCreate.mockRejectedValueOnce(new MockAuthenticationError());
      const res = await request(app).post('/api/resume/analyze').send(VALID_BODY);
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/invalid api key/i);
    });

    it('returns 429 on Groq RateLimitError', async () => {
      mockCreate.mockRejectedValueOnce(new MockRateLimitError());
      const res = await request(app).post('/api/resume/analyze').send(VALID_BODY);
      expect(res.status).toBe(429);
      expect(res.body.error).toMatch(/rate limit/i);
    });

    it('forwards the status code from a Groq APIError', async () => {
      mockCreate.mockRejectedValueOnce(new MockAPIError('Service unavailable', 503));
      const res = await request(app).post('/api/resume/analyze').send(VALID_BODY);
      expect(res.status).toBe(503);
    });

    it('returns 500 on unexpected errors', async () => {
      mockCreate.mockRejectedValueOnce(new Error('Something unexpected'));
      const res = await request(app).post('/api/resume/analyze').send(VALID_BODY);
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/unexpected/i);
    });
  });
});
