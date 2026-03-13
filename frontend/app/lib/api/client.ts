import axios, { isAxiosError } from 'axios';

const isDevelopment =
  process.env.NODE_ENV === 'development' ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost');

const BASE_URL = isDevelopment
  ? 'http://localhost:5000'
  : 'https://prepify-7vah.onrender.com';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

function handleError(err: unknown): never {
  if (isAxiosError(err)) {
    const status = err.response?.status;
    const message = err.response?.data?.error;

    if (status === 401) throw new Error('Invalid API key. Please check and re-enter.');
    if (status === 429) throw new Error('Rate limit reached. Please wait a moment and try again.');
    if (status === 503) throw new Error('AI service temporarily unavailable. Please try again.');
    if (message) throw new Error(message);
    if (!err.response) throw new Error('Cannot reach the server. Check your internet connection.');
  }
  throw new Error('An unexpected error occurred.');
}

export const api = {
  async get<T>(path: string): Promise<T> {
    try {
      const res = await axiosClient.get<T>(path);
      return res.data;
    } catch (err) {
      handleError(err);
    }
  },

  async post<T>(path: string, body: unknown): Promise<T> {
    try {
      const res = await axiosClient.post<T>(path, body);
      return res.data;
    } catch (err) {
      handleError(err);
    }
  },

  async patch<T>(path: string, body: unknown): Promise<T> {
    try {
      const res = await axiosClient.patch<T>(path, body);
      return res.data;
    } catch (err) {
      handleError(err);
    }
  },

  async delete(path: string): Promise<void> {
    try {
      await axiosClient.delete(path);
    } catch (err) {
      handleError(err);
    }
  },
};
