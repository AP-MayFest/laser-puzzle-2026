import {NormalizedVec2} from "../utils/vec.ts";
import {
    type Component,
    DichroicMirror,
    DoubleSidedMirror,
    Laser,
    Mirror, Obstacle, Polarizer, PolarizingBeamSplitter,
    Target,
    type WaveLength
} from "./components.ts";

const cardinalDirections = ['N', 'W', 'S', 'E'] as const;
export type CardinalDirection = (typeof cardinalDirections)[number];
const decodeCardinalDirection = (direction: CardinalDirection): NormalizedVec2 => {
    switch (direction) {
        case "N": return new NormalizedVec2( 0, -1);
        case "W": return new NormalizedVec2(-1,  0);
        case "S": return new NormalizedVec2( 0, +1);
        case "E": return new NormalizedVec2(+1,  0);
    }
}
const encodeCardinalDirection = (direction: NormalizedVec2): CardinalDirection => {
    const similarity = [
        new NormalizedVec2( 0, -1),
        new NormalizedVec2(-1,  0),
        new NormalizedVec2( 0, +1),
        new NormalizedVec2(+1,  0),
    ].map(right => direction.inner(right));
    const [_, argmax] = similarity.reduce<[number, number]>(([v, i], w, j) => w > v ? [w, j] : [v, i], [-Infinity, -1]);
    return cardinalDirections[argmax];
}
export const assertingCardinalDirection = (direction: unknown): CardinalDirection => {
    // @ts-ignore
    if (cardinalDirections.includes(direction)) return direction;
    throw new Error('not a cardinal direction');
}

const diagonalDirections = ['NE', 'NW', 'SE', 'SW'] as const;
export type DiagonalDirection = (typeof diagonalDirections)[number];
const decodeDiagonalDirection = (direction: DiagonalDirection): NormalizedVec2 => {
    switch (direction) {
        case "NE": return new NormalizedVec2(+1, -1);
        case "NW": return new NormalizedVec2(-1, -1);
        case "SE": return new NormalizedVec2(+1, +1);
        case "SW": return new NormalizedVec2(-1, +1);
    }
}
const encodeDiagonalDirection = (direction: NormalizedVec2): DiagonalDirection => {
    const similarity = [
        new NormalizedVec2(+1, -1),
        new NormalizedVec2(-1, -1),
        new NormalizedVec2(+1, +1),
        new NormalizedVec2(-1, +1),
    ].map(right => direction.inner(right));
    const [_, argmax] = similarity.reduce<[number, number]>(([v, i], w, j) => w > v ? [w, j] : [v, i], [-Infinity, -1]);
    return diagonalDirections[argmax];
}
export const assertingDiagonalDirection = (direction: unknown): DiagonalDirection => {
    // @ts-ignore
    if (diagonalDirections.includes(direction)) return direction;
    throw new Error('not a diagonal direction');
}

const polarities = ['P', 'S', 'D'] as const;
export type Polarity = (typeof polarities)[number];
const decodePolarity = (polarity: Polarity): NormalizedVec2 => {
    switch (polarity) {
        case 'P': return new NormalizedVec2(1, 0);
        case "S": return new NormalizedVec2(0, 1);
        case "D": return new NormalizedVec2(1, 1);
    }
}
const encodePolarity = (polarity: NormalizedVec2): Polarity => {
    const { x, y } = polarity;
    if (x === 0) return 'S';
    if (y === 0) return 'P';
    return 'D';
};
export const assertingPolarity = (polarity: unknown): Polarity => {
    // @ts-ignore
    if (polarities.includes(polarity)) return polarity;
    throw new Error('not a polarity');
}

export type Color = 'R' | 'G';
const colorToWaveLength = (color: Color): WaveLength => {
    return ({
        'R': '650',
        'G': '532',
    } satisfies Record<Color, WaveLength>)[color];
}
const waveLengthToColor = (waveLength: WaveLength): Color => {
    return ({
        '650': 'R',
        '532': 'G',
    } satisfies Record<WaveLength, Color>)[waveLength];
}
export const assertingColor = (color: unknown): Color => {
    if (color === 'R' || color === 'G') return color;
    throw new Error('not a color');
}

export type ComponentKind = ComponentDescriptor['kind'];
export type ComponentDescriptor =
    | { kind: 'laser'; direction: CardinalDirection; color: Color; }
    | { kind: 'target'; direction: CardinalDirection; color: Color; }
    | { kind: 'obstacle'; }
    | { kind: 'mirror'; direction: DiagonalDirection; }
    | { kind: 'double-sided-mirror'; direction: DiagonalDirection; }
    | { kind: 'dichroic-mirror'; direction: DiagonalDirection; }
    | { kind: 'polarizer'; direction: CardinalDirection; polarity: Polarity; }
    | { kind: 'polarizing-beam-splitter'; direction: DiagonalDirection; }
    ;

export const createComponent = (descriptor: ComponentDescriptor): Component => {
    switch (descriptor.kind) {
        case 'laser': return new Laser(decodeCardinalDirection(descriptor.direction), colorToWaveLength(descriptor.color));
        case 'target': return new Target(decodeCardinalDirection(descriptor.direction), colorToWaveLength(descriptor.color));
        case 'obstacle': return new Obstacle();
        case "mirror": return new Mirror(decodeDiagonalDirection(descriptor.direction));
        case "double-sided-mirror": return new DoubleSidedMirror(decodeDiagonalDirection(descriptor.direction));
        case "dichroic-mirror": return new DichroicMirror(decodeDiagonalDirection(descriptor.direction));
        case "polarizer": return new Polarizer(decodeCardinalDirection(descriptor.direction), decodePolarity(descriptor.polarity));
        case "polarizing-beam-splitter": return new PolarizingBeamSplitter(decodeDiagonalDirection(descriptor.direction));
    }
}

export const describeComponent = (component: Component): ComponentDescriptor => {
    if (component instanceof Laser) return { kind: 'laser', direction: encodeCardinalDirection(component.direction), color: waveLengthToColor(component.waveLength) };
    if (component instanceof Target) return { kind: 'target', direction: encodeCardinalDirection(component.direction), color: waveLengthToColor(component.waveLength) };
    if (component instanceof Obstacle) return { kind: 'obstacle' };
    if (component instanceof Mirror) return { kind: 'mirror', direction: encodeDiagonalDirection(component.dsm.direction) };
    if (component instanceof DoubleSidedMirror) return { kind: 'double-sided-mirror', direction: encodeDiagonalDirection(component.direction) };
    if (component instanceof DichroicMirror) return { kind: 'dichroic-mirror', direction: encodeDiagonalDirection(component.dsm.direction) };
    if (component instanceof Polarizer) return { kind: 'polarizer', direction: encodeCardinalDirection(component.direction), polarity: encodePolarity(component.polarity) };
    if (component instanceof PolarizingBeamSplitter) return { kind: 'polarizing-beam-splitter', direction: encodeDiagonalDirection(component.dsm.direction) };
    throw new Error('unknown component')
}
