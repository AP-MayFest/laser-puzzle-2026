import { useCallback, useEffect, useRef, type FC } from 'react';
import { atom, useAtom } from 'jotai';
import { copyText, countDownText, createShareText, formatDateJa, formatTime } from './utils.ts';


interface ResultData {
  date: string;
  time: number;
}

export const resultData = atom<ResultData>();

export const ResultDialog: FC<{ today?: boolean }> = ({ today = false }) => {
  const [res, setRes] = useAtom(resultData);
  
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
  }, [res, today]);

  if (res == null) return (
    <dialog
      ref={dialogRef}
      closedby='any'
      onCancel={() => {
        setRes(undefined);
      }}
    />
  );

  const {date, time} = res;

  return <dialog
    ref={dialogRef}
    closedby='any'
    onCancel={() => {
      setRes(undefined);
    }}>
    <h2>{formatDateJa(date)}</h2>
    
    <p className='record'>
      <span>🕓{formatTime(time)}でクリア！</span>
    </p>
    { today && <p className='countdown'>五月祭{countDownText(date)}</p>}

    <button onClick={handleCopy}>共有</button>
  </dialog>;
};
