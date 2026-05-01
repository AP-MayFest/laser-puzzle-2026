import { atom } from 'jotai';
import { atomWithLocation } from 'jotai-location';
import { getTokyoDateString } from '../utils.ts';


const locationAtom = atomWithLocation();


type View =
  | { route: 'today'; }
  | { route: 'archives'; }
  | { route: 'specific'; date: string; }
  ;


export const viewAtom = atom<View, [View], undefined>(
  get => {
    const location = get(locationAtom);
    const params = new URLSearchParams(location.searchParams);
    
    const date = params.get('date');
    if (date != null) return date === getTokyoDateString() ? { route: 'today' } : { route: 'specific', date };
    
    const archives = params.get('archives');
    if (archives != null) return { route: 'archives' };

    return { route: 'today' };
  },
  (_, set, newView) => {
    if (newView.route === 'today') set(locationAtom, prev => ({ ...prev, searchParams: undefined }));
    else if (newView.route === 'archives') set(locationAtom, prev => ({ ...prev, searchParams: new URLSearchParams('archives') }));
    else set(locationAtom, prev => ({ ...prev, searchParams: new URLSearchParams('date=' + newView.date) }));
  },
);
