import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';

// ---------------------------------------------------------------------------
// Hoisted mocks — must be declared before any imports that use them
// ---------------------------------------------------------------------------
const {
  mockCreate,
  MockAuthenticationError,
  MockRateLimitError,
  MockAPIError,
} = vi.hoisted(() => {
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

// Import app after mocks are set up
import app from '../index';

// ---------------------------------------------------------------------------
// Helpers & fixtures
// ---------------------------------------------------------------------------
function makeGroqResponse(data: object) {
  return {
    choices: [{ message: { content: JSON.stringify(data) } }],
  };
}

const VALID_START = {
  role: 'Software Engineer',
  type: 'Technical',
  questionCount: 5,
  difficulty: 'Medium',
  apiKey: 'test-api-key',
};

const VALID_ANSWER = {
  sessionId: 'abc',
  questionIndex: 0,
  question: 'What is 2+2?',
  answer: 'Four',
  apiKey: 'test-api-key',
};

const VALID_COMPLETE = {
  sessionId: 'abc',
  role: 'Software Engineer',
  answers: ['A', 'B'],
  feedbacks: [
    { score: 8, accuracy: 'High', clarity: 'High' },
    { score: 6, accuracy: 'Medium', clarity: 'Low' },
  ],
  apiKey: 'test-api-key',
};

// Use helper to generate a basic live feedback object from the model
const BASIC_FEEDBACK = {
  accuracy: 'High',
  clarity: 'Medium',
  strengths: ['good', 'nice'],
  improvements: ['bad', 'fix this'],
  score: 7,
};

const FINAL_FEEDBACK = {
  overallScore: 8.5,
  summary: 'Well done.',
  topStrengths: ['detail-oriented', 'clear communication'],
  areasToImprove: ['time management', 'edge cases'],
  recommendation: 'Ready for mid-level interviews',
};

// -------------------------------------------------------------
// Spies to make sure we don't accidentally log the API key
// -------------------------------------------------------------
let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
let consoleLogSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.clearAllMocks();
  consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  consoleErrorSpy.mockRestore();
  consoleLogSpy.mockRestore();
});

