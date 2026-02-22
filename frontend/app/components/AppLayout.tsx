'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  MessageCircle,
  PanelLeft,
  Plus,
  Sun,
  Moon,
} from 'lucide-react';
import JobTracking from './JobTracking';
import { useTheme } from '../providers/ThemeProvider';

type Page = 'dashboard' | 'jobTracking' | 'resumeAnalysis' | 'mockInterview';

const NAV_ITEMS: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'jobTracking', label: 'Job Tracking', icon: Briefcase },
  { id: 'resumeAnalysis', label: 'Resume Analysis', icon: FileText },
  { id: 'mockInterview', label: 'Mock Interview', icon: MessageCircle },
];

function DashboardPage({
  userName,
  onNavigate,
}: {
  userName: string;
  onNavigate: (page: Page) => void;
}) {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Welcome back, {userName}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Here&apos;s an overview of your job search.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('jobTracking')}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-left hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-sm transition-all"
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
            style={{ backgroundColor: '#EEF0FD' }}
          >
            <Briefcase className="w-5 h-5" style={{ color: '#3948CF' }} />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Job Tracking</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track applications, statuses, and follow-ups.
          </p>
          <div className="mt-4 flex items-center gap-1 text-sm font-medium" style={{ color: '#3948CF' }}>
            <Plus className="w-4 h-4" />
            Add application
          </div>
        </button>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 opacity-60">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-gray-100 dark:bg-gray-700">
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Resume Analysis</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Compare your resume against job descriptions.</p>
          <p className="mt-4 text-sm text-gray-400">Coming soon</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 opacity-60">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 bg-gray-100 dark:bg-gray-700">
            <MessageCircle className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Mock Interview</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Practice with AI-powered interview sessions.</p>
          <p className="mt-4 text-sm text-gray-400">Coming soon</p>
        </div>
      </div>
    </div>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">{title}</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm">This feature is coming soon.</p>
    </div>
  );
}

export default function AppLayout({ userName }: { userName: string }) {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';
  const activeNavStyle = {
    backgroundColor: isDark ? 'rgba(99,102,241,0.15)' : '#EEF0FD',
    color: isDark ? '#818cf8' : '#3948CF',
  };
  const inactiveColor = isDark ? '#9ca3af' : '#6b7280';
  const hoverBg = isDark ? '#1f2937' : '#f9fafb';
  const hoverColor = isDark ? '#f9fafb' : '#111827';

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {sidebarOpen && (
        <aside className="w-56 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0">
          <div className="px-4 py-4 flex items-center gap-2.5 border-b border-gray-100 dark:border-gray-700">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#3948CF' }}>
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-gray-100">Prepify</span>
          </div>

          <nav className="flex-1 p-3 space-y-0.5">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActivePage(id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left"
                style={activePage === id ? activeNavStyle : { color: inactiveColor }}
                onMouseEnter={(e) => {
                  if (activePage !== id) {
                    e.currentTarget.style.backgroundColor = hoverBg;
                    e.currentTarget.style.color = hoverColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activePage !== id) {
                    e.currentTarget.style.backgroundColor = '';
                    e.currentTarget.style.color = inactiveColor;
                  }
                }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-3 py-2 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <main className="flex-1 overflow-auto">
          {activePage === 'dashboard' && <DashboardPage userName={userName} onNavigate={setActivePage} />}
          {activePage === 'jobTracking' && <JobTracking />}
          {activePage === 'resumeAnalysis' && <ComingSoon title="Resume Analysis" />}
          {activePage === 'mockInterview' && <ComingSoon title="Mock Interview" />}
        </main>
      </div>
    </div>
  );
}
