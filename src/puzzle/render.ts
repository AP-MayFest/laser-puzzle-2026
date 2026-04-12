import {
  type Component,
  DichroicMirror,
  DoubleSidedMirror,
  Laser,
  Mirror,
  Polarizer,
  PolarizingBeamSplitter,
  Target,
} from './components.ts'
import type {RayPath} from './board.ts'
import {NormalizedVec2, Vec2} from "../utils/vec.ts"
import type {Canvas} from "../utils/canvas.ts";
import {
  type BoardLayout, type DragLayout,
  type Layout,
  type ReserveLayout,
} from "./layout.ts";
import {ColorController} from "../utils/color-scheme.ts";
import {getLaserColorProfile} from "./laser-color.ts";

export interface Colorpalette {
  board: string;
  grid: string;
  accent: string;
  red: string;
  green: string;
}

export class Renderer {
  canvas: Canvas;
  colorController: ColorController;

  constructor(canvas: Canvas) {
    this.canvas = canvas;
    this.colorController = new ColorController;
  }

  get colorpalette(): Colorpalette {
    const { background, text, border } = this.colorController.scheme;
    const { red, green } = getLaserColorProfile();
    return { board: background, grid: border, accent: text, red, green };
  }

  render(layout: Layout) {
    const { scale, board, reserve, drags } = layout;

    const { context: ctx, width, height, pixelRatio } = this.canvas;
    ctx.save();
    ctx.resetTransform();

    ctx.scale(pixelRatio, pixelRatio);
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 0.5 ** 5;
    ctx.strokeStyle = 'none';

    ctx.save();
    ctx.translate(board.offset.x, board.offset.y);
    ctx.scale(scale, scale);
    this.renderBoard(board.layout, drags.map(d => d.previewCell).filter(v => v != null));
    ctx.restore();

    ctx.save();
    ctx.translate(reserve.offset.x, reserve.offset.y);
    ctx.scale(scale, scale);
    this.renderReserve(reserve.layout);
    ctx.restore();

    ctx.resetTransform();
    ctx.scale(pixelRatio, pixelRatio);
    this.renderDrags(drags, scale);

    ctx.restore();
  }

  renderBoard(layout: BoardLayout, previews: Vec2[]) {
    this.canvas.context.save();
    this.canvas.context.translate(layout.coordinateOffset.x, layout.coordinateOffset.y);
    this.renderGrid(layout.height - 2, layout.width - 2);
    this.renderRays(layout.rays);
    this.renderComponents(layout.placements);
    this.renderPreviews(previews);
    this.canvas.context.restore();
  }

