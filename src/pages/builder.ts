import './builder.css';

import {type ReserveCount} from "../puzzle/reserve.ts";
import {Runtime} from "../puzzle/runtime.ts";
import {describeComponent} from "../puzzle/component-descriptor.ts";
import {encodeProblem} from "../puzzle/problem.ts";

class SizeObserver {
    width: number;
    height: number;
    callback: (width: number, height: number) => void;

    constructor(callback: (width: number, height: number) => void) {
        const heightInput = document.getElementById('board-height');
        const widthInput = document.getElementById('board-width');
        if (heightInput == null || !(heightInput instanceof HTMLInputElement) || widthInput == null || !(widthInput instanceof HTMLInputElement)) throw new Error('size input required');

        this.width = widthInput.valueAsNumber;
        this.height = heightInput.valueAsNumber;
        this.callback = callback;

        heightInput.addEventListener('change', () => {
            this.height = heightInput.valueAsNumber;
            this.dispatch();
        });
        widthInput.addEventListener('change', () => {
            this.width = widthInput.valueAsNumber;
            this.dispatch();
        });

        this.dispatch();
    }

    dispatch() {
        this.callback(this.width, this.height);
    }
}

const EDITOR_RESERVE: ReserveCount = {
    mirror: Infinity,
    doubleSidedMirror: Infinity,
    dichroicMirror: Infinity,
    polarizerP: Infinity,
    polarizerS: Infinity,
    polarizerD: Infinity,
    pbs: Infinity,
    targetR: Infinity,
    targetG: Infinity,
    targetRG: Infinity,
    laserR: Infinity,
    laserG: Infinity,
    obstacle: Infinity,
};

let runtime: Runtime | undefined;

function resizeRuntime(width: number, height: number) {
    if (runtime == null) {
        runtime = new Runtime('canvas-edit', { width, height, placements: [] }, EDITOR_RESERVE, () => {});
    } else {
        runtime.dispose();
        const layout = runtime.board.calcLayout();
        const placements = layout.placements.map(p => {
            return {
                position: p.position,
                descriptor: describeComponent(p.component),
                movable: true,
            };
        });
        runtime = new Runtime('canvas-edit', { width, height, placements }, EDITOR_RESERVE, () => {});
    }
    runtime.start();
}

new SizeObserver(resizeRuntime);

function generateProblemCode(): string {
    if (runtime == null) throw new Error('cannot find runtime');
    const inputs = [
        "reserve-count-mirror",
        "reserve-count-double-sided-mirror",
        "reserve-count-dichroic-mirror",
        "reserve-count-polarizer-P",
        "reserve-count-polarizer-S",
        "reserve-count-polarizer-D",
        "reserve-count-PBS",
    ].map(id => document.getElementById(id));
    if (!inputs.every((e) => e != null && e instanceof HTMLInputElement)) {
        throw new Error('bad html');
    }
    const counts = inputs.map(e => e.valueAsNumber).map(c => c < 0 ? Infinity : c || undefined);

    return encodeProblem({
        board: {
            width: runtime.board.width,
            height: runtime.board.height,
            placements: runtime.board.calcLayout().placements.map(p => ({
                position: p.position,
                descriptor: describeComponent(p.component),
            })),
        },
        reserve: {
            mirror: counts[0],
            doubleSidedMirror: counts[1],
            dichroicMirror: counts[2],
            polarizerP: counts[3],
            polarizerS: counts[4],
            polarizerD: counts[5],
            pbs: counts[6],
        }
    });
}

function generateUrl(): string {
    return window.location.protocol + '//' + window.location.host + import.meta.env.BASE_URL + "play.html?p=" + generateProblemCode();
}

document.getElementById('copy-link')?.addEventListener('click', () => {
    window.navigator.clipboard.writeText(generateUrl());
});

document.getElementById('open-preview')?.addEventListener('click', () => {
    window.open(generateUrl());
});
