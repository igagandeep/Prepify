'use client';

import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import {
  useJobs,
  useCreateJob,
  useUpdateJob,
  useDeleteJob,
} from '../hooks/useJobs';

const STATUS_OPTIONS = [
  'Applied',
  'Phone Screen',
  'Interview',
  'Offer',
  'Rejected',
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Applied: {
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    text: 'text-blue-700 dark:text-blue-300',
  },
  'Phone Screen': {
    bg: 'bg-yellow-100 dark:bg-yellow-900/40',
    text: 'text-yellow-700 dark:text-yellow-300',
  },
  Interview: {
    bg: 'bg-purple-100 dark:bg-purple-900/40',
    text: 'text-purple-700 dark:text-purple-300',
  },
  Offer: {
    bg: 'bg-green-100 dark:bg-green-900/40',
    text: 'text-green-700 dark:text-green-300',
  },
  Rejected: {
    bg: 'bg-red-100 dark:bg-red-900/40',
    text: 'text-red-700 dark:text-red-300',
  },
};

const FORM_FIELDS: { key: 'company' | 'role'; placeholder: string }[] = [
  { key: 'company', placeholder: 'Company name' },
  { key: 'role', placeholder: 'Role / Position' },
];

const EMPTY_FORM = { company: '', role: '', status: 'Applied', notes: '' };

export default function JobTracking() {
  const { data: jobs = [], isLoading, isError } = useJobs();
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const canSubmit = form.company.trim() !== '' && form.role.trim() !== '';

  function openModal() {
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
  }

  function handleAdd() {
    if (!canSubmit) return;
    createJob.mutate(
      {
        company: form.company.trim(),
        role: form.role.trim(),
        status: form.status,
        notes: form.notes.trim(),
      },
      { onSuccess: closeModal }
    );
  }

  function handleStatusChange(id: string, status: string) {
    updateJob.mutate({ id, data: { status } });
  }

  function handleDelete(id: string) {
    deleteJob.mutate(id);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            Job Tracking
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {jobs.length} application{jobs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#3948CF' }}
        >
          <Plus className="w-4 h-4" />
          Add Application
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-sm">
          Loading applications...
        </div>
      )}

      {isError && (
        <div className="text-center py-16 text-red-500 text-sm">
          Failed to load applications. Is the backend running?
        </div>
      )}

      {!isLoading && !isError && jobs.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            No applications yet.
          </p>
          <button
            onClick={openModal}
            className="mt-3 text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: '#3948CF' }}
          >
            Add your first application
          </button>
        </div>
      )}

      {!isLoading && !isError && jobs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Company
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Role
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Applied
                </th>
                <th className="text-left px-5 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Notes
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, idx) => {
                const colors =
                  STATUS_COLORS[job.status] ?? STATUS_COLORS['Applied'];
                return (
                  <tr
                    key={job.id}
                    className={`border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${idx === jobs.length - 1 ? 'border-b-0' : ''}`}
                  >
                    <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-gray-100">
                      {job.company}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">
                      {job.role}
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={job.status}
                        onChange={(e) =>
                          handleStatusChange(job.id, e.target.value)
                        }
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 outline-none cursor-pointer ${colors.bg} ${colors.text}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">
                      {new Date(job.appliedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {job.notes || (
                        <span className="text-gray-300 dark:text-gray-600">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleDelete(job.id)}
                        disabled={deleteJob.isPending}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Add Application
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {FORM_FIELDS.map(({ key, placeholder }) => (
                <input
                  key={key}
                  type="text"
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = '#3948CF')
                  }
                  onBlur={(e) => (e.currentTarget.style.borderColor = '')}
                  autoFocus={key === 'company'}
                />
              ))}

              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 outline-none"
                onFocus={(e) => (e.currentTarget.style.borderColor = '#3948CF')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '')}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Notes (optional)"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                onFocus={(e) => (e.currentTarget.style.borderColor = '#3948CF')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '')}
              />
            </div>

            <button
              onClick={handleAdd}
              disabled={!canSubmit || createJob.isPending}
              className="mt-5 w-full py-2.5 text-white rounded-lg text-sm font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#3948CF' }}
              onMouseEnter={(e) => {
                if (canSubmit)
                  e.currentTarget.style.backgroundColor = '#2d3ba8';
              }}
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = '#3948CF')
              }
            >
              {createJob.isPending ? 'Adding...' : 'Add Application'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
