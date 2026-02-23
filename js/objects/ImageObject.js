// FieldSketch - Image Object (imported photos/PDFs as backgrounds)

import { DrawObject } from './DrawObject.js';
import { pointInRect } from '../utils/math.js';

export class ImageObject extends DrawObject {
    constructor(props = {}) {
        super('image', props);
        this.x = props.x || 0;
        this.y = props.y || 0;
        this.w = props.w || 0;
        this.h = props.h || 0;
        this.opacity = props.opacity ?? 0.5;
        this.imageData = props.imageData || null; // base64 data URL
        this._img = null;
        this._loaded = false;

        if (this.imageData) {
            this._loadImage();
        }
    }

    _loadImage() {
        this._img = new Image();
        this._img.onload = () => {
            this._loaded = true;
            if (this.w === 0 && this.h === 0) {
                this.w = this._img.naturalWidth;
                this.h = this._img.naturalHeight;
            }
        };
        this._img.src = this.imageData;
    }

    setImage(dataUrl, naturalWidth, naturalHeight) {
        this.imageData = dataUrl;
        this.w = naturalWidth;
        this.h = naturalHeight;
        this._loadImage();
    }

    draw(ctx) {
        if (!this._loaded || !this._img) return;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(this._img, this.x, this.y, this.w, this.h);
        ctx.restore();
    }

    hitTest(wx, wy) {
        return pointInRect(wx, wy, this.x, this.y, this.w, this.h);
    }

    getBounds() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }

    translate(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            x: this.x, y: this.y, w: this.w, h: this.h,
            imageData: this.imageData
        };
    }

    static fromJSON(data) {
        const obj = new ImageObject(data);
        obj.fromJSON(data);
        return obj;
    }
}
