import { z } from 'zod';

export const STATUS_OPTIONS = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'] as const;

export const jobSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role is required'),
  status: z.enum(STATUS_OPTIONS),
  location: z.string().optional(),
  salary: z.string().optional(),
  jobUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || /^https?:\/\/.+/.test(val),
      'Must be a valid URL starting with http:// or https://'
    ),
  notes: z.string().optional(),
});

export type JobFormData = z.infer<typeof jobSchema>;
export type FieldErrors = Partial<Record<keyof JobFormData, string>>;
