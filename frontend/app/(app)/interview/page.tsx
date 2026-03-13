'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import type { InterviewType, Difficulty, QuestionCount } from '@/lib/mockData/interview';
import Modal from '@/components/ui/Modal';

function getIsLive(): boolean {
  if (typeof window === 'undefined') return true;
  return (
    process.env.NODE_ENV === 'development' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
}

const isLive = getIsLive();

interface FormState {
  role: string;
  type: InterviewType;
  count: QuestionCount;
  difficulty: Difficulty;
}

interface FormErrors {
  role?: string;
}

export default function InterviewSetupPage() {
  const router = useRouter();
  const [showDemoModal, setShowDemoModal] = useState(!isLive);

  const [form, setForm] = useState<FormState>({
    role: '',
    type: 'Technical',
    count: 5,
    difficulty: 'Medium',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.role.trim()) errs.role = 'Job role is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const params = new URLSearchParams({
      role: form.role.trim(),
      type: form.type,
      count: String(form.count),
      difficulty: form.difficulty,
    });
    router.push(`/interview/session?${params.toString()}`);
  }

  const selectClass =
    'w-full appearance-none px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#3948CF] transition-colors pr-9';

  return (
    <div className="max-w-lg mx-auto">
      {/* Page header */}
      <div className="mb-8 mt-10">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Mock Interview</h1>
          {!isLive && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#EEF0FD] text-[#3948CF] dark:bg-indigo-900/30 dark:text-indigo-400">
              Demo
            </span>
          )}
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Configure your AI-powered interview session and receive personalised feedback.
        </p>
      </div>

      {/* Form card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Job Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Job Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.role}
              onChange={(e) => {
                setForm((f) => ({ ...f, role: e.target.value }));
                if (errors.role) setErrors((err) => ({ ...err, role: undefined }));
              }}
              placeholder="e.g. Software Engineer, Product Manager"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors ${
                errors.role
                  ? 'border-red-400 dark:border-red-500 focus:border-red-400'
                  : 'border-gray-200 dark:border-gray-600 focus:border-[#3948CF]'
              }`}
            />
            {errors.role && (
              <p className="mt-1.5 text-xs text-red-500">{errors.role}</p>
            )}
          </div>

          {/* Interview Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Interview Type
            </label>
            <div className="relative">
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value as InterviewType }))
                }
                className={selectClass}
              >
                <option value="Technical">Technical</option>
                <option value="Behavioral">Behavioral</option>
                <option value="Mixed">Mixed</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
              {form.type === 'Technical' && 'System design, algorithms, and coding concepts.'}
              {form.type === 'Behavioral' && 'Situational and competency-based questions.'}
              {form.type === 'Mixed' && 'A blend of technical and behavioural questions.'}
            </p>
          </div>

          {/* Number of Questions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Number of Questions
            </label>
            <div className="relative">
              <select
                value={form.count}
                onChange={(e) =>
                  setForm((f) => ({ ...f, count: Number(e.target.value) as QuestionCount }))
                }
                className={selectClass}
              >
                <option value={5}>5 Questions (~10 min)</option>
                <option value={10}>10 Questions (~20 min)</option>
                <option value={15}>15 Questions (~30 min)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Difficulty
            </label>
            {/* Segmented control */}
            <div className="flex border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, difficulty: level }))}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                    form.difficulty === level
                      ? 'text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-white dark:bg-gray-700'
                  }`}
                  style={form.difficulty === level ? { backgroundColor: '#3948CF' } : {}}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 mt-2"
            style={{ backgroundColor: '#3948CF' }}
          >
            Start Session
          </button>
        </form>
      </div>
      <Modal
        open={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        title="You're viewing a demo"
      >
        <div className="flex flex-col items-center text-center gap-4 py-1">
          <img src="/logo-light.png" alt="Prepify" className="h-6 w-auto dark:hidden" />
          <img src="/logo-dark.png" alt="Prepify" className="h-6 w-auto hidden dark:block" />
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            The <span className="font-semibold">Mock Interview</span> is running in demo mode.
            Questions and AI feedback are pre-built examples, not generated live. In the full
            version, questions are tailored to your role and difficulty, and feedback is
            powered by a real AI model.
          </p>
          <button
            onClick={() => setShowDemoModal(false)}
            className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#3948CF' }}
          >
            Got it, explore the demo
          </button>
        </div>
      </Modal>
    </div>
  );
}
