// y
// ↑
//  → x
//
//

import { Vec2, NormalizedVec2 } from '../utils/vec.ts';
import {pathToSegment, type Segment} from './collision.ts';

export type WaveLength = '532' | '650';

export interface Ray {
  origin: Vec2; // local to the component
  direction: NormalizedVec2;
  waveLength: WaveLength;
  polarity: Vec2;
  created_at: number;
}

export interface Collision {
  ray: Ray;
  at: Vec2; // local to the component
}

export interface Occupancy {
  positions: readonly Vec2[];
}

export interface Component {
  redirects(collisions: Collision[]): Ray[];
  rotate(basis: NormalizedVec2): void;
  readonly hits: readonly Segment[];
  readonly occupancy: Occupancy;
}

export class Laser implements Component {
  direction: NormalizedVec2;
  waveLength: WaveLength;

  constructor(direction: NormalizedVec2, waveLength: WaveLength) {
    this.direction = direction;
    this.waveLength = waveLength;
  }

  redirects(_: readonly Collision[]): Ray[] {
    const slip = new Vec2(this.direction.y, this.direction.x).scale(this.waveLength === '532' ? 0.1 : -0.1);
    const origin = this.direction.scale(0.5).add(slip);
    const created_at = Date.now();
    return [
      {
        origin,
        direction: this.direction,
        waveLength: this.waveLength,
        polarity: new NormalizedVec2(1, 0),
        created_at,
      },
      {
        origin,
        direction: this.direction,
        waveLength: this.waveLength,
        polarity: new NormalizedVec2(0, 1),
        created_at,
      },
    ];
  }

  rotate(basis: NormalizedVec2) {
    this.direction = this.direction.rotateWith(basis);
  }

  get hits(): Segment[] {
    return pathToSegment([
      new Vec2(0.5, -0.5),
      new Vec2(0.5, 0.5),
      new Vec2(-1.5, 0.5),
      new Vec2(-1.5, -0.5)
    ].map(v => v.rotateWith(this.direction)));
  }

  get occupancy(): Occupancy {
    return { positions: [new Vec2(0, 0), this.direction.scale(-1)] };
  }
}

export class Target implements Component {
  direction: NormalizedVec2;
  waveLengthList: [WaveLength] | [WaveLength, WaveLength];
  lit: boolean;
  cutoff = 0;

  constructor(direction: NormalizedVec2, waveLengthList: [WaveLength] | [WaveLength, WaveLength]) {
    this.direction = direction;
    this.waveLengthList = waveLengthList;
    this.lit = false;
  }

  redirects(collisions: Collision[]): Ray[] {
    const cutoffs = this.waveLengthList.map(() => 0);
    for (const { ray: { waveLength, created_at } } of collisions.filter(c => c.at.inner(this.direction) > 0.49)) {
      let flag = false;
      for (const [i, wl] of this.waveLengthList.entries()) {
        if (waveLength === wl) {
          flag = true;
          cutoffs[i] = Math.max(cutoffs[i], created_at);
        }
      }
      if (!flag) {
        this.lit = false;
        return [];
      }
    }
    this.lit = cutoffs.every(c => c > 0);
    this.cutoff = Math.min(...cutoffs);
    return [];
  }

  rotate(basis: NormalizedVec2) {
    this.direction = this.direction.rotateWith(basis);
  }

  get hits(): Segment[] {
    const [c1, c2, c3, c4, c5, c6] = [
      new Vec2(-0.5, -0.5),
      new Vec2(0.5, -0.5),
      new Vec2(0.5, 0.5),
      new Vec2(-0.5, 0.5),
      new Vec2(0, -0.5),
      new Vec2(0, 0.5)
    ].map(v => v.rotateWith(this.direction));

    return [
      { p1: c1, p2: c2 },
      { p1: c2, p2: c3 },
      { p1: c3, p2: c4 },
      { p1: c5, p2: c6 },
    ];
  }

  get occupancy(): Occupancy {
    return { positions: [new Vec2(0, 0)] };
  }
}

export class Obstacle implements Component {
  readonly hits: readonly Segment[] = pathToSegment([
    new Vec2(-0.5, -0.5),
    new Vec2(0.5, -0.5),
    new Vec2(0.5, 0.5),
    new Vec2(-0.5, 0.5),
  ]);

  readonly occupancy: Occupancy = { positions: [new Vec2(0, 0)] };

  redirects(_: Collision[]): Ray[] {
    return [];
  }

  rotate(_: NormalizedVec2) {
  }
}

export class Mirror implements Component {
  dsm: DoubleSidedMirror;

  constructor(direction: NormalizedVec2) {
    this.dsm = new DoubleSidedMirror(direction);
  }

