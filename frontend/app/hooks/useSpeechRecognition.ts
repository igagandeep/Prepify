import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

declare global {
  interface Window {
    SpeechRecognition?: RecognizerConstructor;
    webkitSpeechRecognition?: RecognizerConstructor;
  }
}

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

export function useSpeechRecognition({
  onTranscript,
  language = 'en-US',
}: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn {
  const [state, setState] = useState<SpeechRecognitionState>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognizerRef = useRef<Recognizer | null>(null);
  const isStartingRef = useRef(false);

  // Keep onTranscript current without adding it to the effect deps —
  // an inline callback would abort and recreate the recognizer on every render.
  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  });

  const isSupported = useMemo(
    () =>
      typeof window !== 'undefined' &&
      !!(window.SpeechRecognition ?? window.webkitSpeechRecognition),
    [],
  );

  // Do NOT add `state` or `onTranscript` to this dep array — doing so would
  // call recognizer.abort() on every setState, killing active recognition.
  useEffect(() => {
    const API = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!API) return;

    const recognizer = new API();
    recognizer.continuous = false;
    recognizer.interimResults = true;
    recognizer.lang = language;

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
      // 'aborted' fires when stop() is called manually — not a real error.
      if (event.error === 'aborted') return;
      setState('error');
      setError(getErrorMessage(event.error));
    };

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

    if (isStartingRef.current) return;
    isStartingRef.current = true;

    setTranscript('');
    setError(null);
    setState('listening');

    try {
      recognizerRef.current.start();
    } catch {
      // Recognizer may already be running — treat as still listening.
    } finally {
      isStartingRef.current = false;
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognizerRef.current) return;
    setState('idle');
    recognizerRef.current.stop();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setState((prev) => (prev === 'error' ? 'idle' : prev));
  }, []);

  return { state, transcript, error, startListening, stopListening, clearError, isSupported };
}

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
