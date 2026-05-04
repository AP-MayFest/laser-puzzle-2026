import { useCallback, useEffect, useRef, type FC } from 'react';
import { atom, useAtom } from 'jotai';
import { copyText, countDownText, createShareText, formatDateJa, formatTime } from './utils.ts';
import { useSubmitNotification } from './state/notification.ts';


interface ResultData {
  date: string;
  time: number;
}

export const resultData = atom<ResultData>();

export const ResultDialog: FC<{ today?: boolean }> = ({ today = false }) => {
  const [res, setRes] = useAtom(resultData);
  const submitNotification = useSubmitNotification();
  
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = res != null;
  
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog == null) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();

    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  const handleCopy = useCallback(async () => {
    if (res == null || !today) return;
    await copyText(createShareText(res.date, res.time));
    submitNotification({ category: 'feedback', message: '共有テキストをコピーしました', closeMethod: 'auto' });
  }, [res, today]);

  const handleClose = () => setRes(undefined);


  if (res == null) return (
    <dialog
      className='result'
      ref={dialogRef}
      closedby='any'
      onCancel={handleClose}
    />
  );


  const {date, time} = res;

  return <dialog
    className='result'
    ref={dialogRef}
    closedby='any'
    onCancel={handleClose}>
    <h2>{formatDateJa(date)}</h2>
    
    <p className='record'>
      <span>🕑{formatTime(time)}でクリア！</span>
    </p>
    { today && <p className='countdown'>五月祭{countDownText(date)}</p>}

    { today && <button onClick={handleCopy}>共有</button> }
    <button onClick={handleClose}>閉じる</button>
  </dialog>;
};
