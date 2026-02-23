// FieldSketch - Grid Module

export class Grid {
    constructor(app) {
        this.app = app;
        this.visible = true;
        this.snapEnabled = true;
        this.size = 20; // grid spacing in world units
        this.majorEvery = 5; // major line every N grid lines
        this.minorColor = 'rgba(100, 120, 160, 0.15)';
        this.majorColor = 'rgba(100, 120, 160, 0.3)';
        this.minorWidth = 0.5;
        this.majorWidth = 1;
    }

    setSize(size) {
        this.size = size;
        this.app.requestRender();
    }

    toggleVisible() {
        this.visible = !this.visible;
        this.app.requestRender();
        return this.visible;
    }

    toggleSnap() {
        this.snapEnabled = !this.snapEnabled;
        return this.snapEnabled;
    }

    snap(x, y) {
        if (!this.snapEnabled) return { x, y };
        return {
            x: Math.round(x / this.size) * this.size,
            y: Math.round(y / this.size) * this.size
        };
    }

    draw(ctx, canvas) {
        if (!this.visible) return;

        const { zoom, panX, panY } = canvas;
        const { width, height } = canvas;

        // Don't draw grid if too zoomed out (lines would be too dense)
        const screenGridSize = this.size * zoom;
        if (screenGridSize < 4) return;

        ctx.save();
        canvas.resetTransform(ctx);

        // Calculate visible world bounds
        const worldLeft = -panX / zoom;
        const worldTop = -panY / zoom;
        const worldRight = (width - panX) / zoom;
        const worldBottom = (height - panY) / zoom;

        // Align to grid
        const startX = Math.floor(worldLeft / this.size) * this.size;
        const startY = Math.floor(worldTop / this.size) * this.size;
        const endX = Math.ceil(worldRight / this.size) * this.size;
        const endY = Math.ceil(worldBottom / this.size) * this.size;

        // Draw minor lines
        ctx.beginPath();
        ctx.strokeStyle = this.minorColor;
        ctx.lineWidth = this.minorWidth;

        for (let x = startX; x <= endX; x += this.size) {
            const gridIndex = Math.round(x / this.size);
            if (gridIndex % this.majorEvery === 0) continue;
            const sx = x * zoom + panX;
            ctx.moveTo(sx, 0);
            ctx.lineTo(sx, height);
        }
        for (let y = startY; y <= endY; y += this.size) {
            const gridIndex = Math.round(y / this.size);
            if (gridIndex % this.majorEvery === 0) continue;
            const sy = y * zoom + panY;
            ctx.moveTo(0, sy);
            ctx.lineTo(width, sy);
        }
        ctx.stroke();

        // Draw major lines
        ctx.beginPath();
        ctx.strokeStyle = this.majorColor;
        ctx.lineWidth = this.majorWidth;

        for (let x = startX; x <= endX; x += this.size) {
            const gridIndex = Math.round(x / this.size);
            if (gridIndex % this.majorEvery !== 0) continue;
            const sx = x * zoom + panX;
            ctx.moveTo(sx, 0);
            ctx.lineTo(sx, height);
        }
        for (let y = startY; y <= endY; y += this.size) {
            const gridIndex = Math.round(y / this.size);
            if (gridIndex % this.majorEvery !== 0) continue;
            const sy = y * zoom + panY;
            ctx.moveTo(0, sy);
            ctx.lineTo(width, sy);
        }
        ctx.stroke();

        // Draw origin crosshair
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(233, 69, 96, 0.3)';
        ctx.lineWidth = 1;
        const ox = panX;
        const oy = panY;
        ctx.moveTo(ox, 0);
        ctx.lineTo(ox, height);
        ctx.moveTo(0, oy);
        ctx.lineTo(width, oy);
        ctx.stroke();

        ctx.restore();
    }
}
