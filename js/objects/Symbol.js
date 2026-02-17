// SiteSketch - Symbol Object (Predefined inspection/engineering symbols)

import { DrawObject } from './DrawObject.js';
import { pointInRect } from '../utils/math.js';

// Symbol definitions - each is a function that draws at (0,0) with given size
const SYMBOL_DEFS = {
    // Electrical
    outlet: { label: 'Outlet', category: 'electrical', draw: (ctx, s) => {
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-s * 0.15, -s * 0.1);
        ctx.lineTo(-s * 0.15, s * 0.1);
        ctx.moveTo(s * 0.15, -s * 0.1);
        ctx.lineTo(s * 0.15, s * 0.1);
        ctx.stroke();
    }},
    switch: { label: 'Switch', category: 'electrical', draw: (ctx, s) => {
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-s * 0.3, 0);
        ctx.lineTo(s * 0.2, -s * 0.2);
        ctx.stroke();
    }},
    light: { label: 'Light', category: 'electrical', draw: (ctx, s) => {
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-s * 0.25, -s * 0.25);
        ctx.lineTo(s * 0.25, s * 0.25);
        ctx.moveTo(s * 0.25, -s * 0.25);
        ctx.lineTo(-s * 0.25, s * 0.25);
        ctx.stroke();
    }},
    panel: { label: 'Panel', category: 'electrical', draw: (ctx, s) => {
        ctx.strokeRect(-s * 0.35, -s * 0.4, s * 0.7, s * 0.8);
        ctx.beginPath();
        ctx.moveTo(-s * 0.15, -s * 0.4);
        ctx.lineTo(-s * 0.15, s * 0.4);
        ctx.moveTo(s * 0.15, -s * 0.4);
        ctx.lineTo(s * 0.15, s * 0.4);
        ctx.stroke();
    }},

    // Plumbing
    valve: { label: 'Valve', category: 'plumbing', draw: (ctx, s) => {
        ctx.beginPath();
        ctx.moveTo(-s * 0.35, -s * 0.25);
        ctx.lineTo(0, s * 0.25);
        ctx.lineTo(s * 0.35, -s * 0.25);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-s * 0.35, s * 0.25);
        ctx.lineTo(0, -s * 0.25);
        ctx.lineTo(s * 0.35, s * 0.25);
        ctx.closePath();
        ctx.stroke();
    }},
    drain: { label: 'Drain', category: 'plumbing', draw: (ctx, s) => {
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.15, 0, Math.PI * 2);
        ctx.fill();
    }},
    faucet: { label: 'Faucet', category: 'plumbing', draw: (ctx, s) => {
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = `${s * 0.4}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('W', 0, 0);
    }},
    cleanout: { label: 'Cleanout', category: 'plumbing', draw: (ctx, s) => {
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-s * 0.25, 0);
        ctx.lineTo(s * 0.25, 0);
        ctx.moveTo(0, -s * 0.25);
        ctx.lineTo(0, s * 0.25);
        ctx.stroke();
    }},

    // Structural / Inspection
    defect: { label: 'Defect', category: 'structural', draw: (ctx, s) => {
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.4);
        ctx.lineTo(s * 0.35, s * 0.3);
        ctx.lineTo(-s * 0.35, s * 0.3);
        ctx.closePath();
        ctx.stroke();
        ctx.font = `bold ${s * 0.35}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', 0, s * 0.1);
    }},
    ok: { label: 'OK', category: 'structural', draw: (ctx, s) => {
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-s * 0.2, 0);
        ctx.lineTo(-s * 0.05, s * 0.15);
        ctx.lineTo(s * 0.2, -s * 0.15);
        ctx.stroke();
    }},
    crack: { label: 'Crack', category: 'structural', draw: (ctx, s) => {
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.4);
        ctx.lineTo(-s * 0.1, -s * 0.15);
        ctx.lineTo(s * 0.1, s * 0.05);
        ctx.lineTo(-s * 0.1, s * 0.2);
        ctx.lineTo(0, s * 0.4);
        ctx.stroke();
    }},
    moisture: { label: 'Moisture', category: 'structural', draw: (ctx, s) => {
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.35);
        ctx.bezierCurveTo(s * 0.3, -s * 0.1, s * 0.3, s * 0.2, 0, s * 0.35);
        ctx.bezierCurveTo(-s * 0.3, s * 0.2, -s * 0.3, -s * 0.1, 0, -s * 0.35);
        ctx.stroke();
    }},
    photo: { label: 'Photo Pt', category: 'structural', draw: (ctx, s) => {
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.15, 0, Math.PI * 2);
        ctx.stroke();
    }},
    note: { label: 'Note', category: 'structural', draw: (ctx, s) => {
        ctx.strokeRect(-s * 0.3, -s * 0.35, s * 0.6, s * 0.7);
        ctx.beginPath();
        ctx.moveTo(-s * 0.15, -s * 0.15);
        ctx.lineTo(s * 0.15, -s * 0.15);
        ctx.moveTo(-s * 0.15, 0);
        ctx.lineTo(s * 0.15, 0);
        ctx.moveTo(-s * 0.15, s * 0.15);
        ctx.lineTo(s * 0.1, s * 0.15);
        ctx.stroke();
    }},
    north: { label: 'North', category: 'structural', draw: (ctx, s) => {
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.4);
        ctx.lineTo(s * 0.2, s * 0.4);
        ctx.lineTo(0, s * 0.2);
        ctx.lineTo(-s * 0.2, s * 0.4);
        ctx.closePath();
        ctx.stroke();
        ctx.font = `bold ${s * 0.25}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('N', 0, -s * 0.42);
    }},
    elevation: { label: 'Elevation', category: 'structural', draw: (ctx, s) => {
        ctx.beginPath();
        ctx.moveTo(-s * 0.35, 0);
        ctx.lineTo(0, -s * 0.35);
        ctx.lineTo(s * 0.35, 0);
        ctx.lineTo(0, s * 0.35);
        ctx.closePath();
        ctx.stroke();
    }}
};

export { SYMBOL_DEFS };

export class Symbol extends DrawObject {
    constructor(props = {}) {
        super('symbol', props);
        this.x = props.x || 0;
        this.y = props.y || 0;
        this.symbolType = props.symbolType || 'defect';
        this.size = props.size || 30;
        this.label = props.label || '';
    }

    draw(ctx) {
        const def = SYMBOL_DEFS[this.symbolType];
        if (!def) return;

        ctx.save();
        this.applyStyle(ctx);
        ctx.translate(this.x, this.y);
        ctx.fillStyle = this.strokeColor;
        def.draw(ctx, this.size);

        // Draw label below if set
        if (this.label) {
            ctx.font = `${this.size * 0.35}px sans-serif`;
            ctx.fillStyle = this.strokeColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(this.label, 0, this.size * 0.5 + 4);
        }

        ctx.restore();
        this.resetStyle(ctx);
    }

    hitTest(wx, wy) {
        const hs = this.size / 2 + 4;
        return pointInRect(wx, wy, this.x - hs, this.y - hs, hs * 2, hs * 2);
    }

    getBounds() {
        const hs = this.size / 2;
        return { x: this.x - hs, y: this.y - hs, w: this.size, h: this.size };
    }

    translate(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            x: this.x, y: this.y,
            symbolType: this.symbolType,
            size: this.size,
            label: this.label
        };
    }

    static fromJSON(data) {
        const obj = new Symbol(data);
        obj.fromJSON(data);
        return obj;
    }
}
