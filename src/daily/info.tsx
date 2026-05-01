import { useCallback, useEffect, useRef, type FC } from 'react';
import type { Credit, Problem } from './api.ts';
import { useRecordValue } from './record.ts';
import { copyText, countDownText, createShareText, formatDateJa, formatTime, tutorialHref } from './utils.ts';

export const ProblemInfoDialog: FC<{
  problem: Problem;
  open: boolean;
  today: boolean;
  onPlay: () => void;
  onArchives: () => void;
}> = ({ problem, open, onPlay, onArchives, today }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  
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
    ref={dialogRef}
    onCancel={(event) => {
      event.preventDefault();
      onPlay();
    }}
  >
    <h1>Daily Laser Puzzle</h1>

    <p>{today ? '五月祭' + countDownText(problem.date) : formatDateJa(problem.date)}</p>
    
    <CreditDisplay credit={problem.credit} />

    <RecordDisplay date={problem.date} today={today} />

    <nav>
      <a href={tutorialHref()}>ルール</a>
      <button type="button" onClick={onPlay}>プレイ</button>
      <button type="button" onClick={onArchives}>過去問</button>
    </nav>
  </dialog>;
};

const CreditDisplay: FC<{ credit: Credit }> = ({ credit }) => {
  return <p>
    <span>作者：{credit.author}</span><br/>
    {renderSource(credit)}
  </p>;
};

function renderSource(credit: Credit) {
  if (credit.sourceName != null && credit.sourceUrl != null) {
    return <>
      <span> </span>
      <span>出典：<a href={credit.sourceUrl} rel="noreferrer" target="_blank">{credit.sourceName}</a></span>
    </>;
  }

  if (credit.sourceName != null) {
    return <>
      <span> </span>
      <span>出典：{credit.sourceName}</span>
    </>;
  }

  if (credit.sourceUrl != null) {
    return <>
      <span> </span>
      <a href={credit.sourceUrl} rel="noreferrer" target="_blank">出典リンク</a>
    </>;
  }

  return null;
}

const RecordDisplay: FC<{ date: string; today: boolean }> = ({ date, today }) => {
  const record = useRecordValue(date);
  const handleCopy = useCallback(async () => {
    if (record == null) return;
    await copyText(createShareText(date, record.time));
  }, [date, record]);
  
  if (record == null) return null;

  return <p>
    <span>🕓{formatTime(record.time)}</span>
    <button onClick={handleCopy} disabled={!today}>共有</button>
  </p>;
};

