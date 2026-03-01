'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bot, User, PlayCircle, ChevronRight, Flag, Loader2, AlertCircle, Mic, MicOff } from 'lucide-react';
import { useSpeechRecognition } from '../../../hooks/useSpeechRecognition';
import {
  getMockQuestions,
  type MockQuestion,
  type InterviewType,
  type QuestionCount,
  type Difficulty,
  type AnswerFeedback,
} from '../../../lib/interview/mockData';
import FeedbackPanel from '../../../components/interview/FeedbackPanel';
import ApiKeyModal from '../../../components/resume/ApiKeyModal';
import {
  apiStartInterview,
  apiEvaluateAnswer,
  apiCompleteInterview,
  extractInterviewError,
  type LiveFeedback,
} from '../../../lib/api/interview';

type SessionPhase = 'idle' | 'loading' | 'asking' | 'submitted' | 'completed';

interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
}

function getIsLive(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    process.env.NODE_ENV === 'development' ||
    window.location.hostname === 'localhost'
  );
}

function getStoredApiKey(): string | null {
  try {
    return localStorage.getItem('prepify_api_key');
  } catch {
    return null;
  }
}

function toLiveFeedback(f: LiveFeedback | AnswerFeedback): AnswerFeedback {
  return f as AnswerFeedback;
}

function SessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams.get('role')) {
      router.push('/interview');
    }
  }, [router, searchParams]);

  const role = searchParams.get('role') ?? 'Software Engineer';
  const type = (searchParams.get('type') as InterviewType) ?? 'Technical';
  const count = Number(searchParams.get('count') ?? 5) as QuestionCount;
  const difficulty = (searchParams.get('difficulty') as Difficulty) ?? 'Medium';

  const isLive = getIsLive();

  const mockQData = useRef<MockQuestion[]>(
    isLive ? [] : getMockQuestions(type, count),
  ).current;

  const [questions, setQuestions] = useState<string[]>(() =>
    isLive ? [] : mockQData.map((q) => q.question),
  );

  const [phase, setPhase] = useState<SessionPhase>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');

  const [activeFeedback, setActiveFeedback] = useState<AnswerFeedback | null>(null);
  const [activeFeedbackIndex, setActiveFeedbackIndex] = useState(0);

  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const pendingStart = useRef(false);

  const [collectedAnswers, setCollectedAnswers] = useState<string[]>([]);
  const [collectedFeedbacks, setCollectedFeedbacks] = useState<AnswerFeedback[]>([]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'intro',
      role: 'ai',
      content: `Hi! I'm your AI interview assistant for today's session. You'll be answering ${count} ${difficulty.toLowerCase()}-difficulty ${type.toLowerCase()} interview questions for a ${role} role. Take your time with each answer — I'll provide feedback after every response. Click "Start Interview" whenever you're ready.`,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    state: speechState,
    error: speechError,
    startListening,
    stopListening,
    clearError: clearSpeechError,
    isSupported: isSpeechSupported,
  } = useSpeechRecognition({
    onTranscript: (transcript) => {
      setUserAnswer((prev) => (prev ? prev + ' ' + transcript : transcript));
    },
    language: 'en-US',
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (phase === 'asking') textareaRef.current?.focus();
  }, [phase]);

  const totalQuestions = questions.length > 0 ? questions.length : count;
  const answeredCount = collectedAnswers.length;

  async function doLiveStart(apiKey: string) {
    setIsLoading(true);
    setPhase('loading');
    setApiError(null);
    try {
      const data = await apiStartInterview({
        role,
        type,
        questionCount: count,
        difficulty,
        apiKey,
      });
      setSessionId(data.sessionId);
      setQuestions(data.questions);
      setMessages((prev) => [
        ...prev,
        { id: 'intro-live', role: 'ai', content: data.introduction },
        { id: 'q-0', role: 'ai', content: data.questions[0] },
      ]);
      setCurrentIndex(0);
      setPhase('asking');
    } catch (err) {
      setApiError(extractInterviewError(err));
      setPhase('idle');
    } finally {
      setIsLoading(false);
    }
  }

  function handleStartInterview() {
    if (isLive) {
      const key = getStoredApiKey();
      if (!key) {
        pendingStart.current = true;
        setShowApiKeyModal(true);
        return;
      }
      doLiveStart(key);
    } else {
      setPhase('asking');
      setCurrentIndex(0);
      setMessages((prev) => [
        ...prev,
        { id: 'q-0', role: 'ai', content: questions[0] },
      ]);
    }
  }

  function handleApiKeySave() {
    setShowApiKeyModal(false);
    if (pendingStart.current) {
      pendingStart.current = false;
      const key = getStoredApiKey();
      if (key) doLiveStart(key);
    }
  }

  async function handleSubmitAnswer() {
    const answer = userAnswer.trim() || '(No answer provided)';
    setUserAnswer('');

    setMessages((prev) => [
      ...prev,
      { id: `a-${currentIndex}`, role: 'user', content: answer },
    ]);

    if (isLive) {
      setIsLoading(true);
      setPhase('loading');
      setApiError(null);
      try {
        const apiKey = getStoredApiKey() ?? '';
        const feedback = await apiEvaluateAnswer({
          sessionId,
          questionIndex: currentIndex,
          question: questions[currentIndex],
          answer,
          apiKey,
        });
        const unified = toLiveFeedback(feedback);
        setCollectedAnswers((prev) => [...prev, answer]);
        setCollectedFeedbacks((prev) => [...prev, unified]);
        setActiveFeedback(unified);
        setActiveFeedbackIndex(currentIndex + 1);
        setPhase('submitted');
      } catch (err) {
        // Revert — remove the user bubble, restore answer, go back to asking
        setMessages((prev) => prev.filter((m) => m.id !== `a-${currentIndex}`));
        setUserAnswer(answer);
        setApiError(extractInterviewError(err));
        setPhase('asking');
      } finally {
        setIsLoading(false);
      }
    } else {
      const mockFeedback = mockQData[currentIndex].feedback;
      setCollectedAnswers((prev) => [...prev, answer]);
      setCollectedFeedbacks((prev) => [...prev, mockFeedback]);
      setActiveFeedback(mockFeedback);
      setActiveFeedbackIndex(currentIndex + 1);
      setPhase('submitted');
    }
  }

  function handleNextQuestion() {
    const nextIndex = currentIndex + 1;
    const actualTotal = questions.length;

    if (nextIndex >= actualTotal) {
      setPhase('completed');
      setMessages((prev) => [
        ...prev,
        {
          id: 'done',
          role: 'ai',
          content: `Well done on completing all ${actualTotal} question${actualTotal !== 1 ? 's' : ''}! Click "View Results" below to see your full performance report.`,
        },
      ]);
      return;
    }

    setCurrentIndex(nextIndex);
    setPhase('asking');
    setMessages((prev) => [
      ...prev,
      { id: `q-${nextIndex}`, role: 'ai', content: questions[nextIndex] },
    ]);
  }

  async function handleViewResults() {
    const questionResults = questions.map((q, i) => ({
      id: i + 1,
      question: q,
      userAnswer: collectedAnswers[i] ?? '(No answer provided)',
      feedback: collectedFeedbacks[i],
    }));

    if (isLive) {
      setIsLoading(true);
      setApiError(null);
      try {
        const apiKey = getStoredApiKey() ?? '';
        const final = await apiCompleteInterview({
          sessionId,
          role,
          answers: collectedAnswers,
          feedbacks: collectedFeedbacks as LiveFeedback[],
          apiKey,
        });
        // overallScore from API is 1–10; results page expects 0–100
        sessionStorage.setItem(
          'prepify_interview_results',
          JSON.stringify({
            role,
            type,
            count,
            difficulty,
            results: questionResults,
            overallScore: Math.round(final.overallScore * 10),
            summary: final.summary,
            topStrengths: final.topStrengths,
            areasToImprove: final.areasToImprove,
            recommendation: final.recommendation,
          }),
        );
      } catch {
        // /complete failed — still navigate with per-question data; results page
        // will compute overallScore from individual scores and use DEMO_RESULTS text
        try {
          sessionStorage.setItem(
            'prepify_interview_results',
            JSON.stringify({ role, type, count, difficulty, results: questionResults }),
          );
        } catch {
          // ignore
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        sessionStorage.setItem(
          'prepify_interview_results',
          JSON.stringify({ role, type, count, difficulty, results: questionResults }),
        );
      } catch {
        // ignore
      }
    }

    router.push('/interview/results');
  }

  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">
            {role}
            <span className="font-normal text-gray-400 dark:text-gray-500"> — </span>
            {type} Interview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {difficulty} difficulty
            {isLive && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                Live AI
              </span>
            )}
          </p>
        </div>

        {phase !== 'idle' && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400 tabular-nums">
              Question {Math.min(currentIndex + 1, totalQuestions)} of {totalQuestions}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalQuestions }).map((_, i) => {
                const isDone = i < answeredCount;
                const isCurrent = i === currentIndex;
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

      <div className="flex gap-4 items-start">
        <div className="flex-1 min-w-0 flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div
            className="overflow-y-auto p-5 space-y-5"
            style={{ height: 'calc(100vh - 340px)', minHeight: '320px' }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === 'ai' ? 'bg-[#EEF0FD]' : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  {msg.role === 'ai' ? (
                    <Bot className="w-4 h-4" style={{ color: '#3948CF' }} />
                  ) : (
                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                </div>
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

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[#EEF0FD]">
                  <Bot className="w-4 h-4" style={{ color: '#3948CF' }} />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-gray-50 dark:bg-gray-700/60">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {apiError && (
            <div className="mx-4 mb-3 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">{apiError}</p>
              <button
                onClick={() => setApiError(null)}
                className="ml-auto text-red-400 hover:text-red-600 text-xs shrink-0"
              >
                ✕
              </button>
            </div>
          )}

          <div className="border-t border-gray-100 dark:border-gray-700 p-4">
            {phase === 'idle' && (
              <button
                onClick={handleStartInterview}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#3948CF' }}
              >
                <PlayCircle className="w-4 h-4" />
                Start Interview
              </button>
            )}

            {phase === 'loading' && (
              <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                AI is thinking…
              </div>
            )}

            {phase === 'asking' && (
              <div className="space-y-3">
                {speechError && (
                  <div className="mx-0 mb-3 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 leading-relaxed">{speechError}</p>
                    <button
                      onClick={clearSpeechError}
                      className="ml-auto text-yellow-500 hover:text-yellow-700 text-xs shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && userAnswer.trim()) {
                        e.preventDefault();
                        handleSubmitAnswer();
                      }
                    }}
                    disabled={speechState === 'listening'}
                    rows={4}
                    placeholder={
                      speechState === 'listening'
                        ? 'Listening… speak your answer'
                        : 'Type your answer here… (Ctrl+Enter to submit)'
                    }
                    className={`w-full px-3 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none resize-none transition-colors disabled:cursor-not-allowed ${
                      speechState === 'listening'
                        ? 'border-red-400 dark:border-red-500 focus:border-red-400 pr-11'
                        : 'border-gray-200 dark:border-gray-600 focus:border-[#3948CF] pr-11'
                    }`}
                  />

                  {isSpeechSupported && (
                    <button
                      onClick={speechState === 'listening' ? stopListening : startListening}
                      disabled={speechState === 'processing'}
                      title={speechState === 'listening' ? 'Stop recording' : 'Speak your answer'}
                      className={`absolute bottom-2.5 right-2.5 w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        speechState === 'listening'
                          ? 'bg-red-500/10 dark:bg-red-500/25 border-red-400 dark:border-red-400'
                          : 'bg-indigo-600/10 dark:bg-indigo-500/30 border-indigo-600 dark:border-indigo-400'
                      }`}
                    >
                      {speechState === 'listening' ? (
                        <MicOff className="w-3.5 h-3.5 text-red-500 dark:text-red-400 animate-pulse" />
                      ) : (
                        <Mic className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </button>
                  )}
                </div>

                {speechState === 'listening' && (
                  <p className="text-xs text-red-500 dark:text-red-400">
                    Recording — click the mic to stop
                  </p>
                )}

                <button
                  onClick={handleSubmitAnswer}
                  disabled={!userAnswer.trim() || speechState === 'processing'}
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#3948CF' }}
                >
                  Submit Answer
                </button>
              </div>
            )}

            {phase === 'submitted' && !isLastQuestion && (
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#3948CF' }}
              >
                Next Question
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {phase === 'submitted' && isLastQuestion && (
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#3948CF' }}
              >
                <Flag className="w-4 h-4" />
                Finish Interview
              </button>
            )}

            {phase === 'completed' && (
              <button
                onClick={handleViewResults}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ backgroundColor: '#3948CF' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating report…
                  </>
                ) : (
                  <>
                    View Results
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="w-72 shrink-0">
          <FeedbackPanel feedback={activeFeedback} questionNumber={activeFeedbackIndex} />
        </div>
      </div>

      <ApiKeyModal
        open={showApiKeyModal}
        onClose={() => {
          setShowApiKeyModal(false);
          pendingStart.current = false;
        }}
        onSave={handleApiKeySave}
      />
    </div>
  );
}

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
