// SiteSketch - Selection Module

import { pointInRect, distance } from '../utils/math.js';

const HANDLE_SIZE = 8;
const HANDLE_HIT = 12;

export class Selection {
    constructor(app) {
        this.app = app;
        this.selected = null;
        this.handles = []; // { x, y, cursor, type }
        this.activeHandle = null;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.objStartState = null;
    }

    select(obj) {
        this.selected = obj;
        this.updateHandles();
        this.app.propertyPanel?.update();
        this.app.requestRender();
    }

    deselect() {
        this.selected = null;
        this.handles = [];
        this.activeHandle = null;
        this.app.propertyPanel?.update();
        this.app.requestRender();
    }

    updateHandles() {
        if (!this.selected) {
            this.handles = [];
            return;
        }

        const bounds = this.selected.getBounds();
        if (!bounds) {
            this.handles = [];
            return;
        }

        const { x, y, w, h } = bounds;
        this.handles = [
            { x: x, y: y, cursor: 'nw-resize', type: 'nw' },
            { x: x + w / 2, y: y, cursor: 'n-resize', type: 'n' },
            { x: x + w, y: y, cursor: 'ne-resize', type: 'ne' },
            { x: x + w, y: y + h / 2, cursor: 'e-resize', type: 'e' },
            { x: x + w, y: y + h, cursor: 'se-resize', type: 'se' },
            { x: x + w / 2, y: y + h, cursor: 's-resize', type: 's' },
            { x: x, y: y + h, cursor: 'sw-resize', type: 'sw' },
            { x: x, y: y + h / 2, cursor: 'w-resize', type: 'w' },
        ];
    }

    hitTestHandles(wx, wy) {
        const canvas = this.app.canvas;
        const hitRadius = HANDLE_HIT / canvas.zoom;

        for (const handle of this.handles) {
            if (distance(wx, wy, handle.x, handle.y) <= hitRadius) {
                return handle;
            }
        }
        return null;
    }

    hitTestObjects(wx, wy) {
        const layers = this.app.layers;
        // Test from top layer to bottom, and from last object to first
        for (let i = layers.length - 1; i >= 0; i--) {
            const layer = layers[i];
            if (!layer.visible || layer.locked) continue;
            for (let j = layer.objects.length - 1; j >= 0; j--) {
                const obj = layer.objects[j];
                if (obj.hitTest(wx, wy, this.app)) {
                    return { obj, layer };
                }
            }
        }
        return null;
    }

    drawHandles(ctx, canvas) {
        if (!this.selected) return;

        const bounds = this.selected.getBounds();
        if (!bounds) return;

        canvas.resetTransform(ctx);

        // Draw bounding box in screen space
        const tl = canvas.worldToScreen(bounds.x, bounds.y);
        const br = canvas.worldToScreen(bounds.x + bounds.w, bounds.y + bounds.h);

        ctx.strokeStyle = '#e94560';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
        ctx.setLineDash([]);

        // Draw handles
        for (const handle of this.handles) {
            const sp = canvas.worldToScreen(handle.x, handle.y);
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#e94560';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.rect(
                sp.x - HANDLE_SIZE / 2,
                sp.y - HANDLE_SIZE / 2,
                HANDLE_SIZE,
                HANDLE_SIZE
            );
            ctx.fill();
            ctx.stroke();
        }
    }
}
