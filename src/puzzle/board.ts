import {
  Target,
  type Component,
  type Ray,
  type Collision,
} from './components.ts';
import { createComponent, type ComponentDescriptor, describeComponent } from './component-descriptor.ts';
import {NormalizedVec2, Vec2} from '../utils/vec.ts';
import type {BoardLayout} from './layout.ts';
import {judgeCollision, pathToSegment, type Segment} from './collision.ts';

export interface Placement {
  position: Vec2;
  descriptor: ComponentDescriptor;
  movable?: boolean;
}

export interface BoardInit {
  width: number;
  height: number;
  placements: readonly Placement[];
}

export interface Cell {
  position: Vec2;
  component: Component;
  movable: boolean;
  incoming: Collision[]
}

export interface RayPath extends Ray {
  end: Vec2;
}

export class Board {
  readonly width: number;
  readonly height: number;
  private cells: Cell[];
  private rays: RayPath[];
  private frameHits: Segment[];
  #lastModified: number;

  constructor(boardInit: BoardInit) {
    const {width, height, placements} = boardInit;
    this.width = width;
    this.height = height;
    this.cells = [];
    this.rays = [];
    this.frameHits = pathToSegment([
      new Vec2(-0.5, -0.5),
      new Vec2(width + 1.5, -0.5),
      new Vec2(width + 1.5, height + 1.5),
      new Vec2(-0.5, height + 1.5),
    ]);
    this.#lastModified = Date.now();

    for (const placement of placements) {
      const {position, descriptor, movable} = placement;
      const component = createComponent(descriptor);
      const condition = this.checkAllocation(position, component);
      if (condition === 'vacant') this.cells.push({position, component, movable: movable ?? false, incoming: []});
    }
  }

  private selectCell(position: Vec2): Cell | undefined {
    return this.cells.find(cell => cell.component.occupancy.positions.map(p => p.add(cell.position)).some(p => p.equals(position)));
  }

  private removeCell(position: Vec2): Cell | undefined {
    const index = this.cells.findIndex(cell => cell.movable && cell.component.occupancy.positions.map(p => p.add(cell.position)).some(p => p.equals(position)));
    if (index === -1) return undefined;
    this.#lastModified = Date.now();
    const [cell] = this.cells.splice(index, 1);
    return cell;
  }

  checkAllocation(position: Vec2, component: Component): AllocationCondition {
    const {x, y} = position;
    const {width, height} = this;

    if (component instanceof Target) {
      if (x < 0 || width + 1 < x || y < 0 || height + 1 < y) return 'out of bounds';
    } else {
      if (x <= 0 || width + 1 <= x || y <= 0 || height + 1 <= y) return 'out of bounds';
    }

    const cells = component.occupancy.positions
        .map(p => p.add(position)).map(p => this.selectCell(p))
        .filter(cell => cell != null);
    if (cells.length > 0) return cells.every(cell => cell.movable) ? 'occupied by movable' : 'occupied by immovable';
    return 'vacant';
  }

  get isSolved(): boolean {
    const targets = this.cells.map(cell => cell.component).filter(c => c instanceof Target);

    return targets.every(target => target.lit && target.cutoff >= this.#lastModified);
  }

  get lastModified(): number {
    return this.#lastModified;
  }

  calcLayout(): BoardLayout {
    return {
      width: this.width + 2,
      height: this.height + 2,
      coordinateOffset: new Vec2(0.5, 0.5),
      placements: Array.from(this.cells),
      rays: Array.from(this.rays),
    };
  }

  reset() {
    this.#lastModified = Date.now();
    this.cells = this.cells.filter(cell => !cell.movable);
    this.cells.forEach(cell => { cell.incoming = []; });
    this.rays = [];
  }

  rotate(position: Vec2, basis: NormalizedVec2) {
    const cell = this.selectCell(position);
    if (!cell?.movable) return false;
    this.#lastModified = Date.now();
    cell.component.rotate(basis);
    cell.incoming = [];
    return true;
  }

  remove(position: Vec2): ComponentDescriptor | null {
    const cell = this.removeCell(position);
    if (cell == null) return null;
    this.#lastModified = Date.now();
    return describeComponent(cell.component);
  }

  allocate(position: Vec2, descriptor: ComponentDescriptor): ComponentDescriptor[] | boolean {
    const component = createComponent(descriptor);
    const condition = this.checkAllocation(position, component);
    if (condition === 'out of bounds' || condition === 'occupied by immovable') return false;

    if (condition === 'occupied by movable') {
      this.#lastModified = Date.now();
      const cells = component.occupancy.positions
          .map(p => this.removeCell(p.add(position)))
          .filter(v => v != null);
      this.cells.push({ position, component, movable: true, incoming: [] });
      return cells.map(cell => describeComponent(cell.component));
    } else if (condition === 'vacant') {
      this.#lastModified = Date.now();
      this.cells.push({position, component, movable: true, incoming: []});
      return true;
    } else {
      throw new Error('unknown condition');
    }
  }

  step() {
    const outgoing: Ray[] = [];
    for (const cell of this.cells) {
      const collisions: Collision[] = cell.incoming.splice(0).map(({ray, at}) => ({
        ray: {
          ...ray,
          origin: ray.origin.sub(cell.position),
        },
        at: at.sub(cell.position),
      }));
      const rays = cell.component
          .redirects(collisions)
          .map(ray => ({
            ...ray,
            origin: ray.origin.add(cell.position),
          }));
      outgoing.push(...rays);
    }

    this.rays.splice(0);
    const hits: { segment: Segment; cell?: Cell }[] = this.frameHits.map(segment => ({ segment }));
    for (const cell of this.cells) {
      hits.push(...cell.component.hits.map(s => ({ segment: translate(s, cell.position), cell })));
    }

    for (const ray of outgoing.filter(ray => ray.polarity.l2() > 0.01)) {
      let distance = Infinity, at = new Vec2(Infinity, Infinity), cell: Cell | undefined = undefined;
      for (const hit of hits) {
        const c = judgeCollision(ray, hit.segment);
        if (c != null && c.distance < distance) {
          distance = c.distance;
          at = c.position;
          cell = hit.cell;
        }
      }

      this.rays.push({...ray, end: at});
      cell?.incoming.push({ray, at});
    }
  }
}

const translate = (segment: Segment, offset: Vec2): Segment => {
  return { p1: segment.p1.add(offset), p2: segment.p2.add(offset) };
};

export type AllocationCondition = 'out of bounds' | 'occupied by immovable' | 'occupied by movable' | 'vacant';
