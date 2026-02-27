import axios from 'axios';

const isElectron =
  typeof window !== 'undefined' &&
  navigator.userAgent.toLowerCase().includes('electron');

const isDevelopment =
  process.env.NODE_ENV === 'development' ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost');

const BASE_URL =
  isElectron || isDevelopment
    ? 'http://localhost:5000'
    : 'https://prepify-7vah.onrender.com';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export type { Job, CreateJobInput, UpdateJobInput } from '../types/job';
import type { Job, CreateJobInput, UpdateJobInput } from '../types/job';

export const jobsApi = {
  getAll: (): Promise<Job[]> =>
    apiClient.get<Job[]>('/api/jobs').then((res) => res.data),

  create: (input: CreateJobInput): Promise<Job> =>
    apiClient.post<Job>('/api/jobs', input).then((res) => res.data),

  update: ({ id, data }: UpdateJobInput): Promise<Job> =>
    apiClient.patch<Job>(`/api/jobs/${id}`, data).then((res) => res.data),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/api/jobs/${id}`).then(() => undefined),
};
