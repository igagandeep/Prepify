import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeResume } from '../resume';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const VALID_PARAMS = {
  resumeText: 'Software engineer with Python and React experience.',
  jobDescription: 'Looking for a Python developer with React and Docker skills.',
  apiKey: 'test-api-key',
};

const FULL_RESPONSE = {
  score: 75,
  message: 'Your resume is well-aligned with this position.',
  matchedKeywords: ['Python', 'React'],
  missingKeywords: ['Docker'],
  keywordFrequency: [
    { keyword: 'Python', jobDescriptionCount: 2, resumeCount: 1 },
    { keyword: 'Docker', jobDescriptionCount: 1, resumeCount: 0 },
  ],
  suggestions: [{ id: '1', category: 'Skills', text: 'Docker' }],
};

const mockFetch = (status: number, body: unknown) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('analyzeResume()', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // -------------------------------------------------------------------------
  // Successful response
  // -------------------------------------------------------------------------
  describe('successful response', () => {
    it('returns all fields from a well-formed response', async () => {
      global.fetch = mockFetch(200, FULL_RESPONSE);
      const result = await analyzeResume(VALID_PARAMS);

      expect(result.score).toBe(75);
      expect(result.message).toBe(FULL_RESPONSE.message);
      expect(result.matchedKeywords).toEqual(['Python', 'React']);
      expect(result.missingKeywords).toEqual(['Docker']);
      expect(result.keywordFrequency).toEqual(FULL_RESPONSE.keywordFrequency);
      expect(result.suggestions).toEqual(FULL_RESPONSE.suggestions);
    });

    it('sends resumeText, jobDescription, and apiKey in the request body', async () => {
      global.fetch = mockFetch(200, FULL_RESPONSE);
      await analyzeResume(VALID_PARAMS);

      const [url, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
        string,
        RequestInit,
      ];
      expect(url).toContain('/api/resume/analyze');
      expect(init.method).toBe('POST');
      const body = JSON.parse(init.body as string);
      expect(body.resumeText).toBe(VALID_PARAMS.resumeText);
      expect(body.jobDescription).toBe(VALID_PARAMS.jobDescription);
      expect(body.apiKey).toBe(VALID_PARAMS.apiKey);
    });

    it('defaults score to 0 when field is absent', async () => {
      global.fetch = mockFetch(200, { matchedKeywords: [] });
      const result = await analyzeResume(VALID_PARAMS);
      expect(result.score).toBe(0);
    });

    it('defaults all array fields to [] when absent', async () => {
      global.fetch = mockFetch(200, { score: 50 });
      const result = await analyzeResume(VALID_PARAMS);
      expect(result.matchedKeywords).toEqual([]);
      expect(result.missingKeywords).toEqual([]);
      expect(result.keywordFrequency).toEqual([]);
      expect(result.suggestions).toEqual([]);
    });

    it('defaults keywordFrequency to [] when field is absent', async () => {
      global.fetch = mockFetch(200, { ...FULL_RESPONSE, keywordFrequency: undefined });
      const result = await analyzeResume(VALID_PARAMS);
      expect(result.keywordFrequency).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // HTTP error responses
  // -------------------------------------------------------------------------
  describe('HTTP error responses', () => {
    it('throws "Invalid API key" message on 401', async () => {
      global.fetch = mockFetch(401, { error: 'Unauthorized' });
      await expect(analyzeResume(VALID_PARAMS)).rejects.toThrow('Invalid API key');
    });

    it('throws "Rate limit" message on 429', async () => {
      global.fetch = mockFetch(429, { error: 'Too many requests' });
      await expect(analyzeResume(VALID_PARAMS)).rejects.toThrow('Rate limit');
    });

    it('uses the error field from response body for other error statuses', async () => {
      global.fetch = mockFetch(500, { error: 'Internal server error' });
      await expect(analyzeResume(VALID_PARAMS)).rejects.toThrow('Internal server error');
    });

    it('falls back to generic message when error body has no error field', async () => {
      global.fetch = mockFetch(500, {});
      await expect(analyzeResume(VALID_PARAMS)).rejects.toThrow(/unexpected/i);
    });

    it('falls back to generic message when error body is not JSON', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: () => Promise.reject(new SyntaxError('Not JSON')),
      });
      await expect(analyzeResume(VALID_PARAMS)).rejects.toThrow(/unexpected/i);
    });
  });

  // -------------------------------------------------------------------------
  // Network failure
  // -------------------------------------------------------------------------
  describe('network failure', () => {
    it('throws "Could not reach the server" when fetch rejects', async () => {
      global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(analyzeResume(VALID_PARAMS)).rejects.toThrow('Could not reach the server');
    });
  });

  // -------------------------------------------------------------------------
  // Malformed response
  // -------------------------------------------------------------------------
  describe('malformed response body', () => {
    it('throws a parse error when response JSON is invalid', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.reject(new SyntaxError('Unexpected token')),
      });
      await expect(analyzeResume(VALID_PARAMS)).rejects.toThrow(/parse/i);
    });
  });
});
