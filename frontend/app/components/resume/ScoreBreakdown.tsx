'use client';

import { useEffect, useState } from 'react';

interface ScoreBreakdownProps {
  breakdown: { label: string; score: number }[];
}

export default function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {breakdown.map(({ label, score }) => (
        <div key={label}>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {label}
            </span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {score}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: animated ? `${score}%` : '0%',
                backgroundColor: '#3948CF',
                transition: 'width 1s ease-out',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
