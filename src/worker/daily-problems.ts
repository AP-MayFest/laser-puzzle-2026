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
        difficulty: 'very easy',
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
        difficulty: 'very easy',
        credit: { author: 'hatena' },
    },
    {
        date: '2026-05-06',
        problemCode: '5x5-3bGS1bGS7fPS8aRW10aGE3fPE5fPS7bRN1bRN-d0g2',
        difficulty: 'medium',
        credit: { author: 'daifuku' },
    },
    {
        date: '2026-05-07',
        problemCode: '5x5-1bRS2bGS2bGS13h18aRN4aGN5bRN-c0e2g1',
        difficulty: 'medium',
        credit: { author: 'daifuku' },
    },
    {
        date: '2026-05-08',
        problemCode: '5x5-23aRE1gNW11bRE1gNW2cNW5bRN-c4g1',
        difficulty: 'easy',
        credit: { author: 'miso' },
    },
    {
        date: '2026-05-09',
        problemCode: '5x3-1bGS1bGS1bGS1bGS8aGW10cNE1cNW1cNE1cNW-d1fD2g3',
        difficulty: 'hard',
        credit: { author: 'ナン' },
    },
    {
        date: '2026-05-10',
        problemCode: '5x5-8h4h2bRE6bGW2aRE4aGW2bRE6bGW10bGN2bRN-c0d0e2fP1fS1fD1g2',
        difficulty: 'hard',
        credit: { author: 'riku' },
    },
    {
        date: '2026-05-11',
        problemCode: '5x5-3bGS12aGE6bGE6bGW18bGN-c3fD3g3',
        difficulty: 'hard',
        credit: { author: 'miso' },
    },
    {
        date: '2026-05-13',
        problemCode: '7x7-9bGE18bRE4fDE25aRN5aGN2bGE12bRN3bRN-c0d0e1g2',
        difficulty: 'very hard',
        credit: { author: '2024年度工学博覧会光班', source: { name: '問題4（上級）', url: 'https://booth.pm/ja/items/5726657' } },
    },
    {
        date: '2026-05-14',
        problemCode: '7x7-2bRS4bGS3bGE4fPE4bRW5fSE6cNE1cNW4cSW1cNW6fDE6cSE1cSW4cSE1cSW11bGE3aRN2aGN3bGW3bRN4bRN-c0d0e3fD1g4',
        difficulty: 'hard',
        credit: { author: 'hatena' },
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
