import {Board} from "./board.ts";
import {Renderer} from "./render.ts";
import {Canvas} from "../utils/canvas.ts";
import {type ReservableComponentDescriptor, Reserve} from "./reserve.ts";
import {InteractionController} from "./interaction.ts";
import {NormalizedVec2, type Vec2} from "../utils/vec.ts";
import {type ComponentDescriptor, createComponent} from "./component-descriptor.ts";
import {calcLayout, cellOnBoard, type DragLayout, type Layout, positioning} from "./layout.ts";
import type {Problem} from "./problem.ts";

export class Runtime {
  problem: Problem;
  canvas: Canvas;
  board: Board;
  reserve: Reserve;
  layout: Layout;
  renderer: Renderer;
  interaction: InteractionController;
  holding: Map<number, ComponentDescriptor>;
  history: Operation[];
  onSolve: () => void;
  isSolved = false;
  #running = false;
  #frameId: number | null = null;

  constructor(canvasId: string, problem: Problem, onSolve: () => void) {
    const canvas = new Canvas(canvasId);
    const board = new Board(problem.board);
    const reserve = new Reserve(problem.reserve);
    const layout = calcLayout(canvas, board, reserve, []);
    const renderer = new Renderer(canvas);
    canvas.onresize = () => this.renderer.render(this.layout);

    this.problem = problem;
    this.canvas = canvas;
    this.board = board;
    this.reserve = reserve;
    this.layout = layout;
    this.renderer = renderer;
    this.interaction = new InteractionController(this);
    this.holding = new Map();
    this.history = [];
    this.onSolve = onSolve;
  }

  start = () => {
    if (this.#running) return;
    this.#running = true;
    this.tick();
  }

  private tick = () => {
    if (!this.#running) return;

    this.board.step();
    const isSolved = this.board.isSolved;

    const drags = [...this.holding.entries()].map(([pointerId, desc]) => {
      const state = this.interaction.states.get(pointerId);
      if (state == null) return undefined;
      const position = state.pointer.current;

      const p = positioning(position, this.layout);
      if (p == null || p.area === 'reserve') return { position, component: createComponent(desc) };
      const cell = cellOnBoard(p.position, this.layout);
      const component = createComponent(desc);
      const condition = this.board.checkAllocation(cell, component)
      const previewCell = condition === 'vacant' || condition === 'occupied by movable' ? cell : undefined;
      return { position, component, previewCell } satisfies DragLayout;
    }).filter(v => v != null);
    const layout = this.layout = calcLayout(this.canvas, this.board, this.reserve, drags);

    this.renderer.render(layout);

    if (isSolved && !this.isSolved) {
      this.isSolved = true;
      this.onSolve();
    }

    this.#frameId = requestAnimationFrame(this.tick);
  }

  dispose() {
    this.#running = false;
    if (this.#frameId != null) cancelAnimationFrame(this.#frameId);
    this.#frameId = null;
    this.interaction.dispose();
    this.canvas.dispose();
  }

  dispatch(operation: Operation): boolean {
    this.history.push(operation);

    if (operation.kind === 'turn-in') {
      const descriptor = this.holding.get(operation.pointerId);
      if (descriptor == null) return false;
      this.holding.delete(operation.pointerId);
      this.reserve.turnIn(descriptor);
      return true;
    } else if (operation.kind === 'rotate') {
      return this.board.rotate(operation.cell, operation.basis);
    } else if (operation.kind === 'take') {
      const descriptor = this.reserve.take(operation.descriptor);
      if (descriptor == null) return false;
      if (this.holding.has(operation.pointerId)) this.dispatch({ kind: 'turn-in', pointerId: operation.pointerId });
      this.holding.set(operation.pointerId, descriptor);
      return true;
    } else if (operation.kind === 'remove') {
      const descriptor = this.board.remove(operation.cell);
      if (descriptor == null) return false;
      if (this.holding.has(operation.pointerId)) this.dispatch({ kind: 'turn-in', pointerId: operation.pointerId });
      this.holding.set(operation.pointerId, descriptor);
      return true;
    } else if (operation.kind === 'allocate') {
      const descriptor = this.holding.get(operation.pointerId);
      if (descriptor == null) return false;

      const removed = this.board.allocate(operation.cell, descriptor);
      if (removed !== false) this.holding.delete(operation.pointerId);
      if (typeof removed === 'boolean') return removed;
      for (const desc of removed) {
        this.holding.set(operation.pointerId, desc);
        this.dispatch({ kind: 'turn-in', pointerId: operation.pointerId });
      }
      return true;
    } else if (operation.kind === 'reset') {
      this.board = new Board(this.problem.board);
      this.reserve = new Reserve(this.problem.reserve);

      return true;
    } else {
      throw new Error('unknown operation');
    }
  }
}

type Operation = RotateOperation | TakeOperation | RemoveOperation | AllocateOperation | TurnInOperation | ResetOperation;

interface RotateOperation {
  kind: "rotate";
  cell: Vec2;
  basis: NormalizedVec2;
}

interface TakeOperation {
  kind: "take";
  pointerId: number;
  descriptor: ReservableComponentDescriptor;
}

interface RemoveOperation {
  kind: "remove";
  pointerId: number;
  cell: Vec2;
}

interface AllocateOperation {
  kind: "allocate";
  pointerId: number;
  cell: Vec2;
}

interface TurnInOperation {
  kind: "turn-in";
  pointerId: number;
}

interface ResetOperation {
  kind: "reset";
}
