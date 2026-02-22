'use client';

import { useState, useEffect } from 'react';
import {
  Briefcase,
  FileText,
  MessageCircle,
  Heart,
  Github,
  Eye,
  Download,
  Globe,
} from 'lucide-react';
import AppLayout from './components/AppLayout';

// Marketing Homepage (web/hosted version)
function MarketingHomepage({ onSeeDemo }: { onSeeDemo: () => void }) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Prepify</h1>
          <h2 className="text-2xl mb-6 text-slate-200">
            Prepare smarter. Track better. Interview with confidence.
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Your open-source desktop companion for managing job applications,
            analyzing resumes, and practicing interviews — all in one calm,
            focused space.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onSeeDemo}
              className="text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 cursor-pointer"
              style={{ backgroundColor: '#3948CF' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#2d3ba8')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = '#3948CF')
              }
            >
              <Eye className="w-5 h-5" />
              See Demo
            </button>
            <div className="relative group">
              <button
                disabled
                className="bg-slate-400 text-slate-200 px-8 py-3 rounded-lg font-semibold flex items-center gap-2 cursor-not-allowed opacity-60"
              >
                <Download className="w-5 h-5" />
                Download App
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Coming Soon
              </div>
            </div>
            <div className="relative group">
              <button
                disabled
                className="border-2 border-blue-300 text-blue-300 px-8 py-3 rounded-lg font-semibold flex items-center gap-2 cursor-not-allowed opacity-60"
              >
                <Globe className="w-5 h-5" />
                Chrome Extension
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                In Development
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">
            Everything you need to land the job
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Job Tracking
              </h3>
              <p className="text-gray-600">
                Track your applications, statuses, and follow-ups in one
                organized view.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Resume Analysis
              </h3>
              <p className="text-gray-600">
                Compare your resume against job descriptions and find gaps to
                improve.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                AI Mock Interviews
              </h3>
              <p className="text-gray-600">
                Practice interviews with AI and build confidence before the real
                thing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Purpose */}
      <section className="py-20 px-8 bg-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-6 h-6 text-teal-600" />
          </div>
          <h2 className="text-3xl font-bold mb-6 text-white">
            Built with purpose
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Job searching is stressful. Prepify is an open-source tool built to
            reduce that stress — helping you stay organized, improve your
            resume, and practice interviews, all without cost or complexity.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 border-t bg-white">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <p className="text-gray-600">Prepify - Open Source</p>
          <a
            href="https://github.com/igagandeep/Prepify"
            className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="w-5 h-5" />
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}

// Welcome Screen (first-time setup)
function WelcomeScreen({ onComplete }: { onComplete: (name: string) => void }) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onComplete(name.trim());
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-sm border p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#3948CF' }}
          >
            <span className="text-white text-2xl font-bold">P</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome to Prepify
          </h1>
          <p className="text-gray-600 text-sm">Enter your name to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none placeholder-gray-500 text-gray-900"
              onFocus={(e) =>
                (e.currentTarget.style.boxShadow = '0 0 0 2px #3948CF40')
              }
              onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
              autoFocus
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              This name will be used locally
            </p>
          </div>
          <button
            type="submit"
            className="w-full text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            style={{ backgroundColor: '#3948CF' }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = '#2d3ba8')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = '#3948CF')
            }
          >
            Get Started →
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Home() {
  const [showDemo, setShowDemo] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('prepify_username');
      setUserName(saved);
    } catch {
      setUserName(null);
    } finally {
      setMounted(true);
    }
  }, []);

  const saveUserName = (name: string) => {
    try {
      localStorage.setItem('prepify_username', name);
    } catch (err) {
      console.warn('Could not persist username:', err);
    }
    setUserName(name);
  };

  const isElectron =
    typeof window !== 'undefined' &&
    (navigator.userAgent.toLowerCase().includes('electron') ||
      !!(window as Window & { electronAPI?: unknown }).electronAPI);

  if (!mounted) return null;

  if (isElectron || showDemo) {
    if (userName) return <AppLayout userName={userName} />;
    return <WelcomeScreen onComplete={saveUserName} />;
  }

  return <MarketingHomepage onSeeDemo={() => setShowDemo(true)} />;
}
