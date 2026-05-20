import { useCallback, useEffect, useMemo, useState, useTransition, type FC } from 'react';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { archivedProblem } from './state/problems.ts';
import type { Problem } from '../puzzle/problems.ts';
import { decodeProblem } from '../puzzle/encoding.ts';
import { Runtime } from '../puzzle/runtime.ts';
import {
  isSolvingFamily,
  useGetHistorySnapshot,
  useProgress,
  useSetHistory,
  useVolatileMetadata,
} from './record.ts';
import { ProblemInfoDialog } from './info.tsx';
import { ResultDialog } from './result.tsx';
import { formatDateJa } from './utils.ts';
import { viewAtom } from './state/routing.ts';

export const DailyPlayer: FC = () => {
  const setView = useSetAtom(viewAtom);
  const [, startTransition] = useTransition();
  
  return <main>
    <p>2026年度のDaily Laser Puzzleは終了しました！</p>
    <p>ぜひ<a href={import.meta.env.BASE_URL + '/daily.html?archives'} onClick={(ev) => {ev.preventDefault(); startTransition(() => {setView({ route: 'archives' });});}}>過去問</a>をお楽しみください。</p>
    <p><a href={import.meta.env.BASE_URL}>トップページ</a>に戻る。</p>
  </main>;
};

export const ArchivePlayer: FC<{ date: string }> = ({ date }) => {
  const p = useAtomValue(archivedProblem(date));

  if (p.status === 'unknown error') {
    return <main><p>{formatDateJa(date)}の問題を読み込めませんでした。</p></main>;
  }
  if (p.status === 'not found') return <main><p>{formatDateJa(date)}の問題はありません。</p></main>;
  const problem = p.problem;

  return <DailyProblemFrame
    problem={problem}
  />;
};

const DailyProblemFrame: FC<{
  problem: Problem;
  today?: boolean;
}> = ({ problem, today = false }) => {
  const [overlay, setOverlay] = useState(true);
  const isSolving = useAtomValue(isSolvingFamily(problem.date));

  // eslint-disable-next-line react-hooks/rules-of-hooks
  if (!today) useVolatileMetadata(problem.date);

  return <main className='player'>
    { (overlay && isSolving) || <Puzzle problem={problem} /> }

    <button onClick={() => setOverlay(true)} className='open-info'>INFO</button>
    <ResetButton />
    
    <ProblemInfoDialog
      problem={problem}
      open={overlay}
      today={today}
      onPlay={() => setOverlay(false)}
    />

    <ResultDialog today={today} realBoard={problem.realBoard} />
  </main>;
};


const runtimeState = atom<Runtime | undefined>(undefined);

const ResetButton: FC = () => {
  const runtime = useAtomValue(runtimeState);
  const reset = useCallback(() => {
    runtime?.dispatch({ kind: 'reset' });
  }, [runtime]);

  return <button onClick={reset} className='reset'>RESET</button>;
};


const Puzzle: FC<{ problem: Problem, onSolve?: (at: number) => void }> = ({ problem, onSolve = () => {} }) => {
  const decoded = useMemo(() => decodeProblem(problem.problemCode), [problem.problemCode]);
  const canvasId = `canvas-${problem.problemCode}`;
  const setRuntime = useSetAtom(runtimeState);
  const setHistory = useSetHistory(problem.date);
  const getHistory = useGetHistorySnapshot(problem.date);
  const { start, clear } = useProgress(problem.date);

  useEffect(() => {
    if (decoded.kind === 'error') return;

    const runtime = new Runtime(canvasId, decoded.problem, (at) => {
      clear(at);
      onSolve(at);
    });

    const history = getHistory();
    for (const operation of history) {
      runtime.dispatch({...operation, hooked: false});
    }
    runtime.history = Array.from(history);
    runtime.onDispatch = () => {
      setHistory(runtime.history);
    };

    setRuntime(runtime);
    runtime.start();
    start();

    return () => {
      runtime.dispose();
      setRuntime(undefined);
    };
  }, [canvasId, decoded, clear, start, onSolve, setHistory, getHistory, setRuntime]);

  if (decoded.kind === 'error') return <div>問題データが壊れています。</div>;
  return <canvas id={canvasId} className='puzzle-canvas' />;
};
