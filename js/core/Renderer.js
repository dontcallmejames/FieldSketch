// SiteSketch - Renderer Module

export class Renderer {
    constructor(app) {
        this.app = app;
        this.dirty = true;
        this.rafId = null;
    }

    requestRender() {
        this.dirty = true;
        if (!this.rafId) {
            this.rafId = requestAnimationFrame(() => this.render());
        }
    }

    render() {
        this.rafId = null;

        if (!this.dirty) return;
        this.dirty = false;

        const canvas = this.app.canvas;
        const ctx = canvas.ctx;

        // Clear
        canvas.clear(ctx);

        // 1. Draw grid (screen space, but aligned to world)
        this.app.grid.draw(ctx, canvas);

        // 2. Draw layers and objects (world space)
        ctx.save();
        canvas.applyTransform(ctx);

        const layers = this.app.layers;
        for (const layer of layers) {
            if (!layer.visible) continue;
            for (const obj of layer.objects) {
                obj.draw(ctx, this.app);
            }
        }

        ctx.restore();

        // 3. Draw selection handles (screen space)
        if (this.app.selection?.selected) {
            this.app.selection.drawHandles(ctx, canvas);
        }

        // 4. Draw active tool preview (world space)
        if (this.app.activeTool?.preview) {
            ctx.save();
            canvas.applyTransform(ctx);
            this.app.activeTool.drawPreview(ctx, this.app);
            ctx.restore();
        }
    }

    destroy() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
    }
}
