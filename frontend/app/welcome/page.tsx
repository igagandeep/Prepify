'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();
  const [name, setName] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      localStorage.setItem('prepify_username', name.trim());
    } catch {
      /* ignore */
    }
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-sm border p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img src="/logo-light.png" alt="Prepify" className="h-9 w-auto" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to Prepify</h1>
          <p className="text-gray-600 text-sm">Enter your name to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none placeholder-gray-500 text-gray-900 focus:border-[#3948CF] transition-colors"
              autoFocus
              required
            />
            <p className="text-xs text-gray-500 mt-2">This name will be used locally</p>
          </div>
          <button
            type="submit"
            className="w-full text-white py-3 px-4 rounded-lg font-medium transition-opacity hover:opacity-90 flex items-center justify-center"
            style={{ backgroundColor: '#3948CF' }}
          >
            Get Started →
          </button>
        </form>
      </div>
    </div>
  );
}
