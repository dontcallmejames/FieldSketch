// SiteSketch - Arc Object

import { DrawObject } from './DrawObject.js';
import { distance, angle } from '../utils/math.js';

export class Arc extends DrawObject {
    constructor(props = {}) {
        super('arc', props);
        this.cx = props.cx || 0;
        this.cy = props.cy || 0;
        this.radius = props.radius || 0;
        this.startAngle = props.startAngle || 0;
        this.endAngle = props.endAngle || Math.PI / 2;
    }

    draw(ctx) {
        if (this.radius <= 0) return;
        this.applyStyle(ctx);
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, this.radius, this.startAngle, this.endAngle);
        ctx.stroke();
        this.resetStyle(ctx);
    }

    hitTest(wx, wy) {
        const tolerance = Math.max(this.strokeWidth / 2 + 4, 6);
        const d = distance(wx, wy, this.cx, this.cy);
        if (Math.abs(d - this.radius) > tolerance) return false;

        // Check if the angle of the point falls within the arc
        let a = angle(this.cx, this.cy, wx, wy);
        let start = this.startAngle;
        let end = this.endAngle;

        // Normalize angles
        while (a < start) a += Math.PI * 2;
        while (end < start) end += Math.PI * 2;

        return a <= end;
    }

    getBounds() {
        // Simplified bounding box
        const r = this.radius;
        return {
            x: this.cx - r,
            y: this.cy - r,
            w: r * 2,
            h: r * 2
        };
    }

    translate(dx, dy) {
        this.cx += dx;
        this.cy += dy;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            cx: this.cx, cy: this.cy,
            radius: this.radius,
            startAngle: this.startAngle,
            endAngle: this.endAngle
        };
    }

    static fromJSON(data) {
        const obj = new Arc(data);
        obj.fromJSON(data);
        return obj;
    }
}
