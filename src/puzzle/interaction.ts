import {handlePointer, type PointerEventDelegate} from "../utils/pointer.ts";
import {NormalizedVec2, Vec2} from "../utils/vec.ts";
import type {Runtime} from "./runtime.ts";
import {cellOnBoard, positioning, slotOnReserve} from "./layout.ts";
import {describeComponent} from "./component-descriptor.ts";

const DRAG_THRESHOLD_PX = 8;
const ROTATE_BASIS = new NormalizedVec2(0, 1);

interface PointerState {
  start: Vec2;
  current: Vec2;
}

type InteractionState =
  | 'unknown'
  | 'dragging'
  ;

export class InteractionController implements PointerEventDelegate {
  runtime: Runtime;
  disposeHandlers: () => void;

  states: Map<number, { pointer: PointerState; interaction: InteractionState; }>;

  constructor(runtime: Runtime) {
    this.runtime = runtime;
    this.states = new Map;

    this.disposeHandlers = handlePointer(runtime.canvas.element, this);
  }

  dispose() {
    this.states.clear();
    this.disposeHandlers();
  }

  handleStart(pointerId: number, point: Vec2): void {
    this.states.set(pointerId, {
      pointer: { start: point, current: point },
      interaction: 'unknown',
    });
  }

  handleMove(pointerId: number, point: Vec2): void {
    const state = this.states.get(pointerId);
    if (state == null) return;
    state.pointer.current = point;

    if (state.interaction === 'unknown') {
      if (point.sub(state.pointer.start).l2() > DRAG_THRESHOLD_PX) {
        // start drag
        state.interaction = 'dragging';

        const p = positioning(state.pointer.start, this.runtime.layout);
        if (p == null) {
          this.states.delete(pointerId);
          return;
        }
        if (p.area === 'board') {
          const cell = cellOnBoard(p.position, this.runtime.layout);
          const fulfilled = this.runtime.dispatch({ kind: 'remove', pointerId, cell });
          if (!fulfilled) {
            this.states.delete(pointerId);
            return;
          }
        }
        if (p.area === 'reserve') {
          const slot = slotOnReserve(p.position, this.runtime.layout);
          if (slot == null) {
            this.states.delete(pointerId);
            return;
          }
          const fulfilled = this.runtime.dispatch({ kind: 'take', pointerId, descriptor: describeComponent(slot.component)});
          if (!fulfilled) {
            this.states.delete(pointerId);
            return;
          }
        }
      }
    }
  }

  handleEnd(pointerId: number, point: Vec2): void {
    const state = this.states.get(pointerId);
    if (state == null) return;
    this.states.delete(pointerId);

    if (state.interaction === 'unknown') {
      const p = positioning(state.pointer.start, this.runtime.layout);
      if (p == null || p.area === 'reserve') return;
      this.runtime.dispatch({ kind: 'rotate', cell: cellOnBoard(p.position, this.runtime.layout), basis: ROTATE_BASIS });
    } else if (state.interaction === 'dragging') {
      const p = positioning(point, this.runtime.layout);
      if (p != null && p.area === 'board') {
        const fulfilled = this.runtime.dispatch({
          kind: 'allocate',
          pointerId,
          cell: cellOnBoard(p.position, this.runtime.layout)
        });
        if (!fulfilled) {
          this.runtime.dispatch({kind: 'turn-in', pointerId});
        }
      } else {
        this.runtime.dispatch({kind: 'turn-in', pointerId})
      }
    }
  }

  handleCancel(pointerId: number): void {
    const state = this.states.get(pointerId);
    if (state == null) return;
    this.states.delete(pointerId);

    if (state.interaction === 'dragging') {
      this.runtime.dispatch({kind: 'turn-in', pointerId});
    }
  }
}
