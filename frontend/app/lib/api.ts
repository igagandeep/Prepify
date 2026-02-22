import axios from 'axios';
import type { Job, CreateJobInput, UpdateJobInput } from '../types/job';

export type { Job, CreateJobInput, UpdateJobInput };

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

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
