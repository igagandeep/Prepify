'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  FileText,
  MessageCircle,
  Heart,
  Github,
  Eye,
} from 'lucide-react';

const isDemo = process.env.NEXT_PUBLIC_APP_MODE === 'demo';

function MarketingHomepage({ onSeeDemo }: { onSeeDemo: () => void }) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-linear-to-br from-slate-800 to-slate-900 text-white py-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Prepify</h1>
          <h2 className="text-2xl mb-6 text-slate-200">
            Prepare smarter. Track better. Interview with confidence.
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Your open-source companion for managing job applications,
            analyzing resumes, and practicing interviews — all in one calm,
            focused space.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onSeeDemo}
              className="text-white px-8 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 flex items-center gap-2 cursor-pointer"
              style={{ backgroundColor: '#3948CF' }}
            >
              <Eye className="w-5 h-5" />
              See Demo
            </button>
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
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Job Tracking</h3>
              <p className="text-gray-600">
                Track your applications, statuses, and follow-ups in one organized view.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Resume Analysis</h3>
              <p className="text-gray-600">
                Compare your resume against job descriptions and find gaps to improve.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">AI Mock Interviews</h3>
              <p className="text-gray-600">
                Practice interviews with AI and build confidence before the real thing.
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
          <h2 className="text-3xl font-bold mb-6 text-white">Built with purpose</h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Job searching is stressful. Prepify is an open-source tool built to reduce that
            stress — helping you stay organized, improve your resume, and practice interviews,
            all without cost or complexity.
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

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (isDemo) return;
    // Local machine: skip marketing, go straight to app
    try {
      const name = localStorage.getItem('prepify_username');
      router.replace(name ? '/dashboard' : '/welcome');
    } catch {
      router.replace('/welcome');
    }
  }, [router]);

  if (!isDemo) return null;

  return <MarketingHomepage onSeeDemo={() => router.push('/dashboard')} />;
}
