import { useCallback, useEffect, useRef, useTransition, type FC } from 'react';
import type { Credit, Problem, Source } from './api.ts';
import { isSolvingFamily, useRecordValue } from './record.ts';
import { copyText, countDownText, createShareText, formatDateJa, formatTime, tutorialHref } from './utils.ts';
import { useAtomValue, useSetAtom } from 'jotai';
import { viewAtom } from './state/routing.ts';
import { useSubmitNotification } from './state/notification.ts';

export const ProblemInfoDialog: FC<{
  problem: Problem;
  open: boolean;
  today: boolean;
  onPlay: () => void;
}> = ({ problem, open, onPlay, today }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const setView = useSetAtom(viewAtom);
  const isSolving = useAtomValue(isSolvingFamily(problem.date));
  const [isPending, startTransition] = useTransition();
  
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog == null) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();

    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  return <dialog
    className={isSolving ? 'problem-info solving' : 'problem-info'}
    ref={dialogRef}
    onCancel={(event) => {
      event.preventDefault();
      onPlay();
    }}
  >
    <h1>Daily Laser Puzzle</h1>

    <p>{today ? '五月祭' + countDownText(problem.date) : formatDateJa(problem.date)}</p>
    
    <CreditDisplay credit={problem.credit} />
    
    { today || <p><a href={import.meta.env.BASE_URL + '/daily.html'} onClick={(ev) => {ev.preventDefault(); startTransition(() => {setView({ route: 'today' });});}}>今日の問題はこちら</a></p> }

    <RecordDisplay date={problem.date} today={today} />

    <nav>
      <a href={tutorialHref()}>ルール</a>
      <button type="button" onClick={onPlay} autoFocus>プレイ</button>
      <button type="button" onClick={() => startTransition(() => { setView({ route: 'archives' }); })} disabled={isPending}>過去問</button>
    </nav>
  </dialog>;
};

export const CreditDisplay: FC<{ credit: Credit }> = ({ credit }) => {
  return <p className='credit'>
    <span>作者：{credit.author}</span><br/>
    {credit.source && renderSource(credit.source)}
  </p>;
};

function renderSource(source: Source) {
  if (source.url != null) {
    return <>
      <span> </span>
      <span>出典：<a href={source.url} rel="noreferrer" target="_blank">{source.name}</a></span>
    </>;
  }

  return <>
    <span> </span>
    <span>出典：{source.name}</span>
  </>;
}

const RecordDisplay: FC<{ date: string; today: boolean }> = ({ date, today }) => {
  const record = useRecordValue(date);
  const submitNotification = useSubmitNotification();

  const handleCopy = useCallback(async () => {
    if (record == null) return;
    await copyText(createShareText(date, record.time));
    submitNotification({ category: 'feedback', message: '共有テキストをコピーしました', closeMethod: 'auto' });
  }, [date, record]);
  
  if (record == null) return null;

  return <p className='record'>
    <span>🕓{formatTime(record.time)}</span>
    <button onClick={handleCopy} disabled={!today}>共有</button>
  </p>;
};

