import './tutorial.css';

import {Runtime} from "../puzzle/runtime.ts";
import {Vec2} from "../utils/vec.ts";

const scrollTo = (_: string) => () => {
    // setTimeout(() => {
    //     const element = document.getElementById(id);
    //     if (element != null) {
    //         element.scrollIntoView({ behavior: "smooth" });
    //     }
    // }, 100);
}

new Runtime(
    'canvas-core-concept',
    { width: 5, height: 5, placements: [
            { position: new Vec2(1, 3), descriptor: { kind: 'laser', color: 'R', direction: 'E' } },
            { position: new Vec2(3, 0), descriptor: { kind: 'target', color: 'R', direction: 'S' } },
    ] },
    { mirror: 1 },
    scrollTo('color-distinction'),
).start();


new Runtime(
    'canvas-color-distinction',
    { width: 5, height: 5, placements: [
            { position: new Vec2(1, 3), descriptor: { kind: 'laser', color: 'R', direction: 'E' } },
            { position: new Vec2(3, 1), descriptor: { kind: 'laser', color: 'G', direction: 'S' } },
            { position: new Vec2(3, 6), descriptor: { kind: 'target', color: 'R', direction: 'N' } },
            { position: new Vec2(6, 3), descriptor: { kind: 'target', color: 'G', direction: 'W' } },
        ] },
    { doubleSidedMirror: 1 },
    scrollTo('dichroic-mirror'),
).start();

new Runtime(
    'canvas-dichroic-mirror',
    { width: 7, height: 7, placements: [
        { position: new Vec2(1, 4), descriptor: { kind: 'laser', color: 'R', direction: 'E' } },
        { position: new Vec2(3, 7), descriptor: { kind: 'laser', color: 'G', direction: 'N' } },
        { position: new Vec2(8, 4), descriptor: { kind: 'target', color: 'R', direction: 'W' } },
        { position: new Vec2(5, 0), descriptor: { kind: 'target', color: 'G', direction: 'S' } },
        { position: new Vec2(5, 4), descriptor: { kind: 'dichroic-mirror', direction: 'NW' } },
    ]},
    { dichroicMirror: 1 },
    scrollTo('polarity'),
).start();

new Runtime(
    'canvas-polarity',
    { width: 7, height: 7, placements: [
            { position: new Vec2(2, 1), descriptor: { kind: 'laser', color: 'R', direction: 'E' } },
            { position: new Vec2(2, 2), descriptor: { kind: 'laser', color: 'R', direction: 'E' } },
            { position: new Vec2(2, 3), descriptor: { kind: 'laser', color: 'R', direction: 'E' } },
            { position: new Vec2(2, 4), descriptor: { kind: 'laser', color: 'R', direction: 'E' } },
            { position: new Vec2(4, 1), descriptor: { kind: 'polarizer', polarity: 'P', direction: 'E' } },
            { position: new Vec2(7, 1), descriptor: { kind: 'polarizer', polarity: 'P', direction: 'E' } },
            { position: new Vec2(4, 2), descriptor: { kind: 'polarizer', polarity: 'P', direction: 'E' } },
            { position: new Vec2(7, 2), descriptor: { kind: 'polarizer', polarity: 'S', direction: 'E' } },
            { position: new Vec2(4, 3), descriptor: { kind: 'polarizer', polarity: 'S', direction: 'E' } },
            { position: new Vec2(7, 3), descriptor: { kind: 'polarizer', polarity: 'P', direction: 'E' } },
            { position: new Vec2(4, 4), descriptor: { kind: 'polarizer', polarity: 'S', direction: 'E' } },
            { position: new Vec2(7, 4), descriptor: { kind: 'polarizer', polarity: 'S', direction: 'E' } },

            { position: new Vec2(2, 6), descriptor: { kind: 'laser', color: 'G', direction: 'E' } },
            { position: new Vec2(3, 6), descriptor: { kind: 'polarizer', polarity: 'S', direction: 'E' } },
            { position: new Vec2(7, 6), descriptor: { kind: 'polarizer', polarity: 'P', direction: 'E' } },
            { position: new Vec2(8, 6), descriptor: { kind: 'target', color: 'G', direction: 'W' } },
        ]},
    { polarizerD: 1 },
    scrollTo('pbs'),
).start();

new Runtime(
    'canvas-pbs',
    { width: 5, height: 5, placements: [
            { position: new Vec2(1, 3), descriptor: { kind: 'laser', color: 'R', direction: 'E' } },

            { position: new Vec2(3, 0), descriptor: { kind: 'target', color: 'R', direction: 'S' } },
            { position: new Vec2(3, 1), descriptor: { kind: 'polarizer', polarity: 'S', direction: 'S' } },
            { position: new Vec2(6, 3), descriptor: { kind: 'target', color: 'R', direction: 'W' } },
            { position: new Vec2(5, 3), descriptor: { kind: 'polarizer', polarity: 'P', direction: 'W' } },
        ]},
    { pbs: 1 },
    () => {
        const dialog = document.getElementById('complete-dialog');
        if (dialog == null || !(dialog instanceof HTMLDialogElement)) {
            console.error('#complete-dialog must be a dialog element.');
            return;
        }
        dialog.showModal();
    },
).start();

