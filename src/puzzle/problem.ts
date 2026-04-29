import type {BoardInit, Placement} from "./board.ts";
import type {ReserveCount} from "./reserve.ts";
import {
    assertingCardinalDirection,
    assertingColor,
    assertingDiagonalDirection, assertingPolarity,
    type ComponentDescriptor
} from "./component-descriptor.ts";
import {Vec2} from "../utils/vec.ts";

export interface Problem {
    board: BoardInit;
    reserve: ReserveCount;
}

export type DecodeResult =
    | { kind: 'ok'; problem: Problem; }
    | { kind: 'error'; }
;

export function encodeProblem(problem: Problem): string {
    const placements = problem.board.placements.map(({ position, descriptor }) => {
       return {
           p: position.y * (problem.board.width + 2) + position.x,
           d: encodeDescriptor(descriptor),
       };
    });
    placements.sort((a, b) => a.p - b.p);
    let prevP = 0;
    const placementsCode = placements.map(({ p, d }) => (-prevP + (prevP=p)).toString() + d);

    const reserveCode = encodeReserveCount(problem.reserve);

    return `${problem.board.width}x${problem.board.height}-${placementsCode.join('')}-${reserveCode}`;
}

export function decodeProblem(code: string): DecodeResult {
    const match = code.match(/^(\d+)x(\d+)-(\w*)-(\w*)$/);
    if (match == null) return { kind: 'error' };
    const [_, _width, _height, placementsCode, reserveCode] = match;
    const width = +_width, height = +_height;

    const placements: Placement[] = [];
    let p = 0, rest = placementsCode;
    while (rest.length > 0) {
        const match = rest.match(/^(\d+)([a-zA-Z]+)(.*)$/);
        if (match == null) return { kind: 'error' };
        const count = +match[1], code = match[2];
        p += count;
        rest = match[3];
        const position = new Vec2(p % (width + 2), Math.floor(p / (width + 2)));
        placements.push({ position, descriptor: decodeDescriptor(code) });
    }
    const board: BoardInit = { width, height, placements };

    const reserve: ReserveCount = decodeReserveCount(reserveCode);

    return { kind: 'ok', problem: { board, reserve } };
}

function encodeDescriptor(descriptor: ComponentDescriptor): string {
    switch (descriptor.kind) {
        case 'laser': return 'a' + descriptor.color + descriptor.direction;
        case 'target': return 'b' + descriptor.colors.join('') + descriptor.direction;
        case 'mirror': return 'c' + descriptor.direction;
        case 'double-sided-mirror': return 'd' + descriptor.direction;
        case 'dichroic-mirror': return 'e' + descriptor.direction;
        case 'polarizer': return 'f' + descriptor.polarity + descriptor.direction;
        case 'polarizing-beam-splitter': return 'g' + descriptor.direction;
        case 'obstacle': return 'h';
    }
}

function decodeDescriptor(code: string): ComponentDescriptor {
    function decodeTargetCode(): ComponentDescriptor & { kind: 'target' } {
        const c1 = assertingColor(code.charAt(1));
        try {
            const c2 = assertingColor(code.charAt(2));
            return { kind: 'target', direction: assertingCardinalDirection(code.charAt(3)), colors: c1 == c2 ? [c1] : [c1, c2] };
        } catch (_) {
            return { kind: 'target', direction: assertingCardinalDirection(code.charAt(2)), colors: [c1] };
        }
    }

    switch (code.charAt(0)) {
        case 'a': return { kind: 'laser', direction: assertingCardinalDirection(code.charAt(2)), color: assertingColor(code.charAt(1)) };
        case 'b': return decodeTargetCode();
        case 'c': return { kind: 'mirror', direction: assertingDiagonalDirection(code.slice(1, 3)) };
        case 'd': return { kind: 'double-sided-mirror', direction: assertingDiagonalDirection(code.slice(1, 3)) };
        case 'e': return { kind: 'dichroic-mirror', direction: assertingDiagonalDirection(code.slice(1, 3)) };
        case 'g': return { kind: 'polarizing-beam-splitter', direction: assertingDiagonalDirection(code.slice(1, 3)) };
        case 'f': return { kind: 'polarizer', direction: assertingCardinalDirection(code.charAt(2)), polarity: assertingPolarity(code.charAt(1)) };
        case 'h': return { kind: 'obstacle' };
    }
    throw new Error(`unknown code of ComponentDescriptor: ${code}`);
}

function encodeReserveCount(reserveCount: ReserveCount): string {
    const codes: string[] = [];
    const add = (code: string, count: number) => {
      if (count > 0) codes.push(code + (count === Infinity ? 0 : count));
    };

    if (reserveCount.laserR != null) add('aR', reserveCount.laserR);
    if (reserveCount.laserG != null) add('aG', reserveCount.laserG);
    if (reserveCount.targetR != null) add('bR', reserveCount.targetR);
    if (reserveCount.targetG != null) add('bG', reserveCount.targetG);
    if (reserveCount.mirror != null) add('c', reserveCount.mirror);
    if (reserveCount.doubleSidedMirror != null) add('d', reserveCount.doubleSidedMirror);
    if (reserveCount.dichroicMirror != null) add('e', reserveCount.dichroicMirror);
    if (reserveCount.polarizerP != null) add('fP', reserveCount.polarizerP);
    if (reserveCount.polarizerS != null) add('fS', reserveCount.polarizerS);
    if (reserveCount.polarizerD != null) add('fD', reserveCount.polarizerD);
    if (reserveCount.pbs != null) add('g', reserveCount.pbs);
    if (reserveCount.obstacle != null) add('h', reserveCount.obstacle);

    return codes.join('')
}

function decodeReserveCount(code: string): ReserveCount {
    const reverseCount: ReserveCount = {};

    let rest = code;
    while (rest.length > 0) {
        const match = rest.match(/^([a-z][A-Z]?)(\d+)(.*)$/);
        if (match == null) throw new Error('unknown code of ReserveCount');
        const code = match[1], count = +match[2] || Infinity;
        rest = match[3];
        if (code === 'aR') reverseCount.laserR = count;
        else if (code === 'aG') reverseCount.laserG = count;
        else if (code === 'bR') reverseCount.targetR = count;
        else if (code === 'bG') reverseCount.targetG = count;
        else if (code === 'c' ) reverseCount.mirror = count;
        else if (code === 'd' ) reverseCount.doubleSidedMirror = count;
        else if (code === 'e' ) reverseCount.dichroicMirror = count;
        else if (code === 'fP') reverseCount.polarizerP = count;
        else if (code === 'fS') reverseCount.polarizerS = count;
        else if (code === 'fD') reverseCount.polarizerD = count;
        else if (code === 'g' ) reverseCount.pbs = count;
        else if (code === 'h' ) reverseCount.obstacle = count;
        else throw new Error('unknown code of ReserveCount');
    }

    return reverseCount;
}
