// SiteSketch - Rectangle Tool

import { Tool } from './Tool.js';
import { Rectangle } from '../objects/Rectangle.js';
import { AddObjectCommand } from '../core/History.js';

export class RectTool extends Tool {
    constructor(app) {
        super('rect', app);
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

        const w = this.endX - this.startX;
        const h = this.endY - this.startY;
        if (Math.abs(w) < 2 && Math.abs(h) < 2) return;

        const rect = new Rectangle({
            x: Math.min(this.startX, this.endX),
            y: Math.min(this.startY, this.endY),
            w: Math.abs(w),
            h: Math.abs(h),
            ...this.getStyle()
        });

        this.app.history.execute(
            new AddObjectCommand(this.app, this.app.activeLayer, rect)
        );
    }

    drawPreview(ctx) {
        if (!this.isDrawing) return;
        ctx.strokeStyle = this.app.strokeColor;
        ctx.lineWidth = this.app.strokeWidth;
        ctx.globalAlpha = 0.6;
        ctx.setLineDash([4, 4]);
        const x = Math.min(this.startX, this.endX);
        const y = Math.min(this.startY, this.endY);
        const w = Math.abs(this.endX - this.startX);
        const h = Math.abs(this.endY - this.startY);
        ctx.strokeRect(x, y, w, h);
        ctx.globalAlpha = 1;
        ctx.setLineDash([]);
    }
}
