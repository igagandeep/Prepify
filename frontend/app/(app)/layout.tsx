'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  MessageCircle,
  PanelLeft,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs', label: 'Job Tracking', icon: Briefcase },
  { href: '/resume', label: 'Resume Analysis', icon: FileText },
  { href: '/interview', label: 'Mock Interview', icon: MessageCircle },
];

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('prepify_username');
      if (!saved) router.replace('/welcome');
    } catch {
      router.replace('/welcome');
    }
  }, [router]);

  if (!mounted) return null;

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
          <div className="pl-5 pr-4 py-4 flex items-center border-b border-gray-100 dark:border-gray-700">
            <img
              src={isDark ? '/logo-dark.png' : '/logo-light.png'}
              alt="Prepify"
              className="h-6 w-auto max-w-full"
            />
          </div>

          <nav className="flex-1 p-3 space-y-0.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={isActive ? activeNavStyle : { color: inactiveColor }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = hoverBg;
                      e.currentTarget.style.color = hoverColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.color = inactiveColor;
                    }
                  }}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-3 py-2 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
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

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
