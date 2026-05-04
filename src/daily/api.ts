export type Difficulty = 'very easy' | 'easy' | 'medium' | 'hard' | 'very hard';

export interface Credit {
    author: string;
    source?: Source;
}
export interface Source {
    name: string;
     url?: string; 
}

export interface Problem {
    date: string; // YYYY-MM-DD, Asia/Tokyo
    problemCode: string;
    difficulty: Difficulty;
    credit: Credit;
}

export interface DailyArchivesResponse {
    items: Problem[];
}


interface Ok<T> {
    kind: 'ok';
    data: T;
}

interface Err<E> {
    kind: 'err';
    error: E;
}

type Result<T, E> = Ok<T> | Err<E>;


const baseUrl = new URL(import.meta.env.BASE_URL, window.location.origin);

async function getJson<T>(pathname: string): Promise<Result<T, { status: number; }>> {
    let response: Response;
    try {
        response = await fetch(new URL(pathname, baseUrl));
    } catch {
        return {
            kind: 'err',
            error: { status: 0 },
        };
    }

    if (response.ok) {
        return {
            kind: 'ok',
            data: await response.json() as T,
        };
    }

    return {
        kind: 'err',
        error: { status: response.status },
    };
}

export async function getDailyProblem(): Promise<Result<Problem, 'unknown' | 'server' | 'not found'>> {
    const res = await getJson<Problem>('api/daily/today');
    if (res.kind === 'err') {
        const { status } = res.error;
        return {
            kind: 'err',
            error: status === 0 ? 'unknown' : status === 404 ? 'not found' : 'server',
        };
    }

    return { kind: 'ok', data: res.data };
}

export async function getArchivedProblems(): Promise<Result<Problem[], 'unknown' | 'server' | 'not found'>> {
    const res = await getJson<DailyArchivesResponse>('api/daily/archives');
    if (res.kind === 'err') {
        const { status } = res.error;
        return {
            kind: 'err',
            error: status === 0 ? 'unknown' : status === 404 ? 'not found' : 'server',
        };
    }

    return { kind:'ok', data: res.data.items };
}
