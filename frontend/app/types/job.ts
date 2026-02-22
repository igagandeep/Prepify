export interface Job {
  id: string;
  company: string;
  role: string;
  status: string;
  location: string;
  salary: string;
  jobUrl: string;
  notes: string;
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobInput {
  company: string;
  role: string;
  status: string;
  location?: string;
  salary?: string;
  jobUrl?: string;
  notes?: string;
}

export interface UpdateJobInput {
  id: string;
  data: Partial<CreateJobInput>;
}
