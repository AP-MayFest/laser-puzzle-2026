import type {Problem} from '../daily/api.ts';

const TOKYO_TIME_ZONE = 'Asia/Tokyo';

// Server-only daily puzzle definitions. Do not import this module from client entry points.
const DAILY_PROBLEMS: readonly Problem[] = [
    {
        date: '2026-05-01',
        problemCode: '5x5-4bRS5aGS2fSS4aRE1gNE2eNW1fSE1bGW8bRE1fPE1eNW7fPS7bGN-c0e1',
        difficulty: 'medium',
        credit: { author: 'ichi' },
    },
    {
        date: '2026-05-02',
        problemCode: '4x4-1bGS5bRE4aGW15aRE4bGW5bRN-c6g2',
        difficulty: 'easy',
        credit: { author: 'hatena' },
    },
    {
        date: '2026-05-03',
        problemCode: '5x5-2bGS7fPS2aGS4cSE4aRW3fPS7cNE4fSW1bRW2h1cNE1fSW1cNW-d2',
        difficulty: 'easy',
        credit: { author: 'miso' },
    },
    {
        date: '2026-05-04',
        problemCode: '7x7-46dNW1dNE4aGW3bGE4aRN4bRW13bRN2bGN-c0d0e1fP1fS1fD1g2',
        difficulty: 'medium',
        credit: { author: '2025年度工学博覧会光班' },
    },
    {
        date: '2026-05-05',
        problemCode: '3x3-5bRE3aGW8aRE3bGW-c6d1',
        difficulty: 'easy',
        credit: { author: 'hatena' },
    },
    {
        date: '2026-05-06',
        problemCode: '5x5-3bGS1bGS7fPS8aRW10aGE3fPE5fPS7bRN1bRN-d0g2',
        difficulty: 'medium',
        credit: { author: 'daifuku' },
    },
];

export function getTodayDailyProblem(now: Date = new Date()): Problem | null {
    const today = getTokyoDateString(now);
    return DAILY_PROBLEMS.find((problem) => problem.date === today) ?? null;
}

export function getArchivedDailyProblems(now: Date = new Date()): Problem[] {
    const today = getTokyoDateString(now);
    return DAILY_PROBLEMS
        .filter((problem) => problem.date < today)
        .toSorted((left, right) => right.date.localeCompare(left.date));
}

export function getTokyoDateString(now: Date = new Date()): string {
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
}
