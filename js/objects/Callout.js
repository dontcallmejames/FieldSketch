// FieldSketch - Callout Object (Box with leader line)

import { DrawObject } from './DrawObject.js';
import { pointInRect, pointToLineDistance } from '../utils/math.js';

export class Callout extends DrawObject {
    constructor(props = {}) {
        super('callout', props);
        // Leader line endpoint (the point being called out)
        this.leaderX = props.leaderX || 0;
        this.leaderY = props.leaderY || 0;
        // Box position
        this.boxX = props.boxX || 0;
        this.boxY = props.boxY || 0;
        this.text = props.text || 'Note';
        this.fontSize = props.fontSize || 12;
        this.padding = 8;
        this._cachedBox = null;
    }

    draw(ctx) {
        ctx.save();

        // Measure text to get box size
        ctx.font = `${this.fontSize}px sans-serif`;
        const lines = this.text.split('\n');
        const lineHeight = this.fontSize * 1.3;
        const maxWidth = Math.max(...lines.map(l => ctx.measureText(l).width), 40);
        const boxW = maxWidth + this.padding * 2;
        const boxH = lines.length * lineHeight + this.padding * 2;

        this._cachedBox = { x: this.boxX, y: this.boxY, w: boxW, h: boxH };

        // Draw leader line
        this.applyStyle(ctx);
        ctx.beginPath();
        ctx.moveTo(this.leaderX, this.leaderY);

        // Connect to nearest edge of box
        const boxCX = this.boxX + boxW / 2;
        const boxCY = this.boxY + boxH / 2;
        ctx.lineTo(boxCX, boxCY);
        ctx.stroke();

        // Draw leader dot
        ctx.beginPath();
        ctx.arc(this.leaderX, this.leaderY, 3, 0, Math.PI * 2);
        ctx.fillStyle = this.strokeColor;
        ctx.fill();

        // Draw box
        ctx.fillStyle = '#1a1a2e';
        ctx.globalAlpha = 0.9 * this.opacity;
        ctx.fillRect(this.boxX, this.boxY, boxW, boxH);
        ctx.globalAlpha = this.opacity;
        ctx.strokeRect(this.boxX, this.boxY, boxW, boxH);

        // Draw text
        ctx.fillStyle = this.strokeColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], this.boxX + this.padding, this.boxY + this.padding + i * lineHeight);
        }

        ctx.restore();
        this.resetStyle(ctx);
    }

    hitTest(wx, wy) {
        if (this._cachedBox && pointInRect(wx, wy,
            this._cachedBox.x - 4, this._cachedBox.y - 4,
            this._cachedBox.w + 8, this._cachedBox.h + 8)) {
            return true;
        }

        const boxCX = this._cachedBox ? this._cachedBox.x + this._cachedBox.w / 2 : this.boxX;
        const boxCY = this._cachedBox ? this._cachedBox.y + this._cachedBox.h / 2 : this.boxY;
        return pointToLineDistance(wx, wy, this.leaderX, this.leaderY, boxCX, boxCY) <= 6;
    }

    getBounds() {
        const box = this._cachedBox || { x: this.boxX, y: this.boxY, w: 60, h: 30 };
        const minX = Math.min(box.x, this.leaderX);
        const minY = Math.min(box.y, this.leaderY);
        const maxX = Math.max(box.x + box.w, this.leaderX);
        const maxY = Math.max(box.y + box.h, this.leaderY);
        return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }

    translate(dx, dy) {
        this.leaderX += dx; this.leaderY += dy;
        this.boxX += dx; this.boxY += dy;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            leaderX: this.leaderX, leaderY: this.leaderY,
            boxX: this.boxX, boxY: this.boxY,
            text: this.text, fontSize: this.fontSize
        };
    }

    static fromJSON(data) {
        const obj = new Callout(data);
        obj.fromJSON(data);
        return obj;
    }
}
