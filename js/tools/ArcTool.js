// SiteSketch - Arc Tool (3-point arc: center, start, end)

import { Tool } from './Tool.js';
import { Arc } from '../objects/Arc.js';
import { AddObjectCommand } from '../core/History.js';
import { distance, angle } from '../utils/math.js';

export class ArcTool extends Tool {
    constructor(app) {
        super('arc', app);
        this.step = 0; // 0: waiting, 1: center placed, 2: radius set
        this.cx = 0;
        this.cy = 0;
        this.radius = 0;
        this.startAngle = 0;
        this.endAngle = 0;
    }

    activate() {
        this.step = 0;
        this.app.setStatus('Click to set arc center');
    }

    deactivate() {
        this.step = 0;
        this.preview = false;
    }

    onPointerDown(x, y) {
        if (this.step === 0) {
            this.cx = x;
            this.cy = y;
            this.step = 1;
            this.preview = true;
            this.app.setStatus('Click to set radius and start angle');
        } else if (this.step === 1) {
            this.radius = distance(x, y, this.cx, this.cy);
            this.startAngle = angle(this.cx, this.cy, x, y);
            this.endAngle = this.startAngle;
            this.step = 2;
            this.app.setStatus('Click to set end angle');
        } else if (this.step === 2) {
            this.endAngle = angle(this.cx, this.cy, x, y);
            this.createArc();
            this.step = 0;
            this.preview = false;
            this.app.setStatus('');
        }
    }

    onPointerMove(x, y) {
        if (this.step === 1) {
            this.radius = distance(x, y, this.cx, this.cy);
            this.startAngle = angle(this.cx, this.cy, x, y);
            this.endAngle = this.startAngle + Math.PI / 2;
            this.app.requestRender();
        } else if (this.step === 2) {
            this.endAngle = angle(this.cx, this.cy, x, y);
            this.app.requestRender();
        }
    }

    createArc() {
        if (this.radius < 2) return;

        const arc = new Arc({
            cx: this.cx, cy: this.cy,
            radius: this.radius,
            startAngle: this.startAngle,
            endAngle: this.endAngle,
            ...this.getStyle()
        });

        this.app.history.execute(
            new AddObjectCommand(this.app, this.app.activeLayer, arc)
        );
    }

    drawPreview(ctx) {
        if (this.step === 0) return;
        ctx.strokeStyle = this.app.strokeColor;
        ctx.lineWidth = this.app.strokeWidth;
        ctx.globalAlpha = 0.6;
        ctx.setLineDash([4, 4]);

        if (this.radius > 0) {
            ctx.beginPath();
            ctx.arc(this.cx, this.cy, this.radius, this.startAngle, this.endAngle);
            ctx.stroke();
        }

        // Center marker
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = this.app.strokeColor;
        ctx.fill();

        ctx.globalAlpha = 1;
    }
}
