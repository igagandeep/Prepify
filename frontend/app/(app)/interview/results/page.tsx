'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  LayoutDashboard,
} from 'lucide-react';
import {
  DEMO_RESULTS,
  type MockResults,
  type SessionResult,
  type RatingLevel,
} from '../../../lib/interview/mockData';
import CircularScore from '../../../components/interview/CircularScore';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreToColor(score: number): string {
  return score >= 8 ? '#22c55e' : score >= 6 ? '#f59e0b' : '#ef4444';
}

function recommendationStyles(overall: number): string {
  if (overall >= 80)
    return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800';
  if (overall >= 60)
    return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
  return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800';
}

const RATING_COLORS: Record<RatingLevel, string> = {
  High: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  Medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  Low: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

// ─── Question breakdown accordion item ───────────────────────────────────────

function QuestionCard({
  result,
  index,
  isExpanded,
  onToggle,
}: {
  result: SessionResult;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const fb = result.feedback;
  const color = scoreToColor(fb.score);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      {/* Header row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
      >
        {/* Question number */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: '#3948CF' }}
        >
          {index + 1}
        </div>

        {/* Question text */}
        <p className="flex-1 min-w-0 text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {result.question}
        </p>

        {/* Score + chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-bold" style={{ color }}>
            {fb.score}/10
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded body */}
      {isExpanded && (
        <div className="border-t border-gray-100 dark:border-gray-700 p-4 space-y-4">
          {/* User answer */}
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">
              Your Answer
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2.5">
              {result.userAnswer}
            </p>
          </div>

          {/* Accuracy / Clarity badges */}
          <div className="flex items-center gap-3">
            {(['accuracy', 'clarity'] as const).map((key) => {
              const val = fb[key] as RatingLevel;
              return (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {key}:
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${RATING_COLORS[val]}`}>
                    {val}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Strengths + Improvements */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1.5">
                Strengths
              </p>
              <ul className="space-y-1">
                {fb.strengths.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400"
                  >
                    <span className="mt-1 w-1 h-1 rounded-full bg-green-400 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1.5">
                Improvements
              </p>
              <ul className="space-y-1">
                {fb.improvements.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400"
                  >
                    <span className="mt-1 w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InterviewResultsPage() {
  const [results, setResults] = useState<MockResults>(DEMO_RESULTS);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // Load session results from sessionStorage.
  // Live mode stores AI-generated summary fields alongside per-question data.
  // Demo mode stores only per-question data; summary falls back to DEMO_RESULTS.
  useEffect(() => {
    // If the user lands here without any session data we don't have anything to
    // show. Redirect them back to the setup page rather than rendering the
    // demo fallback (which would be confusing).
    try {
      const stored = sessionStorage.getItem('prepify_interview_results');
      if (!stored) {
        router.push('/interview');
        return;
      }

      const parsed = JSON.parse(stored) as {
        results?: SessionResult[];
        overallScore?: number;
        summary?: string;
        topStrengths?: string[];
        areasToImprove?: string[];
        recommendation?: string;
      };

      if (!parsed.results || parsed.results.length === 0) return;

      // Use AI-provided overallScore (0-100) if present; otherwise compute from per-question scores
      const computedScore = Math.round(
        (parsed.results.reduce((sum, r) => sum + r.feedback.score, 0) /
          parsed.results.length) *
          10,
      );

      setResults({
        ...DEMO_RESULTS,
        overallScore: typeof parsed.overallScore === 'number' ? parsed.overallScore : computedScore,
        summary: typeof parsed.summary === 'string' ? parsed.summary : DEMO_RESULTS.summary,
        topStrengths: Array.isArray(parsed.topStrengths) ? parsed.topStrengths : DEMO_RESULTS.topStrengths,
        areasToImprove: Array.isArray(parsed.areasToImprove) ? parsed.areasToImprove : DEMO_RESULTS.areasToImprove,
        recommendation: typeof parsed.recommendation === 'string' ? parsed.recommendation : DEMO_RESULTS.recommendation,
        questions: parsed.results,
      });
    } catch {
      // Fall back to demo data
    }
  }, []);

  function toggleExpanded(i: number) {
    setExpandedIndex((prev) => (prev === i ? null : i));
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            Interview Results
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Here&apos;s a detailed breakdown of your performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            href="/interview"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#3948CF' }}
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Link>
        </div>
      </div>

      {/* Two-column layout: summary left, breakdown right */}
      <div className="grid grid-cols-5 gap-5 items-start">
        {/* ── Left: summary column (2/5) ── */}
        <div className="col-span-2 space-y-4">
          {/* Score card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center text-center">
            <CircularScore score={results.overallScore} size={140} />
            <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Overall Score
            </p>
            <div
              className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${recommendationStyles(results.overallScore)}`}
            >
              <Award className="w-3.5 h-3.5 shrink-0" />
              {results.recommendation}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Summary
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {results.summary}
            </p>
          </div>

          {/* Top Strengths */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md flex items-center justify-center bg-green-50 dark:bg-green-900/20 shrink-0">
                <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Top Strengths
              </h3>
            </div>
            <ul className="space-y-2">
              {results.topStrengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Areas to Improve */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 shrink-0">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Areas to Improve
              </h3>
            </div>
            <ul className="space-y-2">
              {results.areasToImprove.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Right: per-question breakdown (3/5) ── */}
        <div className="col-span-3 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Question Breakdown
          </h3>
          {results.questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              result={q}
              index={i}
              isExpanded={expandedIndex === i}
              onToggle={() => toggleExpanded(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
