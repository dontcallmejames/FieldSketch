// FieldSketch - Line Tool

import { Tool } from './Tool.js';
import { Line } from '../objects/Line.js';
import { AddObjectCommand } from '../core/History.js';

export class LineTool extends Tool {
    constructor(app) {
        super('line', app);
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
    }

    onPointerDown(x, y) {
        this.isDrawing = true;
        this.preview = true;
        this.startX = x;
        this.startY = y;
        this.endX = x;
        this.endY = y;
    }

    onPointerMove(x, y) {
        if (!this.isDrawing) return;
        this.endX = x;
        this.endY = y;
        this.app.requestRender();
    }

    onPointerUp(x, y) {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        this.preview = false;
        this.endX = x;
        this.endY = y;

        // Only create if minimum size
        const dx = this.endX - this.startX;
        const dy = this.endY - this.startY;
        if (Math.sqrt(dx * dx + dy * dy) < 2) return;

        const line = new Line({
            x1: this.startX, y1: this.startY,
            x2: this.endX, y2: this.endY,
            ...this.getStyle()
        });

        this.app.history.execute(
            new AddObjectCommand(this.app, this.app.activeLayer, line)
        );
    }

    drawPreview(ctx) {
        if (!this.isDrawing) return;
        ctx.strokeStyle = this.app.strokeColor;
        ctx.lineWidth = this.app.strokeWidth;
        ctx.globalAlpha = 0.6;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(this.endX, this.endY);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.setLineDash([]);
    }
}
