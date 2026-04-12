
export class Canvas {
  #element: HTMLCanvasElement;
  #context: CanvasRenderingContext2D;
  #width: number;
  #height: number;
  #pixelRatio: number;
  #resizeObserver: ResizeObserver;
  onresize?: () => void;
  
  constructor(id: string) {
    const element = document.querySelector('canvas#' + id) as HTMLCanvasElement | null;
    if (element == null) throw new Error('cannot get canvas#' + id);
    const context = element.getContext('2d');
    if (context == null) throw new Error('cannot get 2d context of canvas#' + id);

    const rect = element.getBoundingClientRect();

    this.#element = element;
    this.#context = context;
    this.#width = rect.width;
    this.#height = rect.height;
    this.#pixelRatio = 1;
    // this.resize(rect.width, rect.height);

    this.#resizeObserver = new ResizeObserver(([entry]) => {
      if (entry != null) {
        this.resize(entry.contentRect.width, entry.contentRect.height);
      }
      this.onresize?.();
    });
    this.#resizeObserver.observe(element);
  }

  dispose() {
    this.#resizeObserver.disconnect();
  }

  resize(width: number, height: number) {
    const pixelRatio = window.devicePixelRatio || 1;

    this.#width = width;
    this.#height = height;
    this.#pixelRatio = pixelRatio;

    this.#element.width = Math.max(1, Math.ceil(width * pixelRatio));
    this.#element.height = Math.max(1, Math.ceil(height * pixelRatio));
  }

  get context(): CanvasRenderingContext2D {
    return this.#context;
  }

  get element(): HTMLCanvasElement {
    return this.#element;
  }

  get width(): number {
    return this.#width;
  }

  get height(): number {
    return this.#height;
  }

  get pixelRatio(): number {
    return this.#pixelRatio;
  }
}
