const TOKYO_TIME_ZONE = 'Asia/Tokyo';

export const getTokyoDateString = (now: Date = new Date()): string => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TOKYO_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(now);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;
  if (year == null || month == null || day == null) {
    throw new Error('failed to format Tokyo date');
  }

  return `${year}-${month}-${day}`;
};

export const isDateString = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  if (year == null || month == null || day == null) return false;

  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
};

export const countDownText = (date: string): string => {
  const eventDate = Date.UTC(2026, 4, 16);
  const [year, month, day] = date.split('-').map(Number);
  if (year == null || month == null || day == null) return '';

  const currentDate = Date.UTC(year, month - 1, day);
  const days = Math.ceil((eventDate - currentDate) / 86_400_000);
  if (days > 0) return `まであと${days}日📆`;
  if (days === 0) return '1日目';
  if (days === -1) return '2日目';
  return `から${-1 - days}日後`;
};

export const formatDateJa = (date: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (match == null) throw new Error('wow');
  const [, y, m, d] = match;
  return `${y}年${+m}月${+d}日`;
};


export const formatTime = (timeMs: number | null | undefined): string => {
  if (timeMs == null) return '--:--';

  const totalSeconds = Math.max(0, Math.floor(timeMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    : `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const dailyHref = (date?: string): string => {
  const href = `${import.meta.env.BASE_URL}daily.html`;
  if (date == null) return href;
  return `${href}?date=${encodeURIComponent(date)}`;
};

export const dailyUrl = (date: string): string => {
  const url = new URL(dailyHref(date), window.location.origin);
  return url.toString();
};

export const tutorialHref = (): string => `${import.meta.env.BASE_URL}tutorial.html`;

export const createShareText = (date: string, time: number): string => {
  return `
➡️Daily Laser Puzzle⬅️
${formatDateJa(date)}
🕑${formatTime(time)} でクリア✨
五月祭${countDownText(date)}

#工学博覧会2026 #五月祭 #好きが芽吹くとき
${dailyUrl(date)}
`.trim();
};

export async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard != null) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the textarea fallback below.
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.readOnly = true;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.append(textarea);
  textarea.select();

  try {
    return document.execCommand('copy');
  } finally {
    textarea.remove();
  }
}
