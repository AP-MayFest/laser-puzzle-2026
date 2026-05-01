import type {Problem} from '../daily/api.ts';

const TOKYO_TIME_ZONE = 'Asia/Tokyo';

// Server-only daily puzzle definitions. Do not import this module from client entry points.
const DAILY_PROBLEMS: readonly Problem[] = [
    {
        date: '2026-04-28',
        problemCode: '7x7-3bGS2bRS22bGE4fDE1gNE3bRW1bGE8bRW13aRN2aGN-c0d0e2fP1fS1fD1g1',
        difficulty: 'hard',
        credit: {
            author: '工学博覧会 光班',
            sourceName: '2025年度問題6（上級）',
            sourceUrl: null,
        },
    },
    {
        date: '2026-04-29',
        problemCode: '7x7-3bRS3bGS13dNW3fDE4bRW16dNE6fSS7aRN2aGN20bRN1bGN-e2g2',
        difficulty: 'medium',
        credit: {
            author: '工学博覧会 光班',
            sourceName: '2025年度問題3（中級）',
            sourceUrl: null,
        },
    },
    {
        date: '2026-04-30',
        problemCode: '7x7-4bRS14bRE18bRE7cSW18aRN-fD1g2',
        difficulty: 'easy',
        credit: {
            author: '工学博覧会 光班',
            sourceName: '2025年度問題2（初級）',
            sourceUrl: null,
        },
    },
    {
        date: '2026-05-01',
        problemCode: '7x7-4bGS9dNW4bRW3cNW7bRE12cNW8aGE3cSE9cSE8aRN-c0d0e2fP1fS1fD1g1',
        difficulty: 'medium',
        credit: {
            author: '工学博覧会 光班',
            sourceName: '2025年度問題4（中級）',
            sourceUrl: null,
        },
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
