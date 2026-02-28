'use client';

import { useState } from 'react';
import {
  FileText,
  Briefcase,
  Target,
  GraduationCap,
  Wrench,
  AlertTriangle,
  Loader2,
  Key,
  Sparkles,
} from 'lucide-react';
import ResumeUpload from '../../components/resume/ResumeUpload';
import JobDescriptionInput from '../../components/resume/JobDescriptionInput';
import ScoreGauge from '../../components/resume/ScoreGauge';
import AreasToImprove from '../../components/resume/AreasToImprove';
import ScoreBreakdown from '../../components/resume/ScoreBreakdown';
import SuggestionCard from '../../components/resume/SuggestionCard';
import ApiKeyModal from '../../components/resume/ApiKeyModal';

const MOCK_RESULT = {
  score: 74,
  areasToImprove: {
    missing: [
      'React/Next.js experience not mentioned',
      'Cloud platform experience (AWS/GCP/Azure)',
      'CI/CD pipeline experience',
    ],
    weak: [
      'Leadership experience not emphasized',
      'Quantifiable metrics in achievements',
      'Cross-functional collaboration',
    ],
  },
  scoreBreakdown: [
    { label: 'Keyword Optimization', score: 72 },
    { label: 'Formatting & Structure', score: 85 },
    { label: 'Experience Relevance', score: 68 },
    { label: 'Skills Match', score: 80 },
    { label: 'Quantifiable Achievements', score: 65 },
  ],
  experienceLines: [
    'Led the development of a customer-facing dashboard using React and TypeScript that increased user engagement by 40% and reduced support tickets by 25%.',
    'Architected and implemented a microservices infrastructure on AWS handling 10M+ daily requests with 99.9% uptime.',
    'Mentored a team of 4 junior developers, implementing code review practices that reduced bug count by 35%.',
  ],
  summary: [
    'Results-driven software engineer with 5+ years of experience building scalable web applications that serve millions of users.',
    'Passionate full-stack developer specializing in React, Node.js, and cloud architecture with a proven track record of delivering high-impact projects.',
    'Senior engineer with expertise in frontend development, system design, and cross-functional team leadership.',
  ],
  education: [
    'Bachelor of Science in Computer Science, focusing on distributed systems and machine learning.',
    'Relevant coursework: Data Structures, Algorithms, System Design, Cloud Computing.',
  ],
  skills: [
    'TypeScript',
    'React',
    'Next.js',
    'GraphQL',
    'AWS',
    'Docker',
    'Kubernetes',
    'CI/CD',
  ],
};

function getScoreInfo(score: number) {
  if (score >= 85)
    return {
      label: 'Strong Match',
      badgeClass:
        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      description: 'Great! Your resume aligns well with this role.',
    };
  if (score >= 70)
    return {
      label: 'Needs Improvement',
      badgeClass:
        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500',
      description: 'Your resume could better match this job description.',
    };
  return {
    label: 'Low Match',
    badgeClass:
      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    description: 'Significant improvements needed to match this role.',
  };
}

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<typeof MOCK_RESULT | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(() => {
    try {
      return !!localStorage.getItem('prepify_openai_key');
    } catch {
      return false;
    }
  });

  const canAnalyze = !!file && jobDescription.trim().length > 0;

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setResult(MOCK_RESULT);
      setIsAnalyzing(false);
    }, 2200);
  };

  const handleAnalyze = () => {
    if (!canAnalyze) return;
    try {
      if (!localStorage.getItem('prepify_openai_key')) {
        setShowApiKeyModal(true);
        return;
      }
    } catch {
      setShowApiKeyModal(true);
      return;
    }
    runAnalysis();
  };

  const handleApiKeySave = () => {
    setHasApiKey(true);
    setShowApiKeyModal(false);
    runAnalysis();
  };

  const handleChangeApiKey = () => {
    try {
      localStorage.removeItem('prepify_openai_key');
    } catch {}
    setHasApiKey(false);
    setShowApiKeyModal(true);
  };

  const handleNewAnalysis = () => {
    setResult(null);
  };

  const scoreInfo = result ? getScoreInfo(result.score) : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Resume Analyzer
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Upload your resume and paste the job description. We&apos;ll suggest
          tailored experience lines, a summary, and skills to improve fit.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col gap-4">

          {/* Resume Upload card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#EEF0FD' }}
              >
                <FileText className="w-4.5 h-4.5" style={{ color: '#3948CF' }} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Resume Upload
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Upload your resume (PDF or DOC) for analysis
                </p>
              </div>
            </div>
            <ResumeUpload file={file} onFileChange={setFile} />
          </div>

          {/* ATS Score card */}
          {result && !isAnalyzing && scoreInfo && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                ATS Score
              </h2>
              <div className="flex items-center gap-5">
                <ScoreGauge score={result.score} size={96} />
                <div className="flex flex-col gap-2">
                  <span
                    className={`self-start px-2.5 py-1 rounded-full text-xs font-semibold ${scoreInfo.badgeClass}`}
                  >
                    {scoreInfo.label}
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {scoreInfo.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Areas to Improve card */}
          {result && !isAnalyzing && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Areas to Improve
                </h2>
              </div>
              <AreasToImprove
                missing={result.areasToImprove.missing}
                weak={result.areasToImprove.weak}
              />
            </div>
          )}

          {/* Score Breakdown card */}
          {result && !isAnalyzing && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Score Breakdown
              </h2>
              <ScoreBreakdown breakdown={result.scoreBreakdown} />
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex flex-col gap-4">

          {/* Job Description card */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#EEF0FD' }}
              >
                <Briefcase className="w-4.5 h-4.5" style={{ color: '#3948CF' }} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Job Description
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Paste the job description to compare against your resume
                </p>
              </div>
            </div>

            <JobDescriptionInput
              value={jobDescription}
              onChange={setJobDescription}
            />

            {result && !isAnalyzing ? (
              <button
                onClick={handleNewAnalysis}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Start New Analysis
              </button>
            ) : (
              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze || isAnalyzing}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                style={{ backgroundColor: '#3948CF' }}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Resume'
                )}
              </button>
            )}

            {hasApiKey && !result && (
              <div className="text-center -mt-1">
                <button
                  onClick={handleChangeApiKey}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <Key className="w-3 h-3" />
                  Change API Key
                </button>
              </div>
            )}
          </div>

          {/* Analyzing state */}
          {isAnalyzing && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 flex flex-col items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: '#EEF0FD' }}
              >
                <Sparkles
                  className="w-6 h-6 animate-pulse"
                  style={{ color: '#3948CF' }}
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Analyzing your resume...
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  This usually takes a few seconds
                </p>
              </div>
            </div>
          )}

          {/* Suggestion cards */}
          {result && !isAnalyzing && (
            <>
              <SuggestionCard
                icon={Briefcase}
                title="Experience Lines"
                items={result.experienceLines}
              />
              <SuggestionCard
                icon={Target}
                title="Summary / Headline"
                items={result.summary}
              />
              <SuggestionCard
                icon={GraduationCap}
                title="Education"
                items={result.education}
              />
              <SuggestionCard
                icon={Wrench}
                title="Skills to Add"
                items={result.skills}
                variant="skills"
              />
            </>
          )}
        </div>
      </div>

      <ApiKeyModal
        open={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={handleApiKeySave}
      />
    </div>
  );
}
