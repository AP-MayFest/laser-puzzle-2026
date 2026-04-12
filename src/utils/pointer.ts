import {Vec2} from "./vec.ts";

const MOUSE_POINTER_ID = -1;

export interface PointerEventDelegate {
  handleStart(pointerId: number, point: Vec2): void;
  handleMove(pointerId: number, point: Vec2): void;
  handleEnd(pointerId: number, point: Vec2): void;
  handleCancel(pointerId: number): void;
}

export const handlePointer  = (element: HTMLElement, delegate: PointerEventDelegate): (() => void) => {
  const posInElement = (clientPosition: { clientX: number; clientY: number }): Vec2 => {
    const rect = element.getBoundingClientRect();
    return new Vec2(clientPosition.clientX - rect.left, clientPosition.clientY - rect.top);
  };
  const trackingPointerId = new Set<number>();

  // if (PointerEvent != null) {
  //   element.addEventListener('pointerdown', ev => {
  //     trackingPointerId.add(ev.pointerId);
  //     delegate.handleStart(ev.pointerId, posInElement(ev));
  //     ev.preventDefault();
  //   });
  //   window.addEventListener('pointermove', ev => {
  //     if (trackingPointerId.has(ev.pointerId)) {
  //       delegate.handleMove(ev.pointerId, posInElement(ev));
  //       ev.preventDefault();
  //       ev.stopPropagation();
  //     }
  //   });
  //   window.addEventListener('pointerup', ev => {
  //     if (trackingPointerId.has(ev.pointerId)) {
  //       trackingPointerId.delete(ev.pointerId);
  //       delegate.handleEnd(ev.pointerId, posInElement(ev));
  //       ev.preventDefault();
  //       ev.stopPropagation();
  //     }
  //   });
  //   window.addEventListener('pointercancel', ev => {
  //     if (trackingPointerId.has(ev.pointerId)) {
  //       trackingPointerId.delete(ev.pointerId);
  //       delegate.handleCancel(ev.pointerId);
  //       ev.preventDefault();
  //       ev.stopPropagation();
  //     }
  //   })
  // } else {
    const onMouseDown = (ev: MouseEvent) => {
      trackingPointerId.add(MOUSE_POINTER_ID);
      delegate.handleStart(MOUSE_POINTER_ID, posInElement(ev));
      ev.preventDefault();
    };
    const onMouseMove = (ev: MouseEvent) => {
      if (trackingPointerId.has(MOUSE_POINTER_ID)) {
        delegate.handleMove(MOUSE_POINTER_ID, posInElement(ev));
      }
    };
    const onMouseUp = (ev: MouseEvent) => {
      if (trackingPointerId.has(MOUSE_POINTER_ID)) {
        trackingPointerId.delete(MOUSE_POINTER_ID);
        delegate.handleEnd(MOUSE_POINTER_ID, posInElement(ev));
      }
    };

    const onTouchStart = (ev: TouchEvent) => {
      for (const touch of ev.changedTouches) {
        trackingPointerId.add(touch.identifier);
        delegate.handleStart(touch.identifier, posInElement(touch));
        ev.preventDefault();
      }
    };
    const onTouchMove = (ev: TouchEvent) => {
      for (const touch of ev.changedTouches) {
        if (trackingPointerId.has(touch.identifier)) {
          delegate.handleMove(touch.identifier, posInElement(touch));
        }
      }
    };
    const onTouchEnd = (ev: TouchEvent) => {
      for (const touch of ev.changedTouches) {
        if (trackingPointerId.has(touch.identifier)) {
          trackingPointerId.delete(touch.identifier)
          delegate.handleEnd(touch.identifier, posInElement(touch));
        }
      }
    };
    const onTouchCancel = (ev: TouchEvent) => {
      for (const touch of ev.changedTouches) {
        if (trackingPointerId.has(touch.identifier)) {
          trackingPointerId.delete(touch.identifier)
          delegate.handleCancel(touch.identifier);
        }
      }
    };

    element.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    element.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchcancel', onTouchCancel);

    return () => {
      trackingPointerId.clear();
      element.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      element.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchCancel);
    };
  // }
};