  renderGrid(row: number, col: number) {
    const GRID_LINE_WIDTH = 0.5 ** 7;
    const FRAME_LINE_WIDTH = 0.5 ** 3;

    const ctx = this.canvas.context;
    ctx.save();
    ctx.translate(0.5, 0.5)

    ctx.strokeStyle = this.colorpalette.grid;
    ctx.lineWidth = GRID_LINE_WIDTH;
    for (let x = 1; x < col; ++x) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, row);
      ctx.stroke();
    }
    for (let y = 1; y < row; ++y) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(col, y);
      ctx.stroke();
    }
    ctx.strokeStyle = this.colorpalette.accent;
    ctx.lineWidth = FRAME_LINE_WIDTH;
    ctx.strokeRect(0 - FRAME_LINE_WIDTH/2, 0 - FRAME_LINE_WIDTH/2, col + FRAME_LINE_WIDTH, row + FRAME_LINE_WIDTH);

    ctx.restore();
  }

  renderRays(rays: RayPath[]) {
    const time = Date.now() / 1000;
    const p = new NormalizedVec2(1, 0), s = new NormalizedVec2(0, 1);

    const ctx = this.canvas.context;
    for (const { origin, end, waveLength, polarity, direction } of rays) {
      const unit = waveLength === '650' ? 1/16 : 1/20;
      const offset = origin.inner(direction) - time;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = waveLength === '650' ? this.colorpalette.red : this.colorpalette.green;
      if (polarity.inner(p) !== 0) {
        const r = end.sub(origin);
        const length = r.l2();
        const norm = r.normalize().rotate(Math.PI / 2);

        ctx.lineWidth = 0.5 ** 6;
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        for (let i = 0; i < length / 0.01; i += 1) {
          const s = i * 0.01, d = Math.sin((offset + s) / unit / 2 * Math.PI) * (0.5 ** 4);
          const base = origin.scale(1 - s / length).add(end.scale(s / length));
          const { x, y } = base.add(norm.scale(d));
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      if (polarity.inner(s) !== 0) {
        ctx.lineWidth = 0.5 ** 5;
        ctx.setLineDash([unit, unit]);
        ctx.lineDashOffset = (offset - unit / 2) % 1;
        ctx.beginPath()
        ctx.moveTo(origin.x, origin.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }

      // ctx.fillStyle = 'blue';
      // ctx.beginPath();
      // ctx.arc(end.x, end.y, 0.1,  0, Math.PI * 2);
      // ctx.fill();

      ctx.restore();
    }
  }

  renderComponents(placements: BoardLayout['placements']) {
    const ctx = this.canvas.context;
    for (const { position, component } of placements) {
      ctx.save();
      ctx.translate(position.x, position.y);
      this.drawComponent(component);
      ctx.restore();
    }
  }

  renderPreviews(previews: Vec2[]) {
    const ctx = this.canvas.context;
    for (const position of previews) {
      ctx.save();
      ctx.translate(position.x, position.y);
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = this.colorpalette.accent;
      ctx.fillRect(-0.5, -0.5, 1, 1);
      ctx.restore();
    }
  }

  renderReserve(layout: ReserveLayout) {
    const ctx = this.canvas.context;
    ctx.translate(layout.coordinateOffset.x, layout.coordinateOffset.y);

    for (const { position, component, count} of layout.slots) {
      ctx.save();
      ctx.translate(position.x, position.y);
      if (count > 0) {
        ctx.save();
        if (component instanceof Laser) {
          ctx.scale(0.5, 0.5);
          ctx.translate(0.5, 0);
        }
        this.drawComponent(component);
        ctx.restore();
      }
      if (count > 1) drawCount(ctx, count, this.colorpalette.accent);
      ctx.restore();
    }
  }

  renderDrags(drags: DragLayout[], scale: number) {
    const ctx = this.canvas.context;
    for (const { position, component } of drags) {
      ctx.save();
      ctx.translate(position.x, position.y);
      ctx.scale(scale, scale);
      this.drawComponent(component);
      ctx.restore();
    }
  }


  drawComponent(component: Component) {
    if (component instanceof Laser) this.drawLaser(component);
    else if (component instanceof Target) this.drawTarget(component);
    else if (component instanceof Mirror) this.drawMirror(component);
    else if (component instanceof DoubleSidedMirror) this.drawDoubleSidedMirror(component);
    else if (component instanceof Polarizer) this.drawPolarizer(component);
    else if (component instanceof DichroicMirror) this.drawDichroicMirror(component);
    else if (component instanceof PolarizingBeamSplitter) this.drawPolarizingBeamSplitter(component);
    else throw new Error('unknown component');
  }

  drawLaser(laser: Laser) {
    const { direction, waveLength } = laser;

    const ctx = this.canvas.context;
    ctx.save()
    ctx.transform(direction.x, direction.y, -direction.y, direction.x, 0, 0);

    ctx.fillStyle = this.colorpalette.board;
    ctx.fillRect(-1.5, -0.5, 2, 1);

    ctx.fillStyle = waveLength === '650' ? this.colorpalette.red : this.colorpalette.green;
    ctx.beginPath()
    ctx.moveTo(-1.50, -0.25)
    ctx.lineTo(0, -0.25)
    ctx.lineTo(0, -0.5)
    ctx.lineTo(+0.5,  0)
    ctx.lineTo(0, +0.5)
    ctx.lineTo(0, +0.25)
    ctx.lineTo(-1.5, +0.25)
    ctx.closePath()
    ctx.fill()

    ctx.lineWidth = 0.5 ** 6;
    ctx.strokeStyle = this.colorpalette.accent;
    ctx.strokeRect(-1.5, -0.5, 2, 1);

    ctx.restore()
  }

  drawTarget(target: Target) {
    const lineWidth = 0.5 ** 3;
    const { direction, waveLength, lit } = target;

    const ctx = this.canvas.context;
    ctx.save()
    ctx.strokeStyle = ctx.fillStyle = waveLength === '650' ? this.colorpalette.red : this.colorpalette.green;
    ctx.transform(direction.x, direction.y, -direction.y, direction.x, 0, 0);

    if (lit) ctx.fillRect(0, -0.5, 0.5, 1);
    else {
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(lineWidth / 2, -0.5 + lineWidth/2, 0.5 - lineWidth, 1 - lineWidth);
    }

    ctx.lineWidth = 0.5 ** 6;
    ctx.strokeStyle = this.colorpalette.accent;
    ctx.strokeRect(0, -0.5, 0.5, 1);

    ctx.restore()
  }

  drawMirror(mirror: Mirror) {
    const { dsm: { direction } } = mirror;
    const a = Math.sqrt(0.5);

    const ctx = this.canvas.context;
    ctx.save()

    ctx.lineWidth = 0.5 ** 6;
    ctx.strokeStyle = this.colorpalette.accent;
    ctx.strokeRect(-0.5, -0.5, 1, 1);

    ctx.fillStyle = this.colorpalette.accent;
    ctx.transform(direction.x, direction.y, -direction.y, direction.x, 0, 0);

    ctx.beginPath()
    ctx.moveTo(-a, 0);
    ctx.lineTo(0, -a);
    ctx.lineTo(0, a);
    // ctx.lineTo(-a, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawDoubleSidedMirror(mirror: DoubleSidedMirror) {
    const { direction } = mirror;
    const a = Math.sqrt(0.5);

    const ctx = this.canvas.context;
    ctx.save()

    ctx.lineWidth = 0.5 ** 6;
    ctx.strokeStyle = this.colorpalette.accent;
    ctx.strokeRect(-0.5, -0.5, 1, 1);

    ctx.lineWidth = 0.5 ** 5
    ctx.strokeStyle = this.colorpalette.accent;
    ctx.transform(direction.x, direction.y, -direction.y, direction.x, 0, 0);

    ctx.beginPath()
    ctx.moveTo(0, -a);
    ctx.lineTo(0, a);
    ctx.stroke();

    ctx.restore();
  }

  drawPolarizer(polarizer: Polarizer) {
    const { direction, polarity } = polarizer;

    const ctx = this.canvas.context;
    ctx.save()

    ctx.lineWidth = 0.5 ** 6;
    ctx.strokeStyle = this.colorpalette.accent;
    ctx.strokeRect(-0.5, -0.5, 1, 1);

    const label = polarity.y === 0 ? 'P' : polarity.x === 0 ? 'S' : 'ﾅﾅﾒ';
    drawLabel(ctx, label, this.colorpalette.accent, 0.25);

    ctx.lineWidth = 0.5 ** 5;
    ctx.strokeStyle = this.colorpalette.accent;
    ctx.transform(direction.x, direction.y, -direction.y, direction.x, 0, 0);

    ctx.beginPath()
    ctx.moveTo(0, -0.5);
    ctx.lineTo(0, 0.5);
    ctx.stroke();

    ctx.restore();
  }

  drawDichroicMirror(mirror: DichroicMirror) {
    const { dsm: { direction } } = mirror;
    const a = Math.sqrt(0.5);

    const ctx = this.canvas.context;
    ctx.save()

    ctx.lineWidth = 0.5 ** 6;
    ctx.strokeStyle = this.colorpalette.accent;
    ctx.strokeRect(-0.5, -0.5, 1, 1);

    drawLabel(ctx, 'DM', this.colorpalette.accent, direction.inner(new Vec2(1, 1)) === 0 ? -0.2 : 0.2)

    ctx.transform(direction.x, direction.y, -direction.y, direction.x, 0, 0);

    ctx.strokeStyle = this.colorpalette.accent;
    ctx.lineWidth = 0.5 ** 5;
    ctx.beginPath()
    ctx.moveTo(0, -a);
    ctx.lineTo(0, a);
    ctx.stroke();

    ctx.strokeStyle = this.colorpalette.green;
    ctx.lineWidth = 0.5 ** 6;
    ctx.beginPath()
    ctx.moveTo(0, -a);
    ctx.lineTo(0, a);
    ctx.stroke();

    ctx.restore();
  }

  drawPolarizingBeamSplitter(pbs: PolarizingBeamSplitter) {
    const { dsm: { direction } } = pbs;
    const a = Math.sqrt(0.5);

    const ctx = this.canvas.context;
    ctx.save()

    ctx.lineWidth = 0.5 ** 6;
    ctx.strokeStyle = this.colorpalette.accent;
    ctx.strokeRect(-0.5, -0.5, 1, 1);

    drawLabel(ctx, 'PBS', this.colorpalette.accent, direction.inner(new Vec2(1, 1)) === 0 ? -0.2 : 0.2)

    ctx.transform(direction.x, direction.y, -direction.y, direction.x, 0, 0);

    ctx.strokeStyle = this.colorpalette.accent;
    ctx.lineWidth = 0.5 ** 5;
    ctx.beginPath()
    ctx.moveTo(0, -a);
    ctx.lineTo(0, a);
    ctx.stroke();

    ctx.setLineDash([0.1, 0.1]);
    ctx.lineDashOffset = -(Math.sqrt(2) - 1.3)/2
    ctx.lineWidth = 0.5 ** 6;
    ctx.strokeStyle = this.colorpalette.board;
    ctx.beginPath()
    ctx.moveTo(0, -a);
    ctx.lineTo(0, a);
    ctx.stroke();
    // TODO: draw text PBS

    ctx.restore();

  }
}

const fontFamily = `'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'BIZ UDPGothic', 'Noto Sans JP', Robot, sans-serif, system-ui`

function drawLabel(ctx: CanvasRenderingContext2D, text: string, color: string, x: number) {
  ctx.save();
  ctx.translate(x, 0.45);
  ctx.scale(0.25, 0.25);

  ctx.font = '1px' + fontFamily;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(text, 0, 0);

  ctx.restore();
}

function drawCount(ctx: CanvasRenderingContext2D, count: number, color: string) {
  ctx.save();
  ctx.translate(0.75, 0.5);
  ctx.scale(0.4, 0.4);

  ctx.font = '1px' + fontFamily;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(count === Infinity ? '∞' : count.toString(), 0, 0);

  ctx.restore();
}
