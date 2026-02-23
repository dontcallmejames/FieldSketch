// FieldSketch - Base Tool Class

export class Tool {
    constructor(name, app) {
        this.name = name;
        this.app = app;
        this.preview = false;
        this.isDrawing = false;
    }

    activate() {}
    deactivate() {
        this.preview = false;
        this.isDrawing = false;
    }

    onPointerDown(x, y, info) {}
    onPointerMove(x, y, info) {}
    onPointerUp(x, y, info) {}
    drawPreview(ctx, app) {}

    // Helper: get current stroke settings
    getStyle() {
        return {
            strokeColor: this.app.strokeColor,
            strokeWidth: this.app.strokeWidth,
            strokeStyle: this.app.strokeStyle
        };
    }
}
