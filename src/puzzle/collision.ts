import type {Vec2} from '../utils/vec.ts';

export interface Segment {
    p1: Vec2;
    p2: Vec2;
}

export function pathToSegment(corners: readonly Vec2[]): Segment[] {
    const n = corners.length;
    return corners.map((v, i) => ({ p1: v, p2: corners[(i + 1) % n] }));
}

export interface Ray {
    origin: Vec2;
    direction: Vec2;
}

export interface Collision {
    position: Vec2;
    distance: number
}

export function judgeCollision(ray: Ray, segment: Segment): Collision | undefined {
    const a = segment.p1.sub(ray.origin), b = segment.p2.sub(ray.origin);
    const seg = segment.p1.sub(segment.p2);

    const det = seg.outer(ray.direction);
    if (det === 0) return undefined;

    const t = a.outer(ray.direction) / det;
    if (t < 0 || 1 < t) return undefined;

    const distance = a.outer(b) / det;
    if (distance <= 0.1) return undefined; // この閾値が小さいと，ミラーでの反射光がもう一度同じミラーに衝突したりする
    const position = ray.origin.add(ray.direction.scale(distance));
    return { position, distance: position.sub(ray.origin).l2() };
}