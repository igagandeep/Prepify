import { AlertCircle, AlertTriangle } from 'lucide-react';

interface AreasToImproveProps {
  missing: string[];
  weak: string[];
}

export default function AreasToImprove({ missing, weak }: AreasToImproveProps) {
  return (
    <div className="flex flex-col gap-5">
      {missing.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Missing
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {missing.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/15"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {weak.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Weak
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {weak.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/15"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
