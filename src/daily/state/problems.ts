import { atom } from 'jotai';
import { atomFamily } from 'jotai-family';
import { getArchivedProblems, getDailyProblem, type Problem } from '../api';


export type ProblemState =
  | { status: 'ok'; problem: Problem; }
  | { status: 'not found'; }
  | { status: 'unknown error'; message: string; }

export const dailyProblem = atom(async (): Promise<ProblemState> => {
  const res = await getDailyProblem();
  if (res.kind === 'err') {
    if (res.error === 'not found') return { status: 'not found' };
    else return { status: 'unknown error', message: 'whoa' };
  }
  
  return { status: 'ok', problem: res.data };
});


export type ArchivedProblemsState =
  | { status: 'ok'; problems: Problem[]; }
  | { status: 'not found'; }
  | { status: 'unknown error'; message: string; };
export const archivedProblems = atom(async (): Promise<ArchivedProblemsState> => {
  const res = await getArchivedProblems();
  if (res.kind === 'err') {
    if (res.error === 'not found') return { status: 'not found' };
    else return { status: 'unknown error', message: 'whoa' };
  }

  return { status: 'ok', problems: res.data };
});


export const archivedProblem = atomFamily((date: string) => atom<Promise<ProblemState>>(async get => {
  const res = await get(archivedProblems);
  if (res.status !== 'ok') return res;

  const { problems } = res;
  const problem = problems.find(p => p.date === date);
  if (problem == null) return { status: 'not found' };
  return { status: 'ok', problem };
}));
