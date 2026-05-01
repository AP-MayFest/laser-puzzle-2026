import type {DailyArchivesResponse, Problem} from './daily/api.ts';
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
            return new Response(null, { status: 405 });
        }

        if (pathname === '/api/daily/today') {
            return handleToday();
        }

        if (pathname === '/api/daily/archives') {
            return handleArchives();
        }

        return new Response(null, { status: 404 });
    },
};

function handleToday(): Response {
    const problem = getTodayDailyProblem();
    if (problem == null) {
        return new Response(null, { status: 404 });
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

function json(body: Problem | DailyArchivesResponse, init?: ResponseInit): Response {
    const headers = new Headers(init?.headers);
    headers.set('content-type', JSON_CONTENT_TYPE);
    headers.set('cache-control', CACHE_CONTROL);

    return new Response(JSON.stringify(body), {
        ...init,
        headers,
    });
}