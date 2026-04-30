import type {Canvas} from '../utils/canvas.ts';
import type {Board, RayPath} from './board.ts';
import type {Reserve} from './reserve.ts';
import {Vec2} from '../utils/vec.ts';
import {type Component} from './components.ts';

export type Orientation = 'portrait' | 'landscape';

interface Size {
    width: number;
    height: number;
}

export interface BoardLayout {
    width: number;
    height: number;
    coordinateOffset: Vec2;
    placements: { position: Vec2; component: Component }[];
    rays: RayPath[];
}

export interface Slot {
    position: Vec2
    component: Component;
    count: number;
}

export interface ReserveLayout {
    width: number;
    height: number;
    coordinateOffset: Vec2;
    slots: Slot[];
}

export interface DragLayout {
    position: Vec2;
    component: Component;
    previewCell?: Vec2;
}

export interface Layout {
    orientation: Orientation;
    scale: number;
    board: {
        layout: BoardLayout;
        offset: Vec2;
    };
    reserve: {
        layout: ReserveLayout;
        offset: Vec2;
    }
    drags: DragLayout[];
}

export const calcLayout = (canvas: Canvas, board: Board, reserve: Reserve, drags: DragLayout[]): Layout => {
    const boardLayout = board.calcLayout();
    const reserveLayouts = reserve.calcLayout();

    const portraitLayout = calcPortraitLayout(canvas, boardLayout, reserveLayouts.portrait);
    const landscapeLayout = calcLandscapeLayout(canvas, boardLayout, reserveLayouts.landscape);

    const layout = landscapeLayout.scale > portraitLayout.scale ? landscapeLayout : portraitLayout;
    return { ...layout, drags };
};

const calcPortraitLayout = (canvas: Size, boardLayout: BoardLayout, reserveLayout: ReserveLayout): Omit<Layout, 'drags'> => {
    const { width: boardWidth, height: boardHeight } = boardLayout;
    const { width: reserveWidth, height: reserveHeight } = reserveLayout;
    const width = Math.max(reserveWidth, boardWidth);
    const height = boardHeight + reserveHeight;
    const scale = Math.min(canvas.width / width, canvas.height / height);
    return {
        orientation: 'portrait',
        scale,
        board: {
            layout: boardLayout,
            offset: new Vec2((canvas.width - boardWidth * scale) / 2, (canvas.height - height * scale) / 2)
        },
        reserve: {
            layout: reserveLayout,
            offset: new Vec2((canvas.width - reserveWidth * scale) / 2, (canvas.height - height * scale) / 2 + boardHeight * scale),
        },
    };
};

const calcLandscapeLayout = (canvas: Size, boardLayout: BoardLayout, reserveLayout: ReserveLayout):Omit <Layout, 'drags'> => {
    const { width: boardWidth, height: boardHeight } = boardLayout;
    const { width: reserveWidth, height: reserveHeight } = reserveLayout;
    const width = boardWidth + reserveWidth;
    const height = Math.max(boardHeight, reserveHeight);
    const scale = Math.min(canvas.width / width, canvas.height / height);
    return {
        orientation: 'landscape',
        scale,
        board: {
            layout: boardLayout,
            offset: new Vec2((canvas.width - width * scale) / 2, (canvas.height - boardHeight * scale) / 2),
        },
        reserve: {
            layout: reserveLayout,
            offset: new Vec2((canvas.width - width * scale) / 2 + boardWidth * scale, (canvas.height - reserveHeight * scale) / 2),
        },
    };
};

export const positioning = (canvasPos: Vec2, layout: Layout): { area: 'board' | 'reserve'; position: Vec2} | undefined => {
    const { scale, board, reserve } = layout;

    const boardPos = canvasPos.sub(board.offset).scale(1/scale);
    if (0 < boardPos.x && boardPos.x < board.layout.width && 0 < boardPos.y && boardPos.y < board.layout.height) {
        return { area: 'board', position: boardPos.sub(board.layout.coordinateOffset) };
    }
    const reservePos = canvasPos.sub(reserve.offset).scale(1/scale);
    if (0 < reservePos.x && reservePos.x < reserve.layout.width && 0 < reservePos.y && reservePos.y < reserve.layout.height) {
        return { area: 'reserve', position: reservePos.sub(reserve.layout.coordinateOffset) };
    }
};

export const cellOnBoard = (boardPos: Vec2, _: Layout): Vec2 => {
  return boardPos.round();
};

export const slotOnReserve = (reservePos: Vec2, layout: Layout): Slot | undefined => {
  const distance = layout.reserve.layout.slots.map(slot => slot.position.sub(reservePos).l2());
  if (distance.length === 0) return undefined;
  const argmin = distance.reduce((i, v, j, a) => v < a[i] ? j : i, 0);
  return layout.reserve.layout.slots[argmin];
};
