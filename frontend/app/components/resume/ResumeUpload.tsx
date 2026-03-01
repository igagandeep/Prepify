'use client';

import { useRef, useState } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';

const ACCEPTED = ['.pdf', '.docx', '.txt'];

interface ResumeUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export default function ResumeUpload({ file, onFileChange }: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (f: File) => {
    const ext = '.' + (f.name.split('.').pop()?.toLowerCase() ?? '');
    if (ACCEPTED.includes(ext)) onFileChange(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = '';
  };

  if (file) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: '#EEF0FD' }}
        >
          <FileText className="w-4 h-4" style={{ color: '#3948CF' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-400">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="text-xs font-medium transition-opacity hover:opacity-70 shrink-0"
          style={{ color: '#3948CF' }}
        >
          Change
        </button>
        <button
          onClick={() => onFileChange(null)}
          aria-label="Remove file"
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          onChange={handleChange}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition-all ${
        isDragging
          ? 'border-[#3948CF] bg-[#EEF0FD] dark:bg-gray-700'
          : 'border-gray-200 dark:border-gray-700 hover:border-[#3948CF] hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
        style={{
          backgroundColor: isDragging ? '#3948CF' : '#EEF0FD',
        }}
      >
        <UploadCloud
          className="w-6 h-6 transition-colors"
          style={{ color: isDragging ? '#ffffff' : '#3948CF' }}
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Drag & drop your resume
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          or{' '}
          <span className="font-medium" style={{ color: '#3948CF' }}>
            browse files
          </span>
        </p>
        <p className="text-xs text-gray-400 mt-1">PDF, DOCX, TXT</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