  redirects(collisions: Collision[]): Ray[] {
    const filtered = collisions.filter(({ ray, at }) => at.inner(this.dsm.direction) > -0.01 && ray.direction.inner(this.dsm.direction) < 0);
    return this.dsm.redirects(filtered);
  }

  rotate(basis: NormalizedVec2) {
    this.dsm.rotate(basis);
  }

  get hits(): Segment[] {
    const a = Math.sqrt(0.5);
    return pathToSegment([
      new Vec2(-a, 0),
      new Vec2(0, -a),
      new Vec2(0, +a),
    ].map(v => v.rotateWith(this.dsm.direction)));
  }

  get occupancy(): Occupancy {
    return { positions: [new Vec2(0, 0)] };
  }
}

export class DoubleSidedMirror implements Component {
  direction: NormalizedVec2;

  constructor(direction: NormalizedVec2) {
    this.direction = direction;
  }

  redirects(collisions: Collision[]): Ray[] {
    return collisions.map(({ ray, at }) => ({
      ...ray,
      origin: at,
      direction: ray.direction.add(ray.direction.projectTo(this.direction).scale(-2)).normalize(),
    }));
  }

  rotate(basis: NormalizedVec2) {
    this.direction = this.direction.rotateWith(basis);
  }

  get hits(): Segment[] {
    const a = Math.sqrt(0.5);
    return [{
      p1: new Vec2(0, -a).rotateWith(this.direction),
      p2: new Vec2(0, +a).rotateWith(this.direction),
    }];
  }

  get occupancy(): Occupancy {
    return { positions: [new Vec2(0, 0)] };
  }
}

export class Polarizer implements Component {
  direction: NormalizedVec2;
  polarity: NormalizedVec2;

  constructor(direction: NormalizedVec2, polarity: NormalizedVec2) {
    this.direction = direction;
    this.polarity = polarity;
  }

  redirects(collisions: Collision[]): Ray[] {
    return collisions
      .filter(c => Math.abs(c.at.outer(this.direction)) < 0.5)
      .map(({ ray, at }) => ({
        ...ray,
        origin: at,
        polarity: ray.polarity.projectTo(this.polarity)
      }));
  }

  rotate(basis: NormalizedVec2) {
    this.direction = this.direction.rotateWith(basis);
  }

  get hits(): Segment[] {
    // const [c1, c2, c3, c4, c5, c6] = [
    const [c5, c6] = [
      // new Vec2(-0.5, -0.5),
      // new Vec2(0.5, -0.5),
      // new Vec2(0.5, 0.5),
      // new Vec2(-0.5, 0.5),
      new Vec2(0, -0.5),
      new Vec2(0, 0.5)
    ].map(v => v.rotateWith(this.direction));

    return [
      // { p1: c1, p2: c2 },
      // { p1: c3, p2: c4 },
      { p1: c5, p2: c6 },
    ];
  }

  get occupancy(): Occupancy {
    return { positions: [new Vec2(0, 0)] };
  }
}

export class DichroicMirror implements Component {
  dsm: DoubleSidedMirror;

  constructor(direction: NormalizedVec2) {
    this.dsm = new DoubleSidedMirror(direction);
  }

  redirects(collisions: Collision[]): Ray[] {
    const red = collisions.filter(({ ray }) => ray.waveLength == '650');
    const green = collisions.filter(({ ray }) => ray.waveLength == '532');
    const mirroredGreen = this.dsm.redirects(green);
    return red.map<Ray>(({ ray, at }) => ({ ...ray, origin: at })).concat(...mirroredGreen);
  }

  rotate(basis: NormalizedVec2) {
    this.dsm.rotate(basis);
  }

  get hits(): Segment[] {
    return this.dsm.hits;
  }

  get occupancy(): Occupancy {
    return { positions: [new Vec2(0, 0)] };
  }
}

export class PolarizingBeamSplitter implements Component {
  dsm: DoubleSidedMirror;

  constructor(direction: NormalizedVec2) {
    this.dsm = new DoubleSidedMirror(direction);
  }

  redirects(collisions: Collision[]): Ray[] {
    const p = new NormalizedVec2(1, 0);
    const s = new NormalizedVec2(0, 1);

    const pp = collisions.map<Ray>(({ ray, at }) => ({ ...ray, origin: at, polarity: ray.polarity.projectTo(p) }));
    const sp = this.dsm.redirects(collisions).map(ray => ({ ...ray, polarity: ray.polarity.projectTo(s) }));
    return pp.concat(...sp);
  }

  rotate(basis: NormalizedVec2) {
    this.dsm.rotate(basis);
  }

  get hits(): Segment[] {
    return this.dsm.hits;
  }

  get occupancy(): Occupancy {
    return { positions: [new Vec2(0, 0)] };
  }
}
