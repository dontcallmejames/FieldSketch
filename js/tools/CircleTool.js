// FieldSketch - Circle Tool

import { Tool } from './Tool.js';
import { Circle } from '../objects/Circle.js';
import { AddObjectCommand } from '../core/History.js';

export class CircleTool extends Tool {
    constructor(app) {
        super('circle', app);
        this.cx = 0;
        this.cy = 0;
        this.rx = 0;
        this.ry = 0;
    }

    onPointerDown(x, y) {
        this.isDrawing = true;
        this.preview = true;
        this.cx = x;
        this.cy = y;
        this.rx = 0;
        this.ry = 0;
    }

    onPointerMove(x, y) {
        if (!this.isDrawing) return;
        this.rx = Math.abs(x - this.cx);
        this.ry = Math.abs(y - this.cy);
        this.app.requestRender();
    }

    onPointerUp(x, y) {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        this.preview = false;
        this.rx = Math.abs(x - this.cx);
        this.ry = Math.abs(y - this.cy);

        if (this.rx < 2 && this.ry < 2) return;

        const circle = new Circle({
            cx: this.cx, cy: this.cy,
            rx: this.rx, ry: this.ry,
            ...this.getStyle()
        });

        this.app.history.execute(
            new AddObjectCommand(this.app, this.app.activeLayer, circle)
        );
    }

    drawPreview(ctx) {
        if (!this.isDrawing) return;
        ctx.strokeStyle = this.app.strokeColor;
        ctx.lineWidth = this.app.strokeWidth;
        ctx.globalAlpha = 0.6;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.ellipse(this.cx, this.cy, Math.max(this.rx, 0.1), Math.max(this.ry, 0.1), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.setLineDash([]);
    }
}
