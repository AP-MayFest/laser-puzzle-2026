import { Suspense } from 'react';
import { useViewValue } from './state/view';
import { ArchivePlayer, DailyPlayer } from './player';
import { Archives } from './archives';

export function DailyApp() {
    return <Suspense fallback={<main>読み込み中...</main>}>
        <DailyRoute />
    </Suspense>;
}

function DailyRoute() {
    const view = useViewValue();

    if (view === 'today') return <DailyPlayer />;
    if (view === 'archives') return <Archives />;
    return <ArchivePlayer date={view.date} />;
}
