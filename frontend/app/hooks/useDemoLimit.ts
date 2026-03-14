'use client';

import { useState, useEffect, useCallback } from 'react';
import { jobsApi } from '@/lib/api/jobs';

const STORAGE_KEY = 'prepify_demo_limit';
const DAILY_LIMIT = 5;

interface DemoLimitState {
  date: string;
  count: number;
  addedIds: string[];
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function readState(): DemoLimitState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DemoLimitState;
  } catch {}
  return { date: todayStr(), count: 0, addedIds: [] };
}

function writeState(state: DemoLimitState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let pendingStaleIds: string[] = [];

export function useDemoLimit() {
  const [state, setState] = useState<DemoLimitState>(() => {
    const current = readState();
    if (current.date !== todayStr()) {
      pendingStaleIds = current.addedIds;
      const reset: DemoLimitState = { date: todayStr(), count: 0, addedIds: [] };
      writeState(reset);
      return reset;
    }
    return current;
  });

  // Side-effect only: delete stale jobs from the previous day
  useEffect(() => {
    const ids = pendingStaleIds;
    pendingStaleIds = [];
    ids.forEach((id) => jobsApi.delete(id).catch(() => {}));
  }, []);

  const recordAdd = useCallback((id: string) => {
    setState((prev) => {
      const next: DemoLimitState = {
        ...prev,
        count: prev.count + 1,
        addedIds: [...prev.addedIds, id],
      };
      writeState(next);
      return next;
    });
  }, []);

  return {
    limitReached: state.count >= DAILY_LIMIT,
    count: state.count,
    recordAdd,
  };
}
