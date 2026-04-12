type Matrix3Raw = [[number, number, number], [number, number, number], [number, number, number]]
export class Matrix3 {
    readonly values: Matrix3Raw;

    constructor(values: Matrix3Raw) {
        this.values = values;
    }

    mul(rhs: Matrix3): Matrix3 {
        const l = this.values, r = rhs.values;
        const values: Matrix3Raw = [[0,0,0],[0,0,0],[0,0,0]];
        for (let i = 0; i < 3; ++i) for (let k = 0; k < 3; ++k) for (let j = 0; j < 3; ++j) values[i][j] += l[i][k] * r[k][j];
        return new Matrix3(values);
    }
}

export class Transform {
    private mat: Matrix3;

    private constructor(mat: Matrix3) {
        this.mat = mat;
    }

    static fromAbcdef(a: number, b: number, c: number, d: number, e: number, f: number) {
        return new this(new Matrix3([
            [a, c, e],
            [b, d, f],
            [0, 0, 1],
        ]));
    }

    static noop(): Transform {
        const mat = new Matrix3([
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
        ]);
        return new Transform(mat);
    }

    static scale(sx: number, sy: number): Transform {
        const mat = new Matrix3([
            [sx, 0, 0],
            [ 0,sy, 0],
            [ 0, 0, 1],
        ]);
        return new Transform(mat);
    }

    static rotate(angle: number): Transform {
        const mat = new Matrix3([
            [Math.cos(angle),-Math.sin(angle), 0],
            [Math.sin(angle), Math.cos(angle), 0],
            [0, 0, 1],
        ]);
        return new Transform(mat);
    }

    static translate(dx: number, dy: number): Transform {
        const mat = new Matrix3([
            [1, 0, dx],
            [0, 1, dy],
            [0, 0, 1],
        ]);
        return new Transform(mat);
    }

    mul(rhs: Transform): Transform {
        return new Transform(this.mat.mul(rhs.mat));
    }

    scale(sx: number, sy: number): Transform {
        return this.mul(Transform.scale(sx, sy));
    }

    rotate(angle: number): Transform {
        return this.mul(Transform.rotate(angle));
    }

    translate(dx: number, dy: number):  Transform {
        return this.mul(Transform.translate(dx, dy));
    }

    abcdef(): [number, number, number, number, number, number] {
        const m = this.mat.values;
        return [m[0][0], m[1][0], m[0][1], m[1][1], m[0][2], m[1][2]];
    }

    apply(context: CanvasRenderingContext2D): Transform {
        context.setTransform(...this.abcdef());
        return this;
    }
}