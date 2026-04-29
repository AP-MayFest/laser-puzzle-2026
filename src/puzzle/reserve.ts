import {type Color, type ComponentDescriptor, createComponent, type Polarity} from "./component-descriptor.ts";
import type {Orientation, ReserveLayout} from "./layout.ts";
import {Vec2} from "../utils/vec.ts";

export type ReservableComponentDescriptor =
    | { kind: 'mirror'; }
    | { kind: 'double-sided-mirror'; }
    | { kind: 'dichroic-mirror'; }
    | { kind: 'polarizer'; polarity: Polarity; }
    | { kind: 'polarizing-beam-splitter'; }
    | { kind: 'target'; colors: [Color] | [Color, Color]; }
    | { kind: 'laser'; color: Color; }
    | { kind: 'obstacle'; }
    ;

export type ReserveCount = Partial<{
    laserR: number;
    laserG: number;
    targetR: number;
    targetG: number;
    targetRG: number;
    obstacle: number;
    mirror: number;
    doubleSidedMirror: number;
    dichroicMirror: number;
    polarizerS: number;
    polarizerP: number;
    polarizerD: number;
    pbs: number;
}>;

const descToKey = (descriptor: ReservableComponentDescriptor): keyof ReserveCount => {
    if (descriptor.kind === 'laser') {
        if (descriptor.color === 'R') return 'laserR';
        if (descriptor.color === 'G') return 'laserG';
    }
    if (descriptor.kind === 'target') {
        if (descriptor.colors.length === 1 && descriptor.colors[0] === 'R') return 'targetR';
        if (descriptor.colors.length === 1 && descriptor.colors[0] === 'G') return 'targetG';
        if (descriptor.colors.length === 2) return 'targetRG';
    }
    if (descriptor.kind === 'obstacle') return 'obstacle';
    if (descriptor.kind === 'mirror') return 'mirror';
    if (descriptor.kind === 'double-sided-mirror') return 'doubleSidedMirror';
    if (descriptor.kind === 'dichroic-mirror') return 'dichroicMirror';
    if (descriptor.kind === 'polarizer') {
        if (descriptor.polarity === 'S') return 'polarizerS';
        if (descriptor.polarity === 'P') return 'polarizerP';
        if (descriptor.polarity === 'D') return 'polarizerD';
    }
    if (descriptor.kind === 'polarizing-beam-splitter') return 'pbs'

    throw new Error('unknown reservable component descriptor');
}

export class Reserve {
    count: ReserveCount;

    constructor(count: Readonly<ReserveCount>) {
        this.count = structuredClone(count);
    }

    take(descriptor: ReservableComponentDescriptor): ComponentDescriptor | null {
        const key = descToKey(descriptor);
        if (this.count[key] == null || this.count[key] < 1) return null;
        this.count[key] -= 1;
        return regularize(descriptor);
    }

    turnIn(descriptor: ReservableComponentDescriptor): boolean {
        const key = descToKey(descriptor);
        if (this.count[key] == null) return false;
        this.count[key] += 1;
        return true;
    }
    
    calcLayout(): Record<Orientation, ReserveLayout> {
        const columns: { descriptor: ReservableComponentDescriptor; count: number; }[][] = [];
        const count = this.count;

        {
            const column: { descriptor: ReservableComponentDescriptor; count: number; }[] = [];
            if (count.mirror != null) column.push({ descriptor: { kind: 'mirror' }, count: count.mirror });
            if (count.doubleSidedMirror != null) column.push({ descriptor: { kind: 'double-sided-mirror' }, count: count.doubleSidedMirror });
            if (column.length > 0) columns.push(column);
        }
        if (count.dichroicMirror != null) {
            columns.push([{ descriptor: { kind: 'dichroic-mirror' }, count: count.dichroicMirror }]);
        }
        {
            const column: { descriptor: ReservableComponentDescriptor; count: number; }[] = [];
            if (count.polarizerP != null) column.push({ descriptor: { kind: 'polarizer', polarity: 'P' }, count: count.polarizerP });
            if (count.polarizerS != null) column.push({ descriptor: { kind: 'polarizer', polarity: 'S' }, count: count.polarizerS });
            if (count.polarizerD != null) column.push({ descriptor: { kind: 'polarizer', polarity: 'D' }, count: count.polarizerD });
            if (column.length !== 0) columns.push(column);
        }
        if (count.pbs != null) {
            columns.push([{ descriptor: { kind: 'polarizing-beam-splitter' }, count: count.pbs }]);
        }
        {
            const column: { descriptor: ReservableComponentDescriptor; count: number; }[] = [];
            if (count.targetR != null) column.push({ descriptor: { kind: 'target', colors: ['R'] }, count: count.targetR });
            if (count.targetG != null) column.push({ descriptor: { kind: 'target', colors: ['G'] }, count: count.targetG });
            if (count.targetRG != null) column.push({ descriptor: { kind: 'target', colors: ['R', 'G'] }, count: count.targetRG });
            if (column.length !== 0) columns.push(column);
        }
        {
            const column: { descriptor: ReservableComponentDescriptor; count: number; }[] = [];
            if (count.laserR != null) column.push({ descriptor: { kind: 'laser', color: 'R' }, count: count.laserR });
            if (count.laserG != null) column.push({ descriptor: { kind: 'laser', color: 'G' }, count: count.laserG });
            if (count.obstacle != null) column.push({ descriptor: { kind: 'obstacle' }, count: count.obstacle });
            if (column.length !== 0) columns.push(column);
        }

        const M = columns.length;
        const N = columns.reduce((n, c) => Math.max(n, c.length), 0);

        if (M === 0) {
            const empty = { width: 0, height: 0, coordinateOffset: new Vec2(0, 0), slots: [] };
            return { portrait: empty, landscape: empty };
        } else {
            return {
                portrait: {
                    width: 2 * M + 1,
                    height: 1.5 * N + 0.5,
                    coordinateOffset: new Vec2(1.5, 1),
                    slots: columns.flatMap((col, i) =>
                        col.map(({ count, descriptor }, j) => ({ position: new Vec2(i * 2, j * 1.5), component: createComponent(regularize(descriptor)), count }))
                    ),
                },
                landscape: {
                    width: 2 * N,
                    height: 1.5 * M + 0.5,
                    coordinateOffset: new Vec2(1, 1),
                    slots: columns.flatMap((col, i) =>
                        col.map(({ count, descriptor }, j) => ({ position: new Vec2(j * 2, i * 1.5), component: createComponent(regularize(descriptor)), count }))
                    ),
                },
            }
        }
    }
}

const regularize = (descriptor: ReservableComponentDescriptor): ComponentDescriptor => {
    switch (descriptor.kind) {
        case "mirror": return { ...descriptor, direction: 'NW' };
        case "double-sided-mirror": return { ...descriptor, direction: 'NW' };
        case "dichroic-mirror": return { ...descriptor, direction: 'NW' };
        case "polarizer": return { ...descriptor, direction: 'E' };
        case "polarizing-beam-splitter": return { ...descriptor, direction: 'NW' };
        case "target": return { ...descriptor, direction: 'W' };
        case "laser": return { ...descriptor, direction: 'E' };
        case "obstacle": return { kind: 'obstacle' };
    }
}