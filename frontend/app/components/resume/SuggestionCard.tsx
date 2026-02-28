'use client';

import { useState } from 'react';
import { Copy, Check, type LucideIcon } from 'lucide-react';

interface SuggestionCardProps {
  icon: LucideIcon;
  title: string;
  items: string[];
  variant?: 'text' | 'skills';
}

function CopyButton({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy"
      className={`p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shrink-0 ${className}`}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-500" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

function SkillChip({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:border-[#3948CF] hover:bg-[#EEF0FD] dark:hover:border-indigo-500 dark:hover:bg-indigo-900/20 transition-all text-sm text-gray-700 dark:text-gray-300 hover:text-[#3948CF] dark:hover:text-indigo-300"
    >
      <span>{text}</span>
      {copied ? (
        <Check className="w-3 h-3 text-green-500 shrink-0" />
      ) : (
        <Copy className="w-3 h-3 text-gray-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}

export default function SuggestionCard({
  icon: Icon,
  title,
  items,
  variant = 'text',
}: SuggestionCardProps) {
  const [allCopied, setAllCopied] = useState(false);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(items.join(', '));
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-800">
      {/* Card header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#EEF0FD' }}
          >
            <Icon className="w-4.5 h-4.5" style={{ color: '#3948CF' }} />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
        </div>
        {variant === 'skills' && (
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            {allCopied ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {allCopied ? 'Copied!' : 'Copy All'}
          </button>
        )}
      </div>

      {/* Card body */}
      {variant === 'skills' ? (
        <div className="p-5 flex flex-wrap gap-2">
          {items.map((item, i) => (
            <SkillChip key={i} text={item} />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
          {items.map((item, i) => (
            <div
              key={i}
              className="group flex items-start gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors"
            >
              <p className="flex-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {item}
              </p>
              <CopyButton text={item} className="opacity-0 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
