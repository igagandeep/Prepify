import { api } from './client';

export type { Job, CreateJobInput, UpdateJobInput } from '@/types/job';
import type { Job, CreateJobInput, UpdateJobInput } from '@/types/job';

export const jobsApi = {
  getAll: (): Promise<Job[]> =>
    api.get<Job[]>('/api/jobs'),

  create: (input: CreateJobInput): Promise<Job> =>
    api.post<Job>('/api/jobs', input),

  update: ({ id, data }: UpdateJobInput): Promise<Job> =>
    api.patch<Job>(`/api/jobs/${id}`, data),

  delete: (id: string): Promise<void> =>
    api.delete(`/api/jobs/${id}`),
};
