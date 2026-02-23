// FieldSketch - Polyline/Polygon Object

import { DrawObject } from './DrawObject.js';
import { pointToLineDistance, boundingBox } from '../utils/math.js';

export class Polyline extends DrawObject {
    constructor(props = {}) {
        super('polyline', props);
        this.points = props.points || []; // [{ x, y }, ...]
        this.closed = props.closed || false;
    }

    draw(ctx) {
        if (this.points.length < 2) return;
        this.applyStyle(ctx);
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        if (this.closed) ctx.closePath();
        if (this.fillColor && this.closed) ctx.fill();
        ctx.stroke();
        this.resetStyle(ctx);
    }

    hitTest(wx, wy) {
        const tolerance = Math.max(this.strokeWidth / 2 + 4, 6);
        const pts = this.points;
        const len = this.closed ? pts.length : pts.length - 1;
        for (let i = 0; i < len; i++) {
            const j = (i + 1) % pts.length;
            if (pointToLineDistance(wx, wy, pts[i].x, pts[i].y, pts[j].x, pts[j].y) <= tolerance) {
                return true;
            }
        }

        // If filled and closed, check if point is inside
        if (this.fillColor && this.closed) {
            return this.pointInPolygon(wx, wy);
        }

        return false;
    }

    pointInPolygon(px, py) {
        let inside = false;
        const pts = this.points;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
            const xi = pts[i].x, yi = pts[i].y;
            const xj = pts[j].x, yj = pts[j].y;
            if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) {
                inside = !inside;
            }
        }
        return inside;
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

    toJSON() {
        return {
            ...super.toJSON(),
            points: this.points.map(p => ({ x: p.x, y: p.y })),
            closed: this.closed
        };
    }

    static fromJSON(data) {
        const obj = new Polyline(data);
        obj.fromJSON(data);
        return obj;
    }
}
