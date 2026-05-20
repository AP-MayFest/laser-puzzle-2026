import { atom } from 'jotai';
import { atomFamily } from 'jotai-family';
import { Compilation, type Problem } from '../../puzzle/problems';


export type ProblemState =
  | { status: 'ok'; problem: Problem; }
  | { status: 'not found'; }
  | { status: 'unknown error'; message: string; }

export const dailyProblem = atom<ProblemState>({ status: 'not found' });


export type ArchivedProblemsState =
  | { status: 'ok'; problems: Problem[]; }
  | { status: 'not found'; }
  | { status: 'unknown error'; message: string; };
export const archivedProblems = atom<ArchivedProblemsState>({ status: 'ok', problems: Compilation });


export const archivedProblem = atomFamily((date: string) => atom<ProblemState>(get => {
  const res = get(archivedProblems);
  if (res.status !== 'ok') return res;

  const { problems } = res;
  const problem = problems.find(p => p.date === date);
  if (problem == null) return { status: 'not found' };
  return { status: 'ok', problem };
}));
