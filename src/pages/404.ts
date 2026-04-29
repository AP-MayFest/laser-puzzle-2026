import './404.css';

import {Runtime} from "../puzzle/runtime.ts";
import {Vec2} from "../utils/vec.ts";
import type {Problem} from "../puzzle/problem.ts";

const problem: Problem = {
    board: {
        width: 16,
        height: 6,
        placements: [
            { position: new Vec2( 3,1), movable: true, descriptor: { kind: "double-sided-mirror", direction: "NW" } },
            { position: new Vec2( 4,1), movable: true, descriptor: { kind: "double-sided-mirror", direction: "NE" } },
            { position: new Vec2( 7,1), movable: true, descriptor: { kind: "double-sided-mirror", direction: "NW" } },
            { position: new Vec2(10,1), movable: true, descriptor: { kind: "double-sided-mirror", direction: "NE" } },
            { position: new Vec2(14,1), movable: true, descriptor: { kind: "double-sided-mirror", direction: "NW" } },
            { position: new Vec2(15,1), movable: true, descriptor: { kind: "double-sided-mirror", direction: "NE" } },
            { position: new Vec2( 2,2), movable: true, descriptor: { kind: "double-sided-mirror", direction: "NW" } },
            { position: new Vec2( 3,2), movable: true, descriptor: { kind: "double-sided-mirror", direction: "NW" } },
            { position: new Vec2(13,2), movable: true, descriptor: { kind: "double-sided-mirror", direction: "NW" } },
            { position: new Vec2(14,2), movable: true, descriptor: { kind: "double-sided-mirror", direction: "NW" } },
            { position: new Vec2(15,2), movable: true, descriptor: { kind: "polarizer", direction: "N", polarity: "S" } },
            { position: new Vec2( 1,3), movable: true, descriptor: { kind: "double-sided-mirror", direction: "NW" } },
            { position: new Vec2( 2,3), movable: true, descriptor: { kind: "double-sided-mirror", direction: "NW" } },
            { position: new Vec2( 7,5), movable: true, descriptor: { kind: "polarizer", direction: "N", polarity: "D" } },
            { position: new Vec2(12,3), movable: true, descriptor: { kind: "double-sided-mirror", direction: "NW" } },
            { position: new Vec2(13,3), movable: true, descriptor: { kind: "double-sided-mirror", direction: "NW" } },
            { position: new Vec2(15,3), movable: true, descriptor: { kind: "polarizer", direction: "N", polarity: "D" } },
            { position: new Vec2( 1,4), movable: true, descriptor: { kind: "double-sided-mirror", direction: "NE" } },
            { position: new Vec2( 4,4), movable: true, descriptor: { kind: "polarizing-beam-splitter", direction: "NE" } },
            { position: new Vec2( 5,4), movable: true, descriptor: { kind: "polarizer", direction: "E", polarity: "D" } },
            { position: new Vec2( 7,4), movable: true, descriptor: { kind: "double-sided-mirror", direction: "NW" } },
            { position: new Vec2(12,4), movable: true, descriptor: { kind: "polarizing-beam-splitter", direction: "SW" } },
            { position: new Vec2(14,4), movable: true, descriptor: { kind: "polarizer", direction: "E", polarity: "D" } },
            { position: new Vec2(15,4), movable: true, descriptor: { kind: "polarizing-beam-splitter", direction: "SW" } },
            { position: new Vec2( 7,3), movable: true, descriptor: { kind: "polarizer", direction: "N", polarity: "S" } },
            { position: new Vec2(15,5), movable: true, descriptor: { kind: "laser", direction: "N", color: "R" } },
            { position: new Vec2( 7,6), movable: true, descriptor: { kind: "double-sided-mirror", direction: "NE" } },
            { position: new Vec2(10,6), movable: true, descriptor: { kind: "double-sided-mirror", direction: "NW" }},
            { position: new Vec2( 4,7), movable: true, descriptor: { kind: "target", direction: "N", colors: ["R"] } },
            { position: new Vec2(17,4), movable: true, descriptor: { kind: "target", direction: "W", colors: ["R"] } },
        ],
    },
    reserve: {},
}

new Runtime('status', problem, () => {}).start();
