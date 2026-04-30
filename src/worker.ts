import type {DailyApiErrorResponse, DailyArchivesResponse, DailyProblem} from './daily/api.ts';
import {getArchivedDailyProblems, getTodayDailyProblem} from './worker/daily-problems.ts';

interface FetcherBinding {
    fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

interface Env {
    ASSETS: FetcherBinding;
}

const BASE_PATH = '/2026/laser-puzzle';
const JSON_CONTENT_TYPE = 'application/json; charset=utf-8';
const CACHE_CONTROL = 'no-store';

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const pathname = normalizeApiPathname(new URL(request.url).pathname);
        if (pathname == null) {
            return env.ASSETS.fetch(request);
        }

        if (request.method !== 'GET') {
            return jsonError(
                {
                    code: 'method_not_allowed',
                    message: 'Only GET is supported for this endpoint.',
                },
                405,
            );
        }

        if (pathname === '/api/daily/today') {
            return handleToday();
        }

        if (pathname === '/api/daily/archives') {
            return handleArchives();
        }

        return jsonError(
            {
                code: 'not_found',
                message: 'The requested API endpoint does not exist.',
            },
            404,
        );
    },
};

function handleToday(): Response {
    const problem = getTodayDailyProblem();
    if (problem == null) {
        return jsonError(
            {
                code: 'daily_not_found',
                message: 'No daily puzzle is published for today.',
            },
            404,
        );
    }

    return json(problem);
}

function handleArchives(): Response {
    const response: DailyArchivesResponse = {
        items: getArchivedDailyProblems(),
    };
    return json(response);
}

function normalizeApiPathname(pathname: string): string | null {
    let normalized = pathname;
    if (normalized.startsWith(BASE_PATH + '/')) {
        normalized = normalized.slice(BASE_PATH.length);
    }

    if (normalized.length > 1 && normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1);
    }

    if (!normalized.startsWith('/api/')) {
        return null;
    }

    return normalized;
}

function json(body: DailyProblem | DailyArchivesResponse | DailyApiErrorResponse, init?: ResponseInit): Response {
    const headers = new Headers(init?.headers);
    headers.set('content-type', JSON_CONTENT_TYPE);
    headers.set('cache-control', CACHE_CONTROL);

    return new Response(JSON.stringify(body), {
        ...init,
        headers,
    });
}

function jsonError(error: DailyApiErrorResponse['error'], status: number): Response {
    return json({ error }, { status });
}
