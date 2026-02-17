// SiteSketch - Dimension Object

import { DrawObject } from './DrawObject.js';
import { distance, angle, pointToLineDistance, formatNumber } from '../utils/math.js';

export class Dimension extends DrawObject {
    constructor(props = {}) {
        super('dimension', props);
        this.x1 = props.x1 || 0;
        this.y1 = props.y1 || 0;
        this.x2 = props.x2 || 0;
        this.y2 = props.y2 || 0;
        this.offset = props.offset || 20; // offset of dimension line from measured line
        this.fontSize = props.fontSize || 12;
        this.unit = props.unit || '';
        this.scale = props.scale || 1; // world units per real-world unit
        this.textOverride = props.textOverride || null;
        this.strokeColor = props.strokeColor || '#0066cc';
        this.strokeWidth = props.strokeWidth || 1;
    }

    getMeasurement() {
        if (this.textOverride) return this.textOverride;
        const d = distance(this.x1, this.y1, this.x2, this.y2);
        const realDist = d * this.scale;
        return formatNumber(realDist) + (this.unit ? ' ' + this.unit : '');
    }

    draw(ctx) {
        const dx = this.x2 - this.x1;
        const dy = this.y2 - this.y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1) return;

        // Normal vector (perpendicular to the line)
        const nx = -dy / len;
        const ny = dx / len;

        // Offset points
        const ox1 = this.x1 + nx * this.offset;
        const oy1 = this.y1 + ny * this.offset;
        const ox2 = this.x2 + nx * this.offset;
        const oy2 = this.y2 + ny * this.offset;

        // Extension line overshoot
        const ext = 5;
        const extDir = this.offset > 0 ? 1 : -1;

        this.applyStyle(ctx);
        ctx.beginPath();

        // Extension lines
        ctx.moveTo(this.x1 + nx * ext * -extDir, this.y1 + ny * ext * -extDir);
        ctx.lineTo(ox1 + nx * ext * extDir, oy1 + ny * ext * extDir);
        ctx.moveTo(this.x2 + nx * ext * -extDir, this.y2 + ny * ext * -extDir);
        ctx.lineTo(ox2 + nx * ext * extDir, oy2 + ny * ext * extDir);

        // Dimension line
        ctx.moveTo(ox1, oy1);
        ctx.lineTo(ox2, oy2);

        ctx.stroke();

        // Arrowheads
        const arrowLen = 8;
        const arrowAngle = Math.PI / 6;
        const lineAngle = angle(ox1, oy1, ox2, oy2);

        ctx.beginPath();
        ctx.moveTo(ox1, oy1);
        ctx.lineTo(
            ox1 + arrowLen * Math.cos(lineAngle + arrowAngle),
            oy1 + arrowLen * Math.sin(lineAngle + arrowAngle)
        );
        ctx.moveTo(ox1, oy1);
        ctx.lineTo(
            ox1 + arrowLen * Math.cos(lineAngle - arrowAngle),
            oy1 + arrowLen * Math.sin(lineAngle - arrowAngle)
        );
        ctx.moveTo(ox2, oy2);
        ctx.lineTo(
            ox2 - arrowLen * Math.cos(lineAngle + arrowAngle),
            oy2 - arrowLen * Math.sin(lineAngle + arrowAngle)
        );
        ctx.moveTo(ox2, oy2);
        ctx.lineTo(
            ox2 - arrowLen * Math.cos(lineAngle - arrowAngle),
            oy2 - arrowLen * Math.sin(lineAngle - arrowAngle)
        );
        ctx.stroke();

        // Text
        const text = this.getMeasurement();
        const midX = (ox1 + ox2) / 2;
        const midY = (oy1 + oy2) / 2;
        const textAngle = lineAngle;

        ctx.save();
        ctx.translate(midX, midY);
        let rotAngle = textAngle;
        // Keep text readable (not upside down)
        if (rotAngle > Math.PI / 2 || rotAngle < -Math.PI / 2) {
            rotAngle += Math.PI;
        }
        ctx.rotate(rotAngle);

        ctx.font = `${this.fontSize}px sans-serif`;
        ctx.fillStyle = this.strokeColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        // Background for text
        const textWidth = ctx.measureText(text).width;
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(-textWidth / 2 - 3, -this.fontSize - 2, textWidth + 6, this.fontSize + 4);

        ctx.fillStyle = this.strokeColor;
        ctx.fillText(text, 0, -2);

        ctx.restore();
        this.resetStyle(ctx);
    }

    hitTest(wx, wy) {
        const tolerance = 8;
        const dx = this.x2 - this.x1;
        const dy = this.y2 - this.y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1) return false;

        const nx = -dy / len;
        const ny = dx / len;
        const ox1 = this.x1 + nx * this.offset;
        const oy1 = this.y1 + ny * this.offset;
        const ox2 = this.x2 + nx * this.offset;
        const oy2 = this.y2 + ny * this.offset;

        return pointToLineDistance(wx, wy, ox1, oy1, ox2, oy2) <= tolerance ||
               pointToLineDistance(wx, wy, this.x1, this.y1, ox1, oy1) <= tolerance ||
               pointToLineDistance(wx, wy, this.x2, this.y2, ox2, oy2) <= tolerance;
    }

    getBounds() {
        const dx = this.x2 - this.x1;
        const dy = this.y2 - this.y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1) return { x: this.x1, y: this.y1, w: 1, h: 1 };

        const nx = -dy / len;
        const ny = dx / len;
        const points = [
            { x: this.x1, y: this.y1 },
            { x: this.x2, y: this.y2 },
            { x: this.x1 + nx * this.offset, y: this.y1 + ny * this.offset },
            { x: this.x2 + nx * this.offset, y: this.y2 + ny * this.offset }
        ];

        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        return {
            x: minX, y: minY,
            w: Math.max(...xs) - minX,
            h: Math.max(...ys) - minY
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
            offset: this.offset, fontSize: this.fontSize,
            unit: this.unit, scale: this.scale, textOverride: this.textOverride
        };
    }

    static fromJSON(data) {
        const obj = new Dimension(data);
        obj.fromJSON(data);
        return obj;
    }
}
