// FieldSketch - Freehand Stroke Object

import { DrawObject } from './DrawObject.js';
import { pointToLineDistance, boundingBox, simplifyPath } from '../utils/math.js';

export class Freehand extends DrawObject {
    constructor(props = {}) {
        super('freehand', props);
        this.points = props.points || []; // [{ x, y }, ...]
    }

    draw(ctx) {
        if (this.points.length < 2) return;
        this.applyStyle(ctx);
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.stroke();
        this.resetStyle(ctx);
    }

    hitTest(wx, wy) {
        const tolerance = Math.max(this.strokeWidth / 2 + 4, 6);
        for (let i = 0; i < this.points.length - 1; i++) {
            if (pointToLineDistance(wx, wy,
                this.points[i].x, this.points[i].y,
                this.points[i + 1].x, this.points[i + 1].y) <= tolerance) {
                return true;
            }
        }
        return false;
    }

    getBounds() {
        if (this.points.length === 0) return null;
        return boundingBox(this.points);
    }

    translate(dx, dy) {
        for (const p of this.points) {
            p.x += dx;
            p.y += dy;
        }
    }

    simplify(tolerance = 1) {
        this.points = simplifyPath(this.points, tolerance);
    }

    toJSON() {
        return {
            ...super.toJSON(),
            points: this.points.map(p => ({ x: p.x, y: p.y }))
        };
    }

    static fromJSON(data) {
        const obj = new Freehand(data);
        obj.fromJSON(data);
        return obj;
    }
}
