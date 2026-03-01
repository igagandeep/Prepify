'use client';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function JobDescriptionInput({
  value,
  onChange,
}: JobDescriptionInputProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Paste the job description here..."
      rows={8}
      className="w-full px-3 py-2.5 border rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-colors border-gray-200 dark:border-gray-600 focus:border-[#3948CF] resize-y"
    />
  );
}
