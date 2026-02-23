// FieldSketch - Text Label Object

import { DrawObject } from './DrawObject.js';
import { pointInRect } from '../utils/math.js';

export class TextLabel extends DrawObject {
    constructor(props = {}) {
        super('text', props);
        this.x = props.x || 0;
        this.y = props.y || 0;
        this.text = props.text || 'Text';
        this.fontSize = props.fontSize || 14;
        this.fontFamily = props.fontFamily || 'sans-serif';
        this.fontWeight = props.fontWeight || 'normal';
        this.textAlign = props.textAlign || 'left';
        this._cachedBounds = null;
    }

    draw(ctx) {
        ctx.save();
        ctx.font = `${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;
        ctx.fillStyle = this.strokeColor;
        ctx.globalAlpha = this.opacity;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = 'top';

        const lines = this.text.split('\n');
        const lineHeight = this.fontSize * 1.3;
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], this.x, this.y + i * lineHeight);
        }

        // Cache bounds for hit testing
        const maxWidth = Math.max(...lines.map(l => ctx.measureText(l).width));
        this._cachedBounds = {
            x: this.textAlign === 'center' ? this.x - maxWidth / 2 :
               this.textAlign === 'right' ? this.x - maxWidth : this.x,
            y: this.y,
            w: maxWidth,
            h: lines.length * lineHeight
        };

        ctx.restore();
    }

    hitTest(wx, wy) {
        if (!this._cachedBounds) return false;
        const b = this._cachedBounds;
        return pointInRect(wx, wy, b.x - 4, b.y - 4, b.w + 8, b.h + 8);
    }

    getBounds() {
        return this._cachedBounds || { x: this.x, y: this.y, w: 50, h: this.fontSize * 1.3 };
    }

    translate(dx, dy) {
        this.x += dx;
        this.y += dy;
        if (this._cachedBounds) {
            this._cachedBounds.x += dx;
            this._cachedBounds.y += dy;
        }
    }

    toJSON() {
        return {
            ...super.toJSON(),
            x: this.x, y: this.y,
            text: this.text,
            fontSize: this.fontSize,
            fontFamily: this.fontFamily,
            fontWeight: this.fontWeight,
            textAlign: this.textAlign
        };
    }

    static fromJSON(data) {
        const obj = new TextLabel(data);
        obj.fromJSON(data);
        return obj;
    }
}
