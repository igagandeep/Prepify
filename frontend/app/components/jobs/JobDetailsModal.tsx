'use client';

import { MapPin, DollarSign, Calendar, ExternalLink, Briefcase, FileText } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import type { Job } from '@/types/job';

interface JobDetailsModalProps {
  job: Job | null;
  onClose: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  Wishlist: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  Applied: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Interview: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Offer: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export default function JobDetailsModal({ job, onClose }: JobDetailsModalProps) {
  if (!job) return null;

  return (
    <Modal open={!!job} onClose={onClose} title="Job Details">
      <div className="flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
            style={{ backgroundColor: '#3948CF' }}
          >
            {job.company.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
              {job.role}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{job.company}</p>
          </div>
          <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_STYLES[job.status] ?? 'bg-gray-100 text-gray-600'}`}>
            {job.status}
          </span>
        </div>

        <div className="h-px bg-gray-100 dark:bg-gray-700" />

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3">
          {job.location && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Location</p>
                <p className="text-sm text-gray-700 dark:text-gray-200">{job.location}</p>
              </div>
            </div>
          )}
          {job.salary && (
            <div className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Salary</p>
                <p className="text-sm text-gray-700 dark:text-gray-200">{job.salary}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Applied</p>
              <p className="text-sm text-gray-700 dark:text-gray-200">
                {new Date(job.appliedAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Briefcase className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Status</p>
              <p className="text-sm text-gray-700 dark:text-gray-200">{job.status}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {job.notes && (
          <>
            <div className="h-px bg-gray-100 dark:bg-gray-700" />
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto pr-1">
                  {job.notes}
                </p>
              </div>
            </div>
          </>
        )}

        {/* View Posting button */}
        {job.jobUrl && (
          <a
            href={job.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#3948CF' }}
          >
            <ExternalLink className="w-4 h-4" />
            View Job Posting
          </a>
        )}
      </div>
    </Modal>
  );
}
