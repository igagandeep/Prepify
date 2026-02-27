'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, MoreVertical, Trash2, MapPin, DollarSign, ExternalLink } from 'lucide-react';
import type { Job } from '../../types/job';

interface JobCardContentProps {
  job: Job;
  onDelete?: (id: string) => void;
  showMenu?: boolean;
}

export default function JobCardContent({ job, onDelete, showMenu = true }: JobCardContentProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: '#3948CF' }}
          >
            {job.company.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight truncate">
              {job.role}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {job.company}
            </p>
          </div>
        </div>

        {showMenu && onDelete && (
          <div
            ref={menuRef}
            className="relative flex-shrink-0"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-7 z-30 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 w-28">
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(job.id); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        {job.location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-400 dark:text-gray-500 truncate">{job.location}</span>
          </div>
        )}
        {job.salary && (
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-400 dark:text-gray-500 truncate">{job.salary}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Applied{' '}
            {new Date(job.appliedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      {job.notes && (
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{job.notes}</p>
      )}

      {job.jobUrl && (
        <a
          href={job.jobUrl}
          target="_blank"
          rel="noopener noreferrer"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 text-xs font-medium hover:opacity-80 transition-opacity mt-0.5"
          style={{ color: '#3948CF' }}
        >
          <ExternalLink className="w-3 h-3" />
          View Posting
        </a>
      )}
    </div>
  );
}
