// FieldSketch - Arrow Tool

import { Tool } from './Tool.js';
import { Arrow } from '../objects/Arrow.js';
import { AddObjectCommand } from '../core/History.js';
import { distance, angle } from '../utils/math.js';

export class ArrowTool extends Tool {
    constructor(app) {
        super('arrow', app);
        this.x1 = 0;
        this.y1 = 0;
        this.x2 = 0;
        this.y2 = 0;
    }

    onPointerDown(x, y) {
        this.isDrawing = true;
        this.preview = true;
        this.x1 = x;
        this.y1 = y;
        this.x2 = x;
        this.y2 = y;
    }

    onPointerMove(x, y) {
        if (!this.isDrawing) return;
        this.x2 = x;
        this.y2 = y;
        this.app.requestRender();
    }

    onPointerUp(x, y) {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        this.preview = false;
        this.x2 = x;
        this.y2 = y;

        if (distance(this.x1, this.y1, this.x2, this.y2) < 3) return;

        const arrow = new Arrow({
            x1: this.x1, y1: this.y1,
            x2: this.x2, y2: this.y2,
            ...this.getStyle()
        });

        this.app.history.execute(
            new AddObjectCommand(this.app, this.app.activeLayer, arrow)
        );
    }

    drawPreview(ctx) {
        if (!this.isDrawing) return;
        const a = angle(this.x1, this.y1, this.x2, this.y2);
        const headAngle = Math.PI / 6;
        const hs = 12;

        ctx.strokeStyle = this.app.strokeColor;
        ctx.lineWidth = this.app.strokeWidth;
        ctx.globalAlpha = 0.6;

        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();

        // Arrowhead
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

        ctx.globalAlpha = 1;
    }
}
