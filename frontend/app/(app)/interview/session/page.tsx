'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bot, User, PlayCircle, ChevronRight, Flag } from 'lucide-react';
import {
  getMockQuestions,
  type MockQuestion,
  type InterviewType,
  type QuestionCount,
  type Difficulty,
  type SessionResult,
  type AnswerFeedback,
} from '../../../lib/interview/mockData';
import FeedbackPanel from '../../../components/interview/FeedbackPanel';

// ─── Types ────────────────────────────────────────────────────────────────────

type SessionPhase = 'idle' | 'asking' | 'submitted' | 'completed';

interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
}

// ─── Inner component (needs useSearchParams, so wrapped in Suspense) ──────────

function SessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const role = searchParams.get('role') ?? 'Software Engineer';
  const type = (searchParams.get('type') as InterviewType) ?? 'Technical';
  const count = (Number(searchParams.get('count') ?? 5)) as QuestionCount;
  const difficulty = (searchParams.get('difficulty') as Difficulty) ?? 'Medium';

  const questions: MockQuestion[] = getMockQuestions(type, count);
  const totalQuestions = questions.length;

  const [phase, setPhase] = useState<SessionPhase>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [results, setResults] = useState<SessionResult[]>([]);
  const [activeFeedback, setActiveFeedback] = useState<AnswerFeedback | null>(null);
  const [activeFeedbackIndex, setActiveFeedbackIndex] = useState(0);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'intro',
      role: 'ai',
      content: `Hi! I'm your AI interview assistant for today's session. You'll be answering ${totalQuestions} ${difficulty.toLowerCase()}-difficulty ${type.toLowerCase()} interview question${totalQuestions !== 1 ? 's' : ''} for a ${role} role. Take your time with each answer — I'll provide feedback after every response. Click "Start Interview" whenever you're ready.`,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (phase === 'asking') {
      textareaRef.current?.focus();
    }
  }, [phase]);

  // ── Actions ──────────────────────────────────────────────────────────────────

  function startInterview() {
    setPhase('asking');
    setCurrentIndex(0);
    setMessages((prev) => [
      ...prev,
      { id: 'q-0', role: 'ai', content: questions[0].question },
    ]);
  }

  function submitAnswer() {
    const answer = userAnswer.trim() || '(No answer provided)';
    const q = questions[currentIndex];

    setMessages((prev) => [
      ...prev,
      { id: `a-${currentIndex}`, role: 'user', content: answer },
    ]);

    const result: SessionResult = { ...q, userAnswer: answer };
    setResults((prev) => [...prev, result]);
    setActiveFeedback(q.feedback);
    setActiveFeedbackIndex(currentIndex + 1);
    setPhase('submitted');
    setUserAnswer('');
  }

  function nextQuestion() {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= totalQuestions) {
      setPhase('completed');
      setMessages((prev) => [
        ...prev,
        {
          id: 'done',
          role: 'ai',
          content: `Well done on completing all ${totalQuestions} question${totalQuestions !== 1 ? 's' : ''}! Click "View Results" below to see your full performance report.`,
        },
      ]);
      return;
    }

    setCurrentIndex(nextIndex);
    setPhase('asking');
    setMessages((prev) => [
      ...prev,
      { id: `q-${nextIndex}`, role: 'ai', content: questions[nextIndex].question },
    ]);
  }

  function viewResults() {
    try {
      sessionStorage.setItem(
        'prepify_interview_results',
        JSON.stringify({ role, type, count, difficulty, results })
      );
    } catch {
      // sessionStorage unavailable — results page falls back to demo data
    }
    router.push('/interview/results');
  }

  // ── Progress dots ─────────────────────────────────────────────────────────────

  const answeredCount = results.length;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">
      {/* Page header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">
            {role}
            <span className="font-normal text-gray-400 dark:text-gray-500"> — </span>
            {type} Interview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {difficulty} difficulty
          </p>
        </div>

        {/* Progress indicator */}
        {phase !== 'idle' && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400 tabular-nums">
              Question {Math.min(currentIndex + 1, totalQuestions)} of {totalQuestions}
            </span>
            <div className="flex items-center gap-1">
              {questions.map((_, i) => {
                const isDone = i < answeredCount;
                const isCurrent = i === currentIndex && phase !== 'idle';
                return (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      !isDone && !isCurrent ? 'bg-gray-200 dark:bg-gray-600' : ''
                    }`}
                    style={{
                      backgroundColor: isDone
                        ? '#3948CF'
                        : isCurrent
                        ? '#93A3F8'
                        : undefined,
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Two-column layout */}
      <div className="flex gap-4 items-start">
        {/* ── Chat column ── */}
        <div className="flex-1 min-w-0 flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          {/* Messages area */}
          <div
            className="overflow-y-auto p-5 space-y-5 flex-1"
            style={{ height: 'calc(100vh - 340px)', minHeight: '320px' }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'ai'
                      ? 'bg-[#EEF0FD]'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  {msg.role === 'ai' ? (
                    <Bot className="w-4 h-4" style={{ color: '#3948CF' }} />
                  ) : (
                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'ai'
                      ? 'bg-gray-50 dark:bg-gray-700/60 text-gray-800 dark:text-gray-100 rounded-tl-sm'
                      : 'text-white rounded-tr-sm'
                  }`}
                  style={msg.role === 'user' ? { backgroundColor: '#3948CF' } : {}}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom action bar */}
          <div className="border-t border-gray-100 dark:border-gray-700 p-4">
            {phase === 'idle' && (
              <button
                onClick={startInterview}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#3948CF' }}
              >
                <PlayCircle className="w-4 h-4" />
                Start Interview
              </button>
            )}

            {phase === 'asking' && (
              <div className="space-y-3">
                <textarea
                  ref={textareaRef}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    // Ctrl/Cmd+Enter submits
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && userAnswer.trim()) {
                      e.preventDefault();
                      submitAnswer();
                    }
                  }}
                  rows={4}
                  placeholder="Type your answer here… (Ctrl+Enter to submit)"
                  className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#3948CF] resize-none transition-colors"
                />
                <button
                  onClick={submitAnswer}
                  disabled={!userAnswer.trim()}
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#3948CF' }}
                >
                  Submit Answer
                </button>
              </div>
            )}

            {phase === 'submitted' && currentIndex < totalQuestions - 1 && (
              <button
                onClick={nextQuestion}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#3948CF' }}
              >
                Next Question
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {phase === 'submitted' && currentIndex === totalQuestions - 1 && (
              <button
                onClick={nextQuestion}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#3948CF' }}
              >
                <Flag className="w-4 h-4" />
                Finish Interview
              </button>
            )}

            {phase === 'completed' && (
              <button
                onClick={viewResults}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#3948CF' }}
              >
                View Results
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── Feedback sidebar ── */}
        <div className="w-72 shrink-0">
          <FeedbackPanel
            feedback={activeFeedback}
            questionNumber={activeFeedbackIndex}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Page export (Suspense required for useSearchParams in static export) ─────

export default function InterviewSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-gray-400 dark:text-gray-500">Loading session…</p>
        </div>
      }
    >
      <SessionContent />
    </Suspense>
  );
}
