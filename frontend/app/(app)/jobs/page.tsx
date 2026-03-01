'use client';

import { useEffect, useRef, useState } from 'react';

import KanbanBoard from '../../components/jobs/KanbanBoard';
import { useJobs, useCreateJob } from '../../hooks/useJobs';
import demoJobs from '../../lib/demoJobs';
import Modal from '../../components/ui/Modal';

const demoMode = process.env.NEXT_PUBLIC_APP_MODE === 'demo';

function DemoSeeder() {
  const { data: jobs } = useJobs();
  const createJob = useCreateJob();
  const seeded = useRef(false);

  useEffect(() => {
    if (!demoMode || seeded.current || !jobs || jobs.length > 0) return;
    demoJobs.forEach((job) => createJob.mutate(job));
    seeded.current = true;
  }, [jobs, createJob]);

  return null;
}

export default function JobsPage() {
  const [showDemoModal, setShowDemoModal] = useState(demoMode);

  return (
    <div className="flex flex-col h-full gap-5">
      <div className="shrink-0">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            Job Tracker
          </h1>
          {demoMode && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#EEF0FD] text-[#3948CF] dark:bg-indigo-900/30 dark:text-indigo-400">
              Demo
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Track and manage all your job applications in one place.
        </p>
      </div>
      {demoMode && <DemoSeeder />}
      <KanbanBoard />

      <Modal
        open={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        title="You're viewing a demo"
      >
        <div className="flex flex-col items-center text-center gap-4 py-1">
          <img src="/logo-light.png" alt="Prepify" className="h-6 w-auto dark:hidden" />
          <img src="/logo-dark.png" alt="Prepify" className="h-6 w-auto hidden dark:block" />
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            The <span className="font-semibold">Job Tracker</span> is running in demo mode.
            The job cards you see are pre-seeded sample data — no real applications are
            being tracked. In the full version, you can add, move, and manage your own
            job applications across the hiring pipeline.
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
