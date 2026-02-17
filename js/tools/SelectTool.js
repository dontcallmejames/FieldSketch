// SiteSketch - Select Tool

import { Tool } from './Tool.js';
import { MoveObjectCommand } from '../core/History.js';

export class SelectTool extends Tool {
    constructor(app) {
        super('select', app);
        this.mode = null; // 'move', 'resize'
        this.startX = 0;
        this.startY = 0;
        this.dragStartX = 0;
        this.dragStartY = 0;
    }

    onPointerDown(x, y, info) {
        const sel = this.app.selection;
        // Use raw (unsnapped) coords for hit testing, snapped for move/resize
        const rawX = info?.rawX ?? x;
        const rawY = info?.rawY ?? y;

        // Check if clicking a resize handle
        if (sel.selected) {
            const handle = sel.hitTestHandles(rawX, rawY);
            if (handle) {
                this.mode = 'resize';
                sel.activeHandle = handle;
                this.startX = x;
                this.startY = y;
                return;
            }
        }

        // Check if clicking an object
        const hit = sel.hitTestObjects(rawX, rawY);
        if (hit) {
            sel.select(hit.obj);
            this.mode = 'move';
            this.startX = x;
            this.startY = y;
            this.dragStartX = x;
            this.dragStartY = y;
            this.app.requestRender();
        } else {
            sel.deselect();
            this.mode = null;
        }
    }

    onPointerMove(x, y, info) {
        if (!this.mode) return;
        const sel = this.app.selection;

        if (this.mode === 'move' && sel.selected) {
            const dx = x - this.startX;
            const dy = y - this.startY;
            sel.selected.translate(dx, dy);
            sel.updateHandles();
            this.startX = x;
            this.startY = y;
            this.app.requestRender();
        }

        if (this.mode === 'resize' && sel.selected && sel.activeHandle) {
            this.resizeObject(sel.selected, sel.activeHandle, x, y);
            sel.updateHandles();
            this.app.requestRender();
        }
    }

    onPointerUp(x, y, info) {
        if (this.mode === 'move' && this.app.selection.selected) {
            const totalDx = x - this.dragStartX;
            const totalDy = y - this.dragStartY;
            if (Math.abs(totalDx) > 0.5 || Math.abs(totalDy) > 0.5) {
                // Already moved the object - push a command for undo
                // But we need to undo the visual move first, then let the command re-apply it
                this.app.selection.selected.translate(-totalDx, -totalDy);
                this.app.history.execute(
                    new MoveObjectCommand(this.app.selection.selected, totalDx, totalDy)
                );
                this.app.selection.updateHandles();
            }
        }

        this.mode = null;
        this.app.selection.activeHandle = null;
    }

    resizeObject(obj, handle, x, y) {
        const bounds = obj.getBounds();
        if (!bounds) return;

        // For simple shapes, adjust their dimensions based on handle type
        const type = handle.type;

        if (obj.type === 'rect') {
            const right = obj.x + obj.w;
            const bottom = obj.y + obj.h;
            if (type.includes('w')) obj.x = x;
            if (type.includes('n')) obj.y = y;
            if (type.includes('e')) obj.w = x - obj.x;
            else if (type.includes('w')) obj.w = right - x;
            if (type.includes('s')) obj.h = y - obj.y;
            else if (type.includes('n')) obj.h = bottom - y;
        } else if (obj.type === 'circle') {
            const dx = x - obj.cx;
            const dy = y - obj.cy;
            if (type === 'e' || type === 'w') obj.rx = Math.abs(dx);
            if (type === 'n' || type === 's') obj.ry = Math.abs(dy);
            if (type === 'ne' || type === 'nw' || type === 'se' || type === 'sw') {
                obj.rx = Math.abs(dx);
                obj.ry = Math.abs(dy);
            }
        } else if (obj.type === 'line' || obj.type === 'arrow') {
            if (type === 'nw' || type === 'w' || type === 'sw') {
                obj.x1 = x; obj.y1 = y;
            } else {
                obj.x2 = x; obj.y2 = y;
            }
        }
    }
}
