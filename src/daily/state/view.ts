import { atom, useAtomValue, useSetAtom } from 'jotai';
import { getTokyoDateString, isDateString } from '../utils.ts';


type View = 'today' | { date: string; } | 'archives';

const initialView = (): View => {
  const date = new URLSearchParams(window.location.search).get('date');
  if (date == null || !isDateString(date)) return 'today';
  return date === getTokyoDateString() ? 'today' : { date };
};

const view = atom<View>(initialView());

export const useSetView = (): (view: 'today' | 'archives') => void => useSetAtom(view);
export const useViewValue = (): View => useAtomValue(view);
