// SiteSketch - Canvas Module (Viewport, Pan/Zoom, Coordinate Transforms)

import { TouchHandler } from '../utils/touch.js';
import { clamp } from '../utils/math.js';

export class Canvas {
    constructor(canvasEl, app) {
        this.el = canvasEl;
        this.ctx = canvasEl.getContext('2d');
        this.app = app;

        // Viewport state
        this.panX = 0;
        this.panY = 0;
        this.zoom = 1;
        this.minZoom = 0.1;
        this.maxZoom = 20;

        // Device pixel ratio for sharp rendering
        this.dpr = window.devicePixelRatio || 1;

        // Resize handling
        this.resize();
        this._resizeObserver = new ResizeObserver(() => this.resize());
        this._resizeObserver.observe(canvasEl.parentElement);

        // Touch/pointer handling
        this.touch = new TouchHandler(canvasEl, {
            onDrawStart: (cx, cy, pressure, type) => this.handleDrawStart(cx, cy, pressure, type),
            onDrawMove: (cx, cy, pressure, type) => this.handleDrawMove(cx, cy, pressure, type),
            onDrawEnd: (cx, cy, pressure, type) => this.handleDrawEnd(cx, cy, pressure, type),
            onPanStart: () => {},
            onPanMove: (dx, dy) => this.pan(dx, dy),
            onPanEnd: () => {},
            onPinchStart: () => {},
            onPinchMove: (scale, dx, dy, cx, cy) => {
                this.pan(dx, dy);
                this.zoomAt(scale, cx, cy);
            },
            onPinchEnd: () => {},
            onZoom: (scale, cx, cy) => this.zoomAt(scale, cx, cy),
        });

        // Mouse move for coordinate display (doesn't go through touch handler)
        canvasEl.addEventListener('mousemove', (e) => {
            const world = this.screenToWorld(e.clientX, e.clientY);
            this.app.updateCoords(world.x, world.y);
        });
    }

    resize() {
        const rect = this.el.parentElement.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        this.el.width = rect.width * this.dpr;
        this.el.height = rect.height * this.dpr;
        this.el.style.width = rect.width + 'px';
        this.el.style.height = rect.height + 'px';
        this.app.requestRender();
    }

    // Convert screen (client) coordinates to world coordinates
    screenToWorld(clientX, clientY) {
        const rect = this.el.getBoundingClientRect();
        const sx = clientX - rect.left;
        const sy = clientY - rect.top;
        return {
            x: (sx - this.panX) / this.zoom,
            y: (sy - this.panY) / this.zoom
        };
    }

    // Convert world coordinates to screen coordinates
    worldToScreen(wx, wy) {
        return {
            x: wx * this.zoom + this.panX,
            y: wy * this.zoom + this.panY
        };
    }

    pan(dx, dy) {
        this.panX += dx;
        this.panY += dy;
        this.app.requestRender();
    }

    zoomAt(factor, cx, cy) {
        const rect = this.el.getBoundingClientRect();
        const sx = cx - rect.left;
        const sy = cy - rect.top;

        const newZoom = clamp(this.zoom * factor, this.minZoom, this.maxZoom);
        const actualFactor = newZoom / this.zoom;

        this.panX = sx - (sx - this.panX) * actualFactor;
        this.panY = sy - (sy - this.panY) * actualFactor;
        this.zoom = newZoom;

        this.app.updateZoom(this.zoom);
        this.app.requestRender();
    }

    setZoom(newZoom) {
        const cx = this.width / 2;
        const cy = this.height / 2;
        const factor = newZoom / this.zoom;
        this.zoomAt(factor, cx + this.el.getBoundingClientRect().left, cy + this.el.getBoundingClientRect().top);
    }

    resetView() {
        this.panX = this.width / 2;
        this.panY = this.height / 2;
        this.zoom = 1;
        this.app.updateZoom(this.zoom);
        this.app.requestRender();
    }

    // Apply viewport transform to the canvas context
    applyTransform(ctx) {
        ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        ctx.translate(this.panX, this.panY);
        ctx.scale(this.zoom, this.zoom);
    }

    // Reset to device pixel transform (for screen-space drawing like UI overlays)
    resetTransform(ctx) {
        ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    clear(ctx) {
        ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        ctx.clearRect(0, 0, this.width, this.height);
    }

    // Pointer event handlers - delegate to active tool
    handleDrawStart(cx, cy, pressure, pointerType) {
        const world = this.screenToWorld(cx, cy);
        const snapped = this.app.snapPoint(world.x, world.y);
        this.app.activeTool?.onPointerDown(snapped.x, snapped.y, {
            pressure,
            pointerType,
            rawX: world.x,
            rawY: world.y,
            screenX: cx,
            screenY: cy
        });
    }

    handleDrawMove(cx, cy, pressure, pointerType) {
        const world = this.screenToWorld(cx, cy);
        const snapped = this.app.snapPoint(world.x, world.y);
        this.app.updateCoords(world.x, world.y);
        this.app.activeTool?.onPointerMove(snapped.x, snapped.y, {
            pressure,
            pointerType,
            rawX: world.x,
            rawY: world.y,
            screenX: cx,
            screenY: cy
        });
    }

    handleDrawEnd(cx, cy, pressure, pointerType) {
        const world = this.screenToWorld(cx, cy);
        const snapped = this.app.snapPoint(world.x, world.y);
        this.app.activeTool?.onPointerUp(snapped.x, snapped.y, {
            pressure,
            pointerType,
            rawX: world.x,
            rawY: world.y,
            screenX: cx,
            screenY: cy
        });
    }

    destroy() {
        this.touch.destroy();
        this._resizeObserver.disconnect();
    }
}
