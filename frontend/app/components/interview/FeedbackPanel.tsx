import { CheckCircle, TrendingUp } from 'lucide-react';
import type { AnswerFeedback, RatingLevel } from '../../lib/interview/mockData';

interface FeedbackPanelProps {
  feedback: AnswerFeedback | null;
  questionNumber: number;
}

function RatingBadge({ label, value }: { label: string; value: RatingLevel }) {
  const colorMap: Record<RatingLevel, string> = {
    High: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    Medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    Low: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorMap[value]}`}>
        {value}
      </span>
    </div>
  );
}

export default function FeedbackPanel({ feedback, questionNumber }: FeedbackPanelProps) {
  if (!feedback) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ backgroundColor: '#EEF0FD' }}
          >
            <TrendingUp className="w-3.5 h-3.5" style={{ color: '#3948CF' }} />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Answer Feedback
          </h3>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
          Submit your answer to see AI feedback here. Each response is evaluated on accuracy,
          clarity, and depth.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Q{questionNumber} Feedback
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold" style={{ color: '#3948CF' }}>
            {feedback.score}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">/10</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${feedback.score * 10}%`, backgroundColor: '#3948CF' }}
        />
      </div>

      {/* Rating badges */}
      <div className="space-y-2 pt-0.5">
        <RatingBadge label="Accuracy" value={feedback.accuracy} />
        <RatingBadge label="Clarity" value={feedback.clarity} />
      </div>

      <hr className="border-gray-100 dark:border-gray-700" />

      {/* Strengths */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Strengths
          </span>
        </div>
        <ul className="space-y-1.5">
          {feedback.strengths.map((s, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <span className="mt-1 w-1 h-1 rounded-full bg-green-400 shrink-0" />
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Improvements */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Improvements
          </span>
        </div>
        <ul className="space-y-1.5">
          {feedback.improvements.map((s, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <span className="mt-1 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
