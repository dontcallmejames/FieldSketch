// FieldSketch - Arrow Object

import { DrawObject } from './DrawObject.js';
import { pointToLineDistance, angle } from '../utils/math.js';

export class Arrow extends DrawObject {
    constructor(props = {}) {
        super('arrow', props);
        this.x1 = props.x1 || 0;
        this.y1 = props.y1 || 0;
        this.x2 = props.x2 || 0;
        this.y2 = props.y2 || 0;
        this.headSize = props.headSize || 12;
        this.doubleHead = props.doubleHead || false;
    }

    draw(ctx) {
        this.applyStyle(ctx);
        const a = angle(this.x1, this.y1, this.x2, this.y2);
        const headAngle = Math.PI / 6;
        const hs = this.headSize;

        // Shaft
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();

        // Head at end
        ctx.beginPath();
        ctx.moveTo(this.x2, this.y2);
        ctx.lineTo(
            this.x2 - hs * Math.cos(a - headAngle),
            this.y2 - hs * Math.sin(a - headAngle)
        );
        ctx.moveTo(this.x2, this.y2);
        ctx.lineTo(
            this.x2 - hs * Math.cos(a + headAngle),
            this.y2 - hs * Math.sin(a + headAngle)
        );
        ctx.stroke();

        // Optional head at start
        if (this.doubleHead) {
            const aRev = a + Math.PI;
            ctx.beginPath();
            ctx.moveTo(this.x1, this.y1);
            ctx.lineTo(
                this.x1 - hs * Math.cos(aRev - headAngle),
                this.y1 - hs * Math.sin(aRev - headAngle)
            );
            ctx.moveTo(this.x1, this.y1);
            ctx.lineTo(
                this.x1 - hs * Math.cos(aRev + headAngle),
                this.y1 - hs * Math.sin(aRev + headAngle)
            );
            ctx.stroke();
        }

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
        return {
            ...super.toJSON(),
            x1: this.x1, y1: this.y1, x2: this.x2, y2: this.y2,
            headSize: this.headSize, doubleHead: this.doubleHead
        };
    }

    static fromJSON(data) {
        const obj = new Arrow(data);
        obj.fromJSON(data);
        return obj;
    }
}