// ---------------------------------------------------------------------------
// Tests for /api/interview/start
// ---------------------------------------------------------------------------
describe('POST /api/interview/start', () => {
  beforeEach(() => {
    // default success response
    mockCreate.mockResolvedValue(
      makeGroqResponse({
        introduction: 'Hi there!',
        questions: Array(VALID_START.questionCount).fill('foo'),
      }),
    );
  });

  it('returns 200 with sessionId, introduction, and questions', async () => {
    const res = await request(app).post('/api/interview/start').send(VALID_START);
    expect(res.status).toBe(200);
    expect(res.body.sessionId).toBeDefined();
    expect(res.body.introduction).toBe('Hi there!');
    expect(Array.isArray(res.body.questions)).toBe(true);
    expect(res.body.questions).toHaveLength(VALID_START.questionCount);
    expect(res.body).not.toHaveProperty('apiKey');
  });

  it('generates the correct number of questions for every type/difficulty combo', async () => {
    const types = ['Technical', 'Behavioral', 'Mixed'];
    const difficulties = ['Easy', 'Medium', 'Hard'];
    for (const type of types) {
      for (const diff of difficulties) {
        mockCreate.mockResolvedValueOnce(
          makeGroqResponse({
            introduction: 'ok',
            questions: Array(3).fill('q'),
          }),
        );
        const res = await request(app)
          .post('/api/interview/start')
          .send({ ...VALID_START, type, difficulty: diff, questionCount: 3 });
        expect(res.status).toBe(200);
        expect(res.body.questions).toHaveLength(3);
      }
    }
  });

  it('allows edge counts like 1 and 15', async () => {
    mockCreate.mockResolvedValueOnce(
      makeGroqResponse({ introduction: 'i', questions: ['q'] }),
    );
    const r1 = await request(app)
      .post('/api/interview/start')
      .send({ ...VALID_START, questionCount: 1 });
    expect(r1.status).toBe(200);
    expect(r1.body.questions).toHaveLength(1);

    mockCreate.mockResolvedValueOnce(
      makeGroqResponse({ introduction: 'i', questions: Array(15).fill('q') }),
    );
    const r2 = await request(app)
      .post('/api/interview/start')
      .send({ ...VALID_START, questionCount: 15 });
    expect(r2.status).toBe(200);
    expect(r2.body.questions).toHaveLength(15);
  });

  it('returns 400 when apiKey is missing', async () => {
    const res = await request(app).post('/api/interview/start').send({
      ...VALID_START,
      apiKey: undefined,
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/api key/i);
  });

  it('returns 400 if any required field is missing', async () => {
    const fields: Array<keyof typeof VALID_START> = [
      'role',
      'type',
      'questionCount',
      'difficulty',
    ];
    for (const field of fields) {
      const body = { ...VALID_START } as any;
      delete body[field];
      const res = await request(app).post('/api/interview/start').send(body);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Missing required fields/i);
    }
  });

  it('returns 401 when Groq throws AuthenticationError', async () => {
    mockCreate.mockRejectedValueOnce(new MockAuthenticationError());
    const res = await request(app).post('/api/interview/start').send(VALID_START);
    expect(res.status).toBe(401);
  });

  it('returns 503 when Groq rate-limits or API error', async () => {
    mockCreate.mockRejectedValueOnce(new MockRateLimitError());
    const r = await request(app).post('/api/interview/start').send(VALID_START);
    expect(r.status).toBe(503);
    mockCreate.mockRejectedValueOnce(new MockAPIError());
    const r2 = await request(app).post('/api/interview/start').send(VALID_START);
    expect(r2.status).toBe(503);
  });

  it('returns 500 when AI response is not valid JSON', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'not json' } }],
    });
    const res = await request(app).post('/api/interview/start').send(VALID_START);
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/parse/i);
  });

  it('does not log the apiKey', async () => {
    await request(app).post('/api/interview/start').send(VALID_START);
    const combined = consoleErrorSpy.mock.calls.concat(consoleLogSpy.mock.calls).join();
    expect(combined).not.toContain(VALID_START.apiKey);
  });
});

// ---------------------------------------------------------------------------
// Tests for /api/interview/answer
// ---------------------------------------------------------------------------
describe('POST /api/interview/answer', () => {
  beforeEach(() => {
    mockCreate.mockResolvedValue(makeGroqResponse(BASIC_FEEDBACK));
  });

  it('returns structured feedback with bounded values', async () => {
    const res = await request(app).post('/api/interview/answer').send(VALID_ANSWER);
    expect(res.status).toBe(200);
    expect(res.body.accuracy).toMatch(/High|Medium|Low/);
    expect(res.body.clarity).toMatch(/High|Medium|Low/);
    expect(Array.isArray(res.body.strengths)).toBe(true);
    expect(Array.isArray(res.body.improvements)).toBe(true);
    expect(typeof res.body.score).toBe('number');
    expect(res.body.score).toBeGreaterThanOrEqual(1);
    expect(res.body.score).toBeLessThanOrEqual(10);
    expect(res.body).not.toHaveProperty('apiKey');
  });

  it('trims and limits strengths/improvements to 3 items', async () => {
    mockCreate.mockResolvedValueOnce(
      makeGroqResponse({
        ...BASIC_FEEDBACK,
        strengths: ['a', 'b', 'c', 'd'],
        improvements: ['i1', 'i2', 'i3', 'i4'],
      }),
    );
    const res = await request(app).post('/api/interview/answer').send(VALID_ANSWER);
    expect(res.body.strengths).toHaveLength(3);
    expect(res.body.improvements).toHaveLength(3);
  });

  it('returns 400 if apiKey missing', async () => {
    const body = { ...VALID_ANSWER } as any;
    delete body.apiKey;
    const res = await request(app).post('/api/interview/answer').send(body);
    expect(res.status).toBe(400);
  });

  it('returns 400 if question or answer fields are missing', async () => {
    const missingFields = ['question', 'answer', 'sessionId', 'questionIndex'];
    for (const field of missingFields) {
      const body = { ...VALID_ANSWER } as any;
      delete body[field];
      const res = await request(app).post('/api/interview/answer').send(body);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Missing required fields/i);
    }
  });

  it('returns 400 when answer is blank or whitespace', async () => {
    const res = await request(app)
      .post('/api/interview/answer')
      .send({ ...VALID_ANSWER, answer: '    ' });
    expect(res.status).toBe(400);
  });

  it('returns 500 when AI response cannot be parsed', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'garbage' } }],
    });
    const res = await request(app).post('/api/interview/answer').send(VALID_ANSWER);
    expect(res.status).toBe(500);
  });

  it('propagates 503 on rate limit', async () => {
    mockCreate.mockRejectedValueOnce(new MockRateLimitError());
    const res = await request(app).post('/api/interview/answer').send(VALID_ANSWER);
    expect(res.status).toBe(503);
  });

  it('does not log the apiKey', async () => {
    await request(app).post('/api/interview/answer').send(VALID_ANSWER);
    const combined = consoleErrorSpy.mock.calls.concat(consoleLogSpy.mock.calls).join();
    expect(combined).not.toContain(VALID_ANSWER.apiKey);
  });
});

