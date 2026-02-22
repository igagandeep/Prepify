'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Job } from '../../lib/api';
import JobCardContent from './JobCardContent';

interface JobCardProps {
  job: Job;
  onDelete: (id: string) => void;
  isDraggingOriginal: boolean;
}

export default function JobCard({ job, onDelete, isDraggingOriginal }: JobCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: job.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDraggingOriginal ? 0.3 : 1,
      }}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3.5 shadow-sm select-none touch-none cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <JobCardContent job={job} onDelete={onDelete} />
    </div>
  );
}
