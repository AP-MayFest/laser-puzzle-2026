import { useAtomValue } from 'jotai';
import type { FC } from 'react';
import type { Problem } from './api.ts';
import { archivedProblems } from './state/problems.ts';
import { progress as progressState } from './record.ts';
import { dailyHref, difficultyLabels, formatTime } from './utils.ts';

export const Archives: FC = () => {
  const ps = useAtomValue(archivedProblems);

  if (ps.status === 'unknown error') throw new Error('couldn\'t get the archives');
  const problems = ps.status === 'ok'
    ? [...ps.problems].sort((left, right) => right.date.localeCompare(left.date))
    : [];

  if (problems.length === 0) return <main>過去問はまだありません。</main>;
  
  return <main>
    <h1>過去問</h1>
    <ol>
      { problems.map(p => <li key={p.date}><ArchivedProblem problem={p} /></li>)}
    </ol>
  </main>;
};

const ArchivedProblem: FC<{ problem: Problem}> = ({ problem }) => {
  const { date, credit, difficulty, problemCode } = problem;
  const progress = useAtomValue(progressState(date));
  return <div>
    <a href={dailyHref(date)}>{date}</a>
    {difficultyLabels[difficulty]}
    {problemCode}
    {credit.author}
    {progress.status === 'solved' ? formatTime(progress.time) : null}
  </div>;
};
