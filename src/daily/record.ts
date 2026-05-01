import { atomFamily } from 'jotai-family';
import { atomWithStorage, RESET, useAtomCallback } from 'jotai/utils';
import type {Operation} from '../puzzle/runtime.ts';
import { atom, getDefaultStore, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { resultData } from './result.tsx';

const STORAGE_KEY_PREFIX = '/2026/laser-puzzle/daily';


export type Progress =
  | { status: 'solving'; accumulate: number; resumedAt?: number }
  | { status: 'solved'; time: number; };

export interface DailyPlayMetadata {
  progress: Progress;
  history: Operation[];
}

const metadataFamily = atomFamily((date: string) => atomWithStorage<DailyPlayMetadata>(
  `${STORAGE_KEY_PREFIX}/${date}/meta`,
  { progress: { status: 'solving', accumulate: 0 }, history: [] },
  undefined,
  { getOnInit: true },
));

export const useSetHistory = (date: string): (history: Operation[]) => void => {
  const setter = useSetAtom(metadataFamily(date));
  return useCallback((history: Operation[]) => setter(v => ({ ...v, history: Array.from(history) })), [setter]);
};

export const useGetHistorySnapshot = (date: string): () => Operation[] => {
  return useAtomCallback(useCallback(get => get(metadataFamily(date)).history, [date]));
};

export const useResume = (date: string): (at: number) => void => {
  const setter = useSetAtom(metadataFamily(date));
  return useCallback((at: number) => setter(v => {
    const { progress } = v;
    if (progress.status === 'solving') return { ...v, progress: { ...progress, resumedAt: at }};
    else return v;
  }), [setter]);
};

export const useVolatileMetadata = (date: string) => {
  const setter = useSetAtom(metadataFamily(date));

  useEffect(() => {
    const listener = () => {
      setter(v => {
        if (v.progress.status === 'solved') return RESET;
        else return v;
      });
    };
    window.addEventListener('pagehide', listener);
    return () => {
      window.removeEventListener('pagehide', listener);
    };
  }, [setter]);
};

export const getHistory = (date: string): Operation[] => {
  return getDefaultStore().get(metadataFamily(date)).history;
};

export const progress = atomFamily((date: string) => atom(get => get(metadataFamily(date)).progress));


export interface Record {
  date: number;
  time: number;
}

const recordFamily = atomFamily((date: string) => atomWithStorage<Record | undefined>(
  `${STORAGE_KEY_PREFIX}/${date}/record`,
  undefined,
  undefined,
  { getOnInit: true },
));

export const useRecordValue = (date: string): Record | undefined => {
  return useAtomValue(recordFamily(date));
};

const useSetRecordIfEmpty = (date: string): (record: Record) => void => {
  const setRecord = useSetAtom(recordFamily(date));
  return useCallback((record: Record) => setRecord(r => r ?? record), [setRecord]);
};

export const useProgress = (date: string) => {
  const setter = useSetAtom(metadataFamily(date));
  const setResult = useSetAtom(resultData);
  const resume = useResume(date);
  const setRecord = useSetRecordIfEmpty(date);

  const start = useCallback(() => {
    resume(Date.now());
  }, [resume]);
  const clear = useCallback((at: number) => {
    setter(v => {
      const { progress, history } = v;
      if (progress.status === 'solving') {
        const time = progress.accumulate + (at - (progress.resumedAt ?? at));
        setRecord({ date: at, time });
        setResult({ date, time });
        return { progress: { status: 'solved', time }, history };
      } else {
        return v;
      }
    });
  }, [date, setter, setRecord, setResult]);

  const quit =  useCallback((at: number) => {
    setter(v => {
      const { progress, history } = v;
      if (progress.status === 'solving') return { progress: { status: 'solving', accumulate: progress.accumulate + (at - (progress.resumedAt ?? at)) }, history };
      else return v;
    });
  }, [setter]);

  useEffect(() => {
    window.addEventListener('pageshow', start);
    return () => {
      window.removeEventListener('pageshow', start);
    };
  }, [start]);

  useEffect(() => {
    const onHide = () => {
      quit(Date.now());
    };
    window.addEventListener('pagehide', onHide);
    return () => {
      window.removeEventListener('pagehide', onHide);
      onHide();
    };
  }, [quit]);

  return { start, clear, quit };
};
