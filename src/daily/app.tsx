import { Suspense } from 'react';
import { viewAtom } from './state/routing';
import { ArchivePlayer, DailyPlayer } from './player';
import { Archives } from './archives';
import { useAtomValue } from 'jotai';

export function DailyApp() {
    return <Suspense fallback={<main>読み込み中...</main>}>
        <DailyRoute />
    </Suspense>;
}

function DailyRoute() {
    const view = useAtomValue(viewAtom);

    if (view.route === 'today') return <DailyPlayer />;
    if (view.route === 'archives') return <Archives />;
    return <ArchivePlayer date={view.date} />;
}
