// SiteSketch - Eraser Tool

import { Tool } from './Tool.js';
import { RemoveObjectCommand } from '../core/History.js';

export class EraserTool extends Tool {
    constructor(app) {
        super('eraser', app);
    }

    onPointerDown(x, y, info) {
        this.erase(info?.rawX ?? x, info?.rawY ?? y);
    }

    onPointerMove(x, y, info) {
        if (!this.isDrawing) return;
        this.erase(info?.rawX ?? x, info?.rawY ?? y);
    }

    onPointerUp() {
        this.isDrawing = false;
    }

    erase(x, y) {
        this.isDrawing = true;
        const hit = this.app.selection.hitTestObjects(x, y);
        if (hit) {
            this.app.history.execute(
                new RemoveObjectCommand(this.app, hit.layer, hit.obj)
            );
        }
    }
}
