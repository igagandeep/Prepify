'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useJobs, useCreateJob, useUpdateJob, useDeleteJob } from '../../hooks/useJobs';
import KanbanColumn, { type ColumnConfig } from './KanbanColumn';
import JobCardContent from './JobCardContent';
import AddJobModal from './AddJobModal';
import SearchInput from '../ui/SearchInput';

const COLUMNS: ColumnConfig[] = [
  {
    id: 'Wishlist',
    label: 'Wishlist',
    headerBg: 'bg-pink-50 dark:bg-pink-950/40',
    countStyle: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
    dropBg: 'bg-pink-50/60 dark:bg-pink-950/20',
    dropActiveBg: 'bg-pink-100 dark:bg-pink-900/30',
  },
  {
    id: 'Applied',
    label: 'Applied',
    headerBg: 'bg-blue-50 dark:bg-blue-950/40',
    countStyle: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
    dropBg: 'bg-blue-50/60 dark:bg-blue-950/20',
    dropActiveBg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    id: 'Interview',
    label: 'Interview',
    headerBg: 'bg-purple-50 dark:bg-purple-950/40',
    countStyle: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    dropBg: 'bg-purple-50/60 dark:bg-purple-950/20',
    dropActiveBg: 'bg-purple-100 dark:bg-purple-900/30',
  },
  {
    id: 'Offer',
    label: 'Offer',
    headerBg: 'bg-green-50 dark:bg-green-950/40',
    countStyle: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    dropBg: 'bg-green-50/60 dark:bg-green-950/20',
    dropActiveBg: 'bg-green-100 dark:bg-green-900/30',
  },
  {
    id: 'Rejected',
    label: 'Rejected',
    headerBg: 'bg-red-50 dark:bg-red-950/40',
    countStyle: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    dropBg: 'bg-red-50/60 dark:bg-red-950/20',
    dropActiveBg: 'bg-red-100 dark:bg-red-900/30',
  },
];

export default function KanbanBoard() {
  const { data: jobs = [], isLoading, isError } = useJobs();
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();

  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeJob = activeId ? (jobs.find((j) => j.id === activeId) ?? null) : null;

  const displayed = search
    ? jobs.filter(
        (j) =>
          j.company.toLowerCase().includes(search.toLowerCase()) ||
          j.role.toLowerCase().includes(search.toLowerCase())
      )
    : jobs;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const jobId = active.id as string;
    const newStatus = over.id as string;
    const job = jobs.find((j) => j.id === jobId);
    if (!job || job.status === newStatus) return;
    updateJob.mutate({ id: jobId, data: { status: newStatus } });
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
        Loading applications...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-red-500">
        Failed to load applications. Is the backend running?
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-5">
      <div className="flex items-center justify-between flex-shrink-0">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by company or role..."
        />
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#3948CF' }}
        >
          <Plus className="w-4 h-4" />
          Add Application
        </button>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 flex-1 items-start">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              jobs={displayed.filter((j) => j.status === col.id)}
              activeId={activeId}
              onDelete={(id) => deleteJob.mutate(id)}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeJob ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3.5 shadow-2xl w-64 cursor-grabbing rotate-1 opacity-95">
              <JobCardContent job={activeJob} showMenu={false} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <AddJobModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(data) => createJob.mutate(data, { onSuccess: () => setModalOpen(false) })}
        isPending={createJob.isPending}
      />
    </div>
  );
}
