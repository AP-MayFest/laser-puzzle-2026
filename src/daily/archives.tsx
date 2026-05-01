import { useAtomValue, useSetAtom } from 'jotai';
import { useTransition, type FC } from 'react';
import type { Problem } from './api.ts';
import { archivedProblems } from './state/problems.ts';
import { useRecordValue } from './record.ts';
import { formatDateJa, formatTime } from './utils.ts';
import { CreditDisplay } from './info.tsx';
import { viewAtom } from './state/routing.ts';

export const Archives: FC = () => {
  const ps = useAtomValue(archivedProblems);

  if (ps.status === 'unknown error') throw new Error('couldn\'t get the archives');
  const problems = ps.status === 'ok'
    ? [...ps.problems].sort((left, right) => right.date.localeCompare(left.date))
    : [];

  if (problems.length === 0) return <main>過去問はまだありません。</main>;
  
  return <main className='archives'>
    <h1>過去問</h1>
    <ol>
      { problems.map(p => <li key={p.date}><ArchivedProblem problem={p} /></li>)}
    </ol>
  </main>;
};

const ArchivedProblem: FC<{ problem: Problem}> = ({ problem }) => {
  const { date, credit } = problem;
  const [isPending, startTransition] = useTransition();
  const setView = useSetAtom(viewAtom);
  const goto = () => {
    startTransition(() => setView({ route: 'specific', date }));
  };
  
  return <button onClick={goto} disabled={isPending}>
    <h2>{formatDateJa(date)}</h2>
    <CreditDisplay credit={credit} />
    <RecordDisplay date={date} />
  </button>;
};

const RecordDisplay: FC<{ date: string; }> = ({ date }) => {
  const record = useRecordValue(date);
  if (record == null) return null;
  return <p className='record'>
    <span>🕓{formatTime(record.time)}</span>
  </p>;
};
