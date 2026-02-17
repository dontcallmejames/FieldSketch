// SiteSketch - Circle/Ellipse Object

import { DrawObject } from './DrawObject.js';
import { distance } from '../utils/math.js';

export class Circle extends DrawObject {
    constructor(props = {}) {
        super('circle', props);
        this.cx = props.cx || 0;
        this.cy = props.cy || 0;
        this.rx = props.rx || 0; // x-radius (for ellipse support)
        this.ry = props.ry || 0; // y-radius
    }

    draw(ctx) {
        this.applyStyle(ctx);
        ctx.beginPath();
        ctx.ellipse(this.cx, this.cy, Math.abs(this.rx), Math.abs(this.ry), 0, 0, Math.PI * 2);
        if (this.fillColor) ctx.fill();
        ctx.stroke();
        this.resetStyle(ctx);
    }

    hitTest(wx, wy) {
        const tolerance = Math.max(this.strokeWidth / 2 + 4, 6);
        const rx = Math.abs(this.rx);
        const ry = Math.abs(this.ry);
        if (rx === 0 || ry === 0) return false;

        // Normalized distance from center
        const dx = (wx - this.cx) / rx;
        const dy = (wy - this.cy) / ry;
        const d = Math.sqrt(dx * dx + dy * dy);

        if (this.fillColor) {
            // Inside the ellipse
            return d <= 1 + tolerance / Math.min(rx, ry);
        }

        // On the edge
        return Math.abs(d - 1) <= tolerance / Math.min(rx, ry);
    }

    getBounds() {
        const rx = Math.abs(this.rx);
        const ry = Math.abs(this.ry);
        return {
            x: this.cx - rx,
            y: this.cy - ry,
            w: rx * 2,
            h: ry * 2
        };
    }

    translate(dx, dy) {
        this.cx += dx;
        this.cy += dy;
    }

    toJSON() {
        return { ...super.toJSON(), cx: this.cx, cy: this.cy, rx: this.rx, ry: this.ry };
    }

    static fromJSON(data) {
        const obj = new Circle(data);
        obj.fromJSON(data);
        return obj;
    }
}
