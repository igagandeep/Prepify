'use client';

import { useState } from 'react';
import { Briefcase, MapPin, DollarSign, Link, FileText } from 'lucide-react';
import Modal from '../ui/Modal';
import { jobSchema, STATUS_OPTIONS } from '../../lib/validations/job';
import type { JobFormData, FieldErrors } from '../../lib/validations/job';

const EMPTY_FORM: JobFormData = {
  company: '',
  role: '',
  status: 'Wishlist',
  location: '',
  salary: '',
  jobUrl: '',
  notes: '',
};

interface AddJobModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: JobFormData) => void;
  isPending: boolean;
}

export default function AddJobModal({ open, onClose, onSubmit, isPending }: AddJobModalProps) {
  const [form, setForm] = useState<JobFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleClose() {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  }

  function set<K extends keyof JobFormData>(key: K, value: JobFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit() {
    const result = jobSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof JobFormData;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    onSubmit(result.data);
    setForm(EMPTY_FORM);
    setErrors({});
  }

  const inputBase =
    'w-full px-3 py-2.5 border rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-colors';
  const inputNormal = `${inputBase} border-gray-200 dark:border-gray-600 focus:border-[#3948CF]`;
  const inputError = `${inputBase} border-red-400 focus:border-red-500`;

  return (
    <Modal open={open} onClose={handleClose} title="">
      {/* Custom header with icon */}
      <div className="-mt-5 mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Briefcase className="w-5 h-5" style={{ color: '#3948CF' }} />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Add New Application
          </h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Fill in the details of your job application to track it.
        </p>
      </div>

      <div className="space-y-4">
        {/* Company + Role */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Company <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Google"
              value={form.company}
              onChange={(e) => set('company', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className={errors.company ? inputError : inputNormal}
              autoFocus
            />
            {errors.company && <p className="mt-1 text-xs text-red-500">{errors.company}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Software Engineer"
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className={errors.role ? inputError : inputNormal}
            />
            {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role}</p>}
          </div>
        </div>

        {/* Location + Salary */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" /> Location
            </label>
            <input
              type="text"
              placeholder="e.g., Remote, NYC"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              className={inputNormal}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-gray-400" /> Salary Range
            </label>
            <input
              type="text"
              placeholder="e.g., $120k - $150k"
              value={form.salary}
              onChange={(e) => set('salary', e.target.value)}
              className={inputNormal}
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Application Status
          </label>
          <select
            value={form.status}
            onChange={(e) => set('status', e.target.value as JobFormData['status'])}
            className={inputNormal}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Job URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
            <Link className="w-3.5 h-3.5 text-gray-400" /> Job Posting URL
          </label>
          <input
            type="text"
            placeholder="https://..."
            value={form.jobUrl}
            onChange={(e) => set('jobUrl', e.target.value)}
            className={errors.jobUrl ? inputError : inputNormal}
          />
          {errors.jobUrl && <p className="mt-1 text-xs text-red-500">{errors.jobUrl}</p>}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-gray-400" /> Notes
          </label>
          <textarea
            placeholder="Add any notes about this application..."
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={3}
            className={`${inputNormal} resize-y`}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3 justify-end">
        <button
          onClick={handleClose}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
          style={{ backgroundColor: '#3948CF' }}
        >
          {isPending ? 'Adding...' : 'Add Application'}
        </button>
      </div>
    </Modal>
  );
}
