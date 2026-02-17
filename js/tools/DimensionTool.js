// SiteSketch - Dimension Tool

import { Tool } from './Tool.js';
import { Dimension } from '../objects/Dimension.js';
import { AddObjectCommand } from '../core/History.js';
import { distance } from '../utils/math.js';

export class DimensionTool extends Tool {
    constructor(app) {
        super('dimension', app);
        this.step = 0;
        this.x1 = 0;
        this.y1 = 0;
        this.x2 = 0;
        this.y2 = 0;
    }

    activate() {
        this.step = 0;
        this.app.setStatus('Click first measurement point');
    }

    deactivate() {
        this.step = 0;
        this.preview = false;
    }

    onPointerDown(x, y) {
        if (this.step === 0) {
            this.x1 = x;
            this.y1 = y;
            this.x2 = x;
            this.y2 = y;
            this.step = 1;
            this.preview = true;
            this.app.setStatus('Click second measurement point');
        } else if (this.step === 1) {
            this.x2 = x;
            this.y2 = y;

            if (distance(this.x1, this.y1, this.x2, this.y2) < 2) {
                this.step = 0;
                this.preview = false;
                return;
            }

            const dim = new Dimension({
                x1: this.x1, y1: this.y1,
                x2: this.x2, y2: this.y2,
                offset: 25,
                unit: this.app.scaleUnit,
                scale: this.app.scaleValue,
                strokeColor: '#0066cc',
                strokeWidth: 1
            });

            this.app.history.execute(
                new AddObjectCommand(this.app, this.app.activeLayer, dim)
            );

            this.step = 0;
            this.preview = false;
            this.app.setStatus('Click first measurement point');
        }
    }

    onPointerMove(x, y) {
        if (this.step === 1) {
            this.x2 = x;
            this.y2 = y;
            this.app.requestRender();
        }
    }

    drawPreview(ctx) {
        if (this.step === 0) return;
        ctx.strokeStyle = '#0066cc';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.6;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();

        // Show distance
        const d = distance(this.x1, this.y1, this.x2, this.y2) * this.app.scaleValue;
        const midX = (this.x1 + this.x2) / 2;
        const midY = (this.y1 + this.y2) / 2;
        ctx.setLineDash([]);
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#0066cc';
        ctx.textAlign = 'center';
        ctx.fillText(`${d.toFixed(2)} ${this.app.scaleUnit}`, midX, midY - 8);

        ctx.globalAlpha = 1;
    }
}
