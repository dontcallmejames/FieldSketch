// SiteSketch - Callout Tool

import { Tool } from './Tool.js';
import { Callout } from '../objects/Callout.js';
import { AddObjectCommand } from '../core/History.js';

export class CalloutTool extends Tool {
    constructor(app) {
        super('callout', app);
        this.step = 0;
        this.leaderX = 0;
        this.leaderY = 0;
        this.boxX = 0;
        this.boxY = 0;
    }

    activate() {
        this.step = 0;
        this.app.setStatus('Click on the point to annotate');
    }

    deactivate() {
        this.step = 0;
        this.preview = false;
    }

    onPointerDown(x, y) {
        if (this.step === 0) {
            this.leaderX = x;
            this.leaderY = y;
            this.boxX = x + 60;
            this.boxY = y - 40;
            this.step = 1;
            this.preview = true;
            this.app.setStatus('Click to place the callout box');
        } else if (this.step === 1) {
            this.boxX = x;
            this.boxY = y;

            const text = prompt('Enter callout text:', 'Note');
            if (!text) {
                this.step = 0;
                this.preview = false;
                return;
            }

            const callout = new Callout({
                leaderX: this.leaderX,
                leaderY: this.leaderY,
                boxX: this.boxX,
                boxY: this.boxY,
                text,
                ...this.getStyle()
            });

            this.app.history.execute(
                new AddObjectCommand(this.app, this.app.activeLayer, callout)
            );

            this.step = 0;
            this.preview = false;
            this.app.setStatus('Click on the point to annotate');
        }
    }

    onPointerMove(x, y) {
        if (this.step === 1) {
            this.boxX = x;
            this.boxY = y;
            this.app.requestRender();
        }
    }

    drawPreview(ctx) {
        if (this.step === 0) return;
        ctx.strokeStyle = this.app.strokeColor;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        ctx.setLineDash([4, 4]);

        // Leader line
        ctx.beginPath();
        ctx.moveTo(this.leaderX, this.leaderY);
        ctx.lineTo(this.boxX + 30, this.boxY + 15);
        ctx.stroke();

        // Box placeholder
        ctx.strokeRect(this.boxX, this.boxY, 60, 30);

        // Leader dot
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(this.leaderX, this.leaderY, 3, 0, Math.PI * 2);
        ctx.fillStyle = this.app.strokeColor;
        ctx.fill();

        ctx.globalAlpha = 1;
    }
}
