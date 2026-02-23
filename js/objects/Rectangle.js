// FieldSketch - Rectangle Object

import { DrawObject } from './DrawObject.js';
import { pointInRect, pointToLineDistance } from '../utils/math.js';

export class Rectangle extends DrawObject {
    constructor(props = {}) {
        super('rect', props);
        this.x = props.x || 0;
        this.y = props.y || 0;
        this.w = props.w || 0;
        this.h = props.h || 0;
    }

    draw(ctx) {
        this.applyStyle(ctx);
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.w, this.h);
        if (this.fillColor) ctx.fill();
        ctx.stroke();
        this.resetStyle(ctx);
    }

    hitTest(wx, wy) {
        const tolerance = Math.max(this.strokeWidth / 2 + 4, 6);

        // If filled, test if point is inside
        if (this.fillColor) {
            return pointInRect(wx, wy, this.x - tolerance, this.y - tolerance,
                this.w + tolerance * 2, this.h + tolerance * 2);
        }

        // Otherwise test against edges
        const x2 = this.x + this.w;
        const y2 = this.y + this.h;
        return (
            pointToLineDistance(wx, wy, this.x, this.y, x2, this.y) <= tolerance ||
            pointToLineDistance(wx, wy, x2, this.y, x2, y2) <= tolerance ||
            pointToLineDistance(wx, wy, x2, y2, this.x, y2) <= tolerance ||
            pointToLineDistance(wx, wy, this.x, y2, this.x, this.y) <= tolerance
        );
    }

    getBounds() {
        const x = this.w >= 0 ? this.x : this.x + this.w;
        const y = this.h >= 0 ? this.y : this.y + this.h;
        return { x, y, w: Math.abs(this.w), h: Math.abs(this.h) };
    }

    translate(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    toJSON() {
        return { ...super.toJSON(), x: this.x, y: this.y, w: this.w, h: this.h };
    }

    static fromJSON(data) {
        const obj = new Rectangle(data);
        obj.fromJSON(data);
        return obj;
    }
}
