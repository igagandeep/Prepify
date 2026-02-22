import axios from 'axios';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://prepify-backend-mu.vercel.app';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export interface Job {
  id: string;
  company: string;
  role: string;
  status: string;
  notes: string;
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobInput {
  company: string;
  role: string;
  status: string;
  notes: string;
}

export interface UpdateJobInput {
  id: string;
  data: Partial<CreateJobInput>;
}

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
