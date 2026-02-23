// FieldSketch - Base DrawObject Class

import { uid } from '../utils/math.js';

export class DrawObject {
    constructor(type, props = {}) {
        this.id = props.id || uid();
        this.type = type;
        this.strokeColor = props.strokeColor || '#000000';
        this.strokeWidth = props.strokeWidth || 2;
        this.strokeStyle = props.strokeStyle || 'solid'; // solid, dashed, dotted
        this.fillColor = props.fillColor || null;
        this.opacity = props.opacity ?? 1;
        this.locked = false;
    }

    // Apply stroke style to canvas context
    applyStyle(ctx) {
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.strokeWidth;
        ctx.globalAlpha = this.opacity;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (this.strokeStyle === 'dashed') {
            ctx.setLineDash([this.strokeWidth * 4, this.strokeWidth * 3]);
        } else if (this.strokeStyle === 'dotted') {
            ctx.setLineDash([this.strokeWidth, this.strokeWidth * 2]);
        } else {
            ctx.setLineDash([]);
        }

        if (this.fillColor) {
            ctx.fillStyle = this.fillColor;
        }
    }

    resetStyle(ctx) {
        ctx.globalAlpha = 1;
        ctx.setLineDash([]);
    }

    // Override in subclasses
    draw(ctx, app) {}
    hitTest(wx, wy, app) { return false; }
    getBounds() { return null; }
    translate(dx, dy) {}

    toJSON() {
        return {
            id: this.id,
            type: this.type,
            strokeColor: this.strokeColor,
            strokeWidth: this.strokeWidth,
            strokeStyle: this.strokeStyle,
            fillColor: this.fillColor,
            opacity: this.opacity,
            locked: this.locked
        };
    }

    fromJSON(data) {
        this.id = data.id;
        this.strokeColor = data.strokeColor;
        this.strokeWidth = data.strokeWidth;
        this.strokeStyle = data.strokeStyle;
        this.fillColor = data.fillColor;
        this.opacity = data.opacity;
        this.locked = data.locked ?? false;
    }

    // Clone base properties to another object
    copyStyleTo(other) {
        other.strokeColor = this.strokeColor;
        other.strokeWidth = this.strokeWidth;
        other.strokeStyle = this.strokeStyle;
        other.fillColor = this.fillColor;
        other.opacity = this.opacity;
    }
}
