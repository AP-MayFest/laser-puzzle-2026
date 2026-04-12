export class Vec2 {
    readonly x: number;
    readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    inner(rhs: Vec2): number {
        return this.x * rhs.x + this.y * rhs.y;
    }

    outer(rhs: Vec2): number {
        return this.x * rhs.y - this.y * rhs.x;
    }

    l2(): number {
        return Math.sqrt(this.inner(this));
    }

    scale(a: number): Vec2 {
        return new Vec2(a * this.x, a * this.y);
    }

    add(rhs: Vec2): Vec2 {
        return new Vec2(this.x + rhs.x, this.y + rhs.y);
    }

    sub(rhs: Vec2): Vec2 {
        return new Vec2(this.x - rhs.x, this.y - rhs.y);
    }

    projectTo(v: Vec2): Vec2 {
        return v.scale(this.inner(v) / v.inner(v));
    }

    normalize(): NormalizedVec2 {
        return new NormalizedVec2(this.x, this.y);
    }

    isZero(): boolean {
        return this.x === 0 && this.y === 0;
    }

    equals(rhs: Vec2): boolean {
        return this.x === rhs.x && this.y === rhs.y;
    }

    equalsApprox(rhs: Vec2, epsilon = 1e-9): boolean {
        return approxEquals(this.x, rhs.x, epsilon) && approxEquals(this.y, rhs.y, epsilon);
    }

    rotateWith(basis: NormalizedVec2): Vec2 {
        return new Vec2(this.x * basis.x - this.y * basis.y, this.x * basis.y + this.y * basis.x);
    }

    rotate(radian: number): Vec2 {
        return this.rotateWith(new NormalizedVec2(Math.cos(radian), Math.sin(radian)));
    }

    round(): Vec2 {
        return new Vec2(Math.round(this.x), Math.round(this.y));
    }
}

export function approxEquals(lhs: number, rhs: number, epsilon = 1e-9): boolean {
    return Math.abs(lhs - rhs) <= epsilon;
}

export class NormalizedVec2 extends Vec2 {
    constructor(x: number, y: number) {
        const d = Math.sqrt(x * x + y * y);
        super(x / d, y / d);
    }

    rotateWith(basis: NormalizedVec2): NormalizedVec2 {
        return new NormalizedVec2(this.x * basis.x - this.y * basis.y, this.x * basis.y + this.y * basis.x);
    }

    rotate(radian: number): NormalizedVec2 {
        return this.rotateWith(new NormalizedVec2(Math.cos(radian), Math.sin(radian)));
    }
}
