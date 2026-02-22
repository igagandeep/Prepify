'use client';

import { useDroppable } from '@dnd-kit/core';
import type { Job } from '../../lib/api';
import JobCard from './JobCard';

export interface ColumnConfig {
  id: string;
  label: string;
  headerBg: string;
  countStyle: string;
  dropBg: string;
  dropActiveBg: string;
}

interface KanbanColumnProps {
  column: ColumnConfig;
  jobs: Job[];
  activeId: string | null;
  onDelete: (id: string) => void;
}

export default function KanbanColumn({ column, jobs, activeId, onDelete }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col flex-1 min-w-0">
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-xl ${column.headerBg}`}>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {column.label}
        </span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${column.countStyle}`}>
          {jobs.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[120px] flex flex-col gap-2 p-2 rounded-b-xl transition-colors duration-150 ${
          isOver ? column.dropActiveBg : column.dropBg
        }`}
      >
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onDelete={onDelete}
            isDraggingOriginal={activeId === job.id}
          />
        ))}
      </div>
    </div>
  );
}
