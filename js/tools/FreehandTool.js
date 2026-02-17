// SiteSketch - Freehand Tool

import { Tool } from './Tool.js';
import { Freehand } from '../objects/Freehand.js';
import { AddObjectCommand } from '../core/History.js';

export class FreehandTool extends Tool {
    constructor(app) {
        super('freehand', app);
        this.points = [];
    }

    onPointerDown(x, y) {
        this.isDrawing = true;
        this.preview = true;
        this.points = [{ x, y }];
    }

    onPointerMove(x, y) {
        if (!this.isDrawing) return;
        this.points.push({ x, y });
        this.app.requestRender();
    }

    onPointerUp(x, y) {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        this.preview = false;

        if (this.points.length < 2) return;

        const freehand = new Freehand({
            points: [...this.points],
            ...this.getStyle()
        });
        freehand.simplify(1.5); // Reduce point count

        this.app.history.execute(
            new AddObjectCommand(this.app, this.app.activeLayer, freehand)
        );

        this.points = [];
    }

    drawPreview(ctx) {
        if (this.points.length < 2) return;
        ctx.strokeStyle = this.app.strokeColor;
        ctx.lineWidth = this.app.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.stroke();
    }
}