// ---------------------------------------------------------------------------
// Tests for /api/interview/complete
// ---------------------------------------------------------------------------
describe('POST /api/interview/complete', () => {
  beforeEach(() => {
    mockCreate.mockResolvedValue(makeGroqResponse(FINAL_FEEDBACK));
  });

  it('returns final summary with correct types', async () => {
    const res = await request(app).post('/api/interview/complete').send(VALID_COMPLETE);
    expect(res.status).toBe(200);
    expect(typeof res.body.overallScore).toBe('number');
    expect(res.body.overallScore).toBeGreaterThanOrEqual(1);
    expect(res.body.overallScore).toBeLessThanOrEqual(10);
    expect(typeof res.body.summary).toBe('string');
    expect(Array.isArray(res.body.topStrengths)).toBe(true);
    expect(Array.isArray(res.body.areasToImprove)).toBe(true);
    expect(typeof res.body.recommendation).toBe('string');
    expect(res.body).not.toHaveProperty('apiKey');
  });

  it('returns 400 if apiKey missing', async () => {
    const body = { ...VALID_COMPLETE } as any;
    delete body.apiKey;
    const res = await request(app).post('/api/interview/complete').send(body);
    expect(res.status).toBe(400);
  });

  it('returns 400 if answers or feedbacks arrays are missing or empty', async () => {
    const cases = [
      { answers: undefined, feedbacks: VALID_COMPLETE.feedbacks },
      { answers: [], feedbacks: VALID_COMPLETE.feedbacks },
      { answers: VALID_COMPLETE.answers, feedbacks: undefined },
      { answers: VALID_COMPLETE.answers, feedbacks: [] },
    ];
    for (const c of cases) {
      const res = await request(app).post('/api/interview/complete').send({
        ...VALID_COMPLETE,
        answers: c.answers,
        feedbacks: c.feedbacks,
      });
      expect(res.status).toBe(400);
    }
  });

  it('returns 500 when AI response cannot be parsed', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'not json' } }],
    });
    const res = await request(app).post('/api/interview/complete').send(VALID_COMPLETE);
    expect(res.status).toBe(500);
  });

  it('propagates 503 on API error', async () => {
    mockCreate.mockRejectedValueOnce(new MockAPIError());
    const r = await request(app).post('/api/interview/complete').send(VALID_COMPLETE);
    expect(r.status).toBe(503);
  });

  it('does not log the apiKey', async () => {
    await request(app).post('/api/interview/complete').send(VALID_COMPLETE);
    const combined = consoleErrorSpy.mock.calls.concat(consoleLogSpy.mock.calls).join();
    expect(combined).not.toContain(VALID_COMPLETE.apiKey);
  });
});
