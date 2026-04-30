export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DailyCredit {
    author?: string;
    sourceName?: string;
    sourceUrl?: string;
}

export interface DailyProblem {
    date: string; // YYYY-MM-DD, Asia/Tokyo
    problemCode: string;
    difficulty: Difficulty;
    credit: DailyCredit;
}

export interface DailyArchivesResponse {
    items: DailyProblem[];
}

export type DailyApiErrorCode =
    | 'daily_not_found'
    | 'method_not_allowed'
    | 'not_found';

export interface DailyApiErrorResponse {
    error: {
        code: DailyApiErrorCode;
        message: string;
    };
}
