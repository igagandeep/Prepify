'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import Modal from '../ui/Modal';

interface ApiKeyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
}

export default function ApiKeyModal({
  open,
  onClose,
  onSave,
}: ApiKeyModalProps) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!key.startsWith('sk-') || key.length < 20) {
      setError('Key must start with "sk-" and be at least 20 characters.');
      return;
    }
    localStorage.setItem('prepify_openai_key', key);
    onSave(key);
    setKey('');
    setError('');
  };

  const handleClose = () => {
    setKey('');
    setError('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="OpenAI API Key Required">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 -mt-2">
        Prepify uses your own API key to analyze your resume. It&apos;s stored
        locally and never sent to our servers.
      </p>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          API Key
        </label>
        <input
          type="password"
          value={key}
          onChange={(e) => {
            setKey(e.target.value);
            setError('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="sk-..."
          autoFocus
          className="w-full px-3 py-2.5 border rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-colors border-gray-200 dark:border-gray-600 focus:border-[#3948CF]"
        />
        {error && (
          <p className="text-xs text-red-500 mt-1.5">{error}</p>
        )}
      </div>
      <button
        onClick={handleSave}
        disabled={!key}
        className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
        style={{ backgroundColor: '#3948CF' }}
      >
        Save & Continue
      </button>
      <div className="mt-3 text-center">
        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          Where do I get an API key?
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </Modal>
  );
}
