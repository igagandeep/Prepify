'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, FileText, MessageCircle, Plus } from 'lucide-react';

export default function DashboardPage() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    try {
      setUserName(localStorage.getItem('prepify_username') ?? '');
    } catch {
      setUserName('');
    }
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Welcome back{userName ? `, ${userName}` : ''}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Here&apos;s an overview of your job search.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Link
          href="/jobs"
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-left hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-sm transition-all block"
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
            style={{ backgroundColor: '#EEF0FD' }}
          >
            <Briefcase className="w-5 h-5" style={{ color: '#3948CF' }} />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Job Tracking</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track applications, statuses, and follow-ups.
          </p>
          <div
            className="mt-4 flex items-center gap-1 text-sm font-medium"
            style={{ color: '#3948CF' }}
          >
            <Plus className="w-4 h-4" />
            Add application
          </div>
        </Link>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 opacity-60">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-gray-100 dark:bg-gray-700">
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Resume Analysis</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Compare your resume against job descriptions.
          </p>
          <p className="mt-4 text-sm text-gray-400">Coming soon</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 opacity-60">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-gray-100 dark:bg-gray-700">
            <MessageCircle className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Mock Interview</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Practice with AI-powered interview sessions.
          </p>
          <p className="mt-4 text-sm text-gray-400">Coming soon</p>
        </div>
      </div>
    </div>
  );
}
