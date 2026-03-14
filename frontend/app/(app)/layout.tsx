'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  MessageCircle,
  PanelLeft,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';

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

  useEffect(() => {
    try {
      const saved = localStorage.getItem('prepify_username');
      if (!saved) router.replace('/welcome');
    } catch {
      router.replace('/welcome');
    }
  }, [router]);

  const isDark = theme === 'dark';

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {sidebarOpen && (
        <aside className="w-56 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0 sticky top-0 h-screen">
          <div className="pl-5 pr-4 py-4 flex items-center border-b border-gray-100 dark:border-gray-700">
            <Link href="/">
              <Image
                src={isDark ? '/logo-dark.png' : '/logo-light.png'}
                alt="Prepify"
                width={120}
                height={24}
                className="h-6 w-auto max-w-full"
              />
            </Link>
          </div>

          <nav className="flex-1 p-3 space-y-0.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#EEF0FD] text-[#3948CF] dark:bg-indigo-500/15 dark:text-indigo-400'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="sticky top-0 z-10 px-3 py-2 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen((v: boolean) => !v)}
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

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
