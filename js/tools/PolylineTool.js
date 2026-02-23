// FieldSketch - Polyline/Polygon Tool

import { Tool } from './Tool.js';
import { Polyline } from '../objects/Polyline.js';
import { AddObjectCommand } from '../core/History.js';
import { distance } from '../utils/math.js';

export class PolylineTool extends Tool {
    constructor(app) {
        super('polyline', app);
        this.points = [];
        this.currentX = 0;
        this.currentY = 0;
    }

    activate() {
        this.points = [];
        this.app.setStatus('Click to add points. Double-click or press Enter to finish. Press Escape to cancel.');
        this._keyHandler = (e) => {
            if (e.key === 'Enter') this.finish(false);
            if (e.key === 'Escape') this.cancel();
            if (e.key === 'c' || e.key === 'C') this.finish(true); // Close polygon
        };
        document.addEventListener('keydown', this._keyHandler);
    }

    deactivate() {
        this.points = [];
        this.preview = false;
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            this._keyHandler = null;
        }
    }

    onPointerDown(x, y) {
        // Double-click detection: if close to first point, close polygon
        if (this.points.length >= 3) {
            if (distance(x, y, this.points[0].x, this.points[0].y) < 10) {
                this.finish(true);
                return;
            }
        }

        // Double-click detection: if close to last point, finish
        if (this.points.length >= 2) {
            const last = this.points[this.points.length - 1];
            if (distance(x, y, last.x, last.y) < 3) {
                this.finish(false);
                return;
            }
        }

        this.points.push({ x, y });
        this.currentX = x;
        this.currentY = y;
        this.preview = true;
        this.app.requestRender();
    }

    onPointerMove(x, y) {
        this.currentX = x;
        this.currentY = y;
        if (this.points.length > 0) {
            this.app.requestRender();
        }
    }

    finish(closed) {
        if (this.points.length < 2) {
            this.cancel();
            return;
        }

        const poly = new Polyline({
            points: [...this.points],
            closed,
            ...this.getStyle()
        });

        this.app.history.execute(
            new AddObjectCommand(this.app, this.app.activeLayer, poly)
        );

        this.points = [];
        this.preview = false;
        this.app.requestRender();
    }

    cancel() {
        this.points = [];
        this.preview = false;
        this.app.requestRender();
    }

    drawPreview(ctx) {
        if (this.points.length === 0) return;
        ctx.strokeStyle = this.app.strokeColor;
        ctx.lineWidth = this.app.strokeWidth;
        ctx.globalAlpha = 0.6;
        ctx.setLineDash([4, 4]);

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.lineTo(this.currentX, this.currentY);
        ctx.stroke();

        // Draw vertices
        ctx.setLineDash([]);
        ctx.fillStyle = this.app.strokeColor;
        for (const p of this.points) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;
    }
}
