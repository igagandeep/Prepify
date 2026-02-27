'use client';

import { useEffect, useRef } from 'react';
import KanbanBoard from '../../components/jobs/KanbanBoard';
import { useJobs, useCreateJob } from '../../hooks/useJobs';
import demoJobs from '../../lib/demoJobs';

const isDemo = process.env.NEXT_PUBLIC_APP_MODE === 'demo';

function DemoSeeder() {
  const { data: jobs } = useJobs();
  const createJob = useCreateJob();
  const seeded = useRef(false);

  useEffect(() => {
    if (!isDemo || seeded.current || !jobs || jobs.length > 0) return;
    demoJobs.forEach((job) => createJob.mutate(job));
    seeded.current = true;
  }, [jobs, createJob]);

  return null;
}

export default function JobsPage() {
  return (
    <div className="flex flex-col h-full gap-5">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Job Tracker
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Track and manage all your job applications in one place.
        </p>
      </div>
      {isDemo && <DemoSeeder />}
      <KanbanBoard />
    </div>
  );
}
