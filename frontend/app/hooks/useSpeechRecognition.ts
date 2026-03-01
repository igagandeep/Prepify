import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ─── Minimal Web Speech API types ─────────────────────────────────────────────
// Defined locally because the project's TS config does not include the full
// Speech Recognition DOM lib. These match the actual browser API shape.

interface SpeechAlternative {
  readonly transcript: string;
}

interface SpeechResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechAlternative;
}

interface SpeechResultList {
  readonly length: number;
  [index: number]: SpeechResult;
}

interface SpeechResultEvent {
  readonly resultIndex: number;
  readonly results: SpeechResultList;
}

interface SpeechErrorEvent {
  readonly error: string;
}

interface Recognizer {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface RecognizerConstructor {
  new (): Recognizer;
}

// Extend Window so we can read both the standard and webkit-prefixed APIs
// without falling back to `any`.
declare global {
  interface Window {
    SpeechRecognition?: RecognizerConstructor;
    webkitSpeechRecognition?: RecognizerConstructor;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export type SpeechRecognitionState = 'idle' | 'listening' | 'processing' | 'error';

interface UseSpeechRecognitionOptions {
  onTranscript: (text: string) => void;
  language?: string;
}

interface UseSpeechRecognitionReturn {
  state: SpeechRecognitionState;
  transcript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  clearError: () => void;
  isSupported: boolean;
}

/**
 * Hook for Web Speech API based speech-to-text.
 * Uses window.SpeechRecognition (standard) or window.webkitSpeechRecognition (WebKit).
 * Frontend-only — no external API calls required.
 */
export function useSpeechRecognition({
  onTranscript,
  language = 'en-US',
}: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn {
  const [state, setState] = useState<SpeechRecognitionState>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognizerRef = useRef<Recognizer | null>(null);
  const isStartingRef = useRef(false);

  // Store onTranscript in a ref so it is always current without being a
  // useEffect dependency. An inline callback in the parent would otherwise
  // cause the recognizer to be aborted and recreated on every render.
  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  });

  // isSupported is a one-time browser feature check — stable for the page lifetime.
  const isSupported = useMemo(
    () =>
      typeof window !== 'undefined' &&
      !!(window.SpeechRecognition ?? window.webkitSpeechRecognition),
    [],
  );

  // Create the recognizer once on mount (or when language changes).
  //
  // IMPORTANT: Do NOT add `state` or `onTranscript` to this dependency array.
  // Including `state` would re-run the cleanup on every setState call, which
  // calls recognizer.abort() and kills the active recognition session immediately.
  useEffect(() => {
    const API = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!API) return;

    const recognizer = new API();
    recognizer.continuous = false;    // Auto-stops after a pause in speech
    recognizer.interimResults = true; // Stream partial results while speaking
    recognizer.lang = language;

    // Build up the final transcript from successive result events.
    recognizer.onresult = (event: SpeechResultEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const segment = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + segment);
          onTranscriptRef.current(segment);
        }
      }
    };

    recognizer.onerror = (event: SpeechErrorEvent) => {
      // 'aborted' fires when stop() is called manually — it is not a real error.
      // onend fires immediately after and handles the transition back to idle.
      if (event.error === 'aborted') return;
      setState('error');
      setError(getErrorMessage(event.error));
    };

    // When recognition ends (naturally or via stop()), return to idle.
    // Use a functional update to avoid capturing a stale `state` value in closure.
    recognizer.onend = () => {
      setState((prev) => (prev === 'listening' ? 'idle' : prev));
    };

    recognizerRef.current = recognizer;

    return () => {
      recognizer.abort();
      recognizerRef.current = null;
    };
  }, [language]);

  const startListening = useCallback(() => {
    if (!recognizerRef.current) {
      setError('Speech recognition is not supported in this browser.');
      setState('error');
      return;
    }

    // Prevent rapid double-starts (e.g. fast double-click on the mic button).
    if (isStartingRef.current) return;
    isStartingRef.current = true;

    setTranscript('');
    setError(null);
    setState('listening');

    try {
      recognizerRef.current.start();
    } catch {
      // The recognizer may already be running — treat as still listening.
    } finally {
      isStartingRef.current = false;
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognizerRef.current) return;
    setState('idle');
    recognizerRef.current.stop();
  }, []);

  // Use a functional update so clearError does not need `state` as a dependency.
  const clearError = useCallback(() => {
    setError(null);
    setState((prev) => (prev === 'error' ? 'idle' : prev));
  }, []);

  return { state, transcript, error, startListening, stopListening, clearError, isSupported };
}

/**
 * Map Web Speech API error codes to user-friendly messages.
 * Exported for use in unit tests.
 */
export function getErrorMessage(errorCode: string): string {
  const messages: Record<string, string> = {
    'no-speech': 'No speech detected. Please try again.',
    'audio-capture': 'Microphone not available. Check your permissions and try again.',
    'network': 'Network error. Please check your connection.',
    'permission-denied': 'Microphone permission denied. Allow access in your browser settings.',
    'not-allowed': 'Microphone access not allowed. Check your browser permissions.',
    'service-not-allowed': 'Speech recognition service is not allowed.',
    'bad-grammar': 'Speech recognition error. Please try again.',
    'aborted': 'Speech recognition was cancelled.',
  };
  return messages[errorCode] ?? `Speech recognition error: ${errorCode}`;
}
