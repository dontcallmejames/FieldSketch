// SiteSketch - Touch/Stylus Gesture Recognition

export class TouchHandler {
    constructor(element, callbacks) {
        this.el = element;
        this.callbacks = callbacks;
        this.touches = new Map();
        this.isPinching = false;
        this.lastPinchDist = 0;
        this.lastPinchCenter = null;
        this.isPanning = false;

        this.el.addEventListener('pointerdown', this.onPointerDown.bind(this));
        this.el.addEventListener('pointermove', this.onPointerMove.bind(this));
        this.el.addEventListener('pointerup', this.onPointerUp.bind(this));
        this.el.addEventListener('pointercancel', this.onPointerUp.bind(this));
        this.el.addEventListener('wheel', this.onWheel.bind(this), { passive: false });

        // Prevent default touch behaviors
        this.el.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
        this.el.addEventListener('gesturestart', e => e.preventDefault());
    }

    onPointerDown(e) {
        this.touches.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType });
        this.el.setPointerCapture(e.pointerId);

        if (this.touches.size === 2) {
            this.startPinch();
        } else if (this.touches.size === 1) {
            // Single touch/pen - pass to tool as drawing input
            if (e.pointerType === 'touch') {
                // On touch, we wait briefly to see if a second finger comes down (pinch)
                this.pendingDown = e;
                this.pendingTimeout = setTimeout(() => {
                    if (this.touches.size === 1 && !this.isPinching) {
                        this.isPanning = true;
                        this.callbacks.onPanStart?.(e.clientX, e.clientY);
                    }
                    this.pendingDown = null;
                }, 80);
            } else {
                // Pen or mouse - immediate draw
                this.callbacks.onDrawStart?.(e.clientX, e.clientY, e.pressure, e.pointerType);
            }
        }
    }

    onPointerMove(e) {
        const prev = this.touches.get(e.pointerId);
        if (!prev) return;

        this.touches.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType });

        if (this.isPinching && this.touches.size === 2) {
            this.updatePinch();
        } else if (this.isPanning) {
            const dx = e.clientX - prev.x;
            const dy = e.clientY - prev.y;
            this.callbacks.onPanMove?.(dx, dy);
        } else if (this.touches.size === 1 && !this.isPinching && e.pointerType !== 'touch') {
            this.callbacks.onDrawMove?.(e.clientX, e.clientY, e.pressure, e.pointerType);
        }
    }

    onPointerUp(e) {
        this.touches.delete(e.pointerId);

        if (this.pendingTimeout) {
            clearTimeout(this.pendingTimeout);
            this.pendingTimeout = null;
        }

        if (this.isPinching && this.touches.size < 2) {
            this.isPinching = false;
            this.callbacks.onPinchEnd?.();
        }

        if (this.isPanning) {
            this.isPanning = false;
            this.callbacks.onPanEnd?.();
        }

        if (this.touches.size === 0) {
            if (e.pointerType !== 'touch') {
                this.callbacks.onDrawEnd?.(e.clientX, e.clientY, e.pressure, e.pointerType);
            }
        }
    }

    startPinch() {
        this.isPinching = true;
        this.isPanning = false;
        if (this.pendingTimeout) {
            clearTimeout(this.pendingTimeout);
            this.pendingTimeout = null;
        }
        const pts = [...this.touches.values()];
        this.lastPinchDist = Math.sqrt(
            (pts[1].x - pts[0].x) ** 2 + (pts[1].y - pts[0].y) ** 2
        );
        this.lastPinchCenter = {
            x: (pts[0].x + pts[1].x) / 2,
            y: (pts[0].y + pts[1].y) / 2
        };
        this.callbacks.onPinchStart?.(this.lastPinchCenter.x, this.lastPinchCenter.y);
    }

    updatePinch() {
        const pts = [...this.touches.values()];
        const dist = Math.sqrt(
            (pts[1].x - pts[0].x) ** 2 + (pts[1].y - pts[0].y) ** 2
        );
        const center = {
            x: (pts[0].x + pts[1].x) / 2,
            y: (pts[0].y + pts[1].y) / 2
        };

        const scale = dist / this.lastPinchDist;
        const dx = center.x - this.lastPinchCenter.x;
        const dy = center.y - this.lastPinchCenter.y;

        this.callbacks.onPinchMove?.(scale, dx, dy, center.x, center.y);

        this.lastPinchDist = dist;
        this.lastPinchCenter = center;
    }

    onWheel(e) {
        e.preventDefault();
        if (e.ctrlKey) {
            // Pinch-to-zoom on trackpad
            const scale = e.deltaY > 0 ? 0.95 : 1.05;
            this.callbacks.onZoom?.(scale, e.clientX, e.clientY);
        } else {
            // Scroll to pan
            this.callbacks.onPanMove?.(-e.deltaX, -e.deltaY);
        }
    }

    destroy() {
        this.el.removeEventListener('pointerdown', this.onPointerDown);
        this.el.removeEventListener('pointermove', this.onPointerMove);
        this.el.removeEventListener('pointerup', this.onPointerUp);
        this.el.removeEventListener('pointercancel', this.onPointerUp);
        this.el.removeEventListener('wheel', this.onWheel);
    }
}
