import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  apiStartInterview,
  apiEvaluateAnswer,
  apiCompleteInterview,
  extractInterviewError,
  StartInterviewRequest,
  EvaluateAnswerRequest,
  CompleteInterviewRequest,
} from '../interview';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const VALID_START: StartInterviewRequest = {
  role: 'Software Engineer',
  type: 'Technical',
  questionCount: 5,
  difficulty: 'Medium',
  apiKey: 'test-api-key',
};

const START_RESPONSE = {
  sessionId: 'abc',
  introduction: 'Hello',
  questions: ['q1', 'q2', 'q3'],
};

const VALID_ANSWER: EvaluateAnswerRequest = {
  sessionId: 'abc',
  questionIndex: 0,
  question: 'What is 2+2?',
  answer: 'Four',
  apiKey: 'test-api-key',
};

const ANSWER_RESPONSE = {
  accuracy: 'High' as const,
  clarity: 'Medium' as const,
  strengths: ['good'],
  improvements: ['bad'],
  score: 7,
};

const VALID_COMPLETE: CompleteInterviewRequest = {
  sessionId: 'abc',
  role: 'Software Engineer',
  answers: ['A', 'B'],
  feedbacks: [ANSWER_RESPONSE],
  apiKey: 'test-api-key',
};

const COMPLETE_RESPONSE = {
  overallScore: 8.5,
  summary: 'Great job',
  topStrengths: ['clarity'],
  areasToImprove: ['detail'],
  recommendation: 'Keep going',
};

const mockFetch = (status: number, body: unknown) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });

// ---------------------------------------------------------------------------
// API wrapper tests
// ---------------------------------------------------------------------------
describe('interview API wrappers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('apiStartInterview()', () => {
    it('sends the correct payload and returns response data', async () => {
      global.fetch = mockFetch(200, START_RESPONSE);
      const res = await apiStartInterview(VALID_START);
      expect(res).toEqual(START_RESPONSE);
      const mockFetchFn = global.fetch as ReturnType<typeof vi.fn>;
      const [url, init] = mockFetchFn.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/api/interview/start');
      expect(init.method).toBe('POST');
      expect(JSON.parse(init.body as string)).toMatchObject(VALID_START);
    });

    it('throws meaningful messages on errors', async () => {
      global.fetch = mockFetch(401, { error: 'Unauthorized' });
      await expect(apiStartInterview(VALID_START)).rejects.toThrow('Invalid API key');

      global.fetch = mockFetch(429, { error: 'Too many requests' });
      await expect(apiStartInterview(VALID_START)).rejects.toThrow('Too many requests');

      global.fetch = mockFetch(500, { error: 'Server error' });
      await expect(apiStartInterview(VALID_START)).rejects.toThrow('Server error');

      global.fetch = mockFetch(503, { error: 'Service unavailable' });
      await expect(apiStartInterview(VALID_START)).rejects.toThrow('temporarily unavailable');

      global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(apiStartInterview(VALID_START)).rejects.toThrow('Cannot reach');

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new SyntaxError('bad json')),
      });
      await expect(apiStartInterview(VALID_START)).rejects.toThrow(/parse/i);
    });
  });

  describe('apiEvaluateAnswer()', () => {
    it('returns live feedback from the server', async () => {
      global.fetch = mockFetch(200, ANSWER_RESPONSE);
      const res = await apiEvaluateAnswer(VALID_ANSWER);
      expect(res).toEqual(ANSWER_RESPONSE);
    });

    it('propagates HTTP errors', async () => {
      global.fetch = mockFetch(503, { error: 'Service unavailable' });
      await expect(apiEvaluateAnswer(VALID_ANSWER)).rejects.toThrow('temporarily unavailable');
    });
  });

  describe('apiCompleteInterview()', () => {
    it('returns final feedback from the server', async () => {
      global.fetch = mockFetch(200, COMPLETE_RESPONSE);
      const res = await apiCompleteInterview(VALID_COMPLETE);
      expect(res).toEqual(COMPLETE_RESPONSE);
    });

    it('handles network failures gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(apiCompleteInterview(VALID_COMPLETE)).rejects.toThrow('Cannot reach');
    });
  });
});

// ---------------------------------------------------------------------------
// Error extraction helper tests
// ---------------------------------------------------------------------------
describe('extractInterviewError()', () => {
  it('extracts meaningful error messages from Error objects', () => {
    const err = new Error('Invalid API key. Please check and re-enter.');
    expect(extractInterviewError(err)).toMatch(/Invalid API key/);

    const netErr = new Error('Cannot reach the server');
    expect(extractInterviewError(netErr)).toMatch(/Cannot reach/);

    const timeoutErr = new Error('AI service temporarily unavailable. Please try again.');
    expect(extractInterviewError(timeoutErr)).toMatch(/temporarily unavailable/);
  });

  it('falls back to generic message for non-Error objects', () => {
    expect(extractInterviewError({})).toMatch(/Something went wrong/);
    expect(extractInterviewError(null)).toMatch(/Something went wrong/);
    expect(extractInterviewError('bad')).toMatch(/Something went wrong/);
  });
});
