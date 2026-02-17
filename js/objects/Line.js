// SiteSketch - Line Object

import { DrawObject } from './DrawObject.js';
import { pointToLineDistance } from '../utils/math.js';

export class Line extends DrawObject {
    constructor(props = {}) {
        super('line', props);
        this.x1 = props.x1 || 0;
        this.y1 = props.y1 || 0;
        this.x2 = props.x2 || 0;
        this.y2 = props.y2 || 0;
    }

    draw(ctx) {
        this.applyStyle(ctx);
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();
        this.resetStyle(ctx);
    }

    hitTest(wx, wy) {
        const tolerance = Math.max(this.strokeWidth / 2 + 4, 6);
        return pointToLineDistance(wx, wy, this.x1, this.y1, this.x2, this.y2) <= tolerance;
    }

    getBounds() {
        const x = Math.min(this.x1, this.x2);
        const y = Math.min(this.y1, this.y2);
        return {
            x, y,
            w: Math.max(Math.abs(this.x2 - this.x1), 1),
            h: Math.max(Math.abs(this.y2 - this.y1), 1)
        };
    }

    translate(dx, dy) {
        this.x1 += dx; this.y1 += dy;
        this.x2 += dx; this.y2 += dy;
    }

    toJSON() {
        return { ...super.toJSON(), x1: this.x1, y1: this.y1, x2: this.x2, y2: this.y2 };
    }

    static fromJSON(data) {
        const obj = new Line(data);
        obj.fromJSON(data);
        return obj;
    }
}
