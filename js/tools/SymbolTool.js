// FieldSketch - Symbol Tool

import { Tool } from './Tool.js';
import { Symbol, SYMBOL_DEFS } from '../objects/Symbol.js';
import { AddObjectCommand } from '../core/History.js';

export class SymbolTool extends Tool {
    constructor(app) {
        super('symbol', app);
        this.selectedSymbol = 'defect';
        this.currentX = 0;
        this.currentY = 0;
        this.showPalette = false;
    }

    activate() {
        this.preview = true;
        this.app.setStatus(`Symbol: ${SYMBOL_DEFS[this.selectedSymbol]?.label || this.selectedSymbol}`);
        this.showSymbolPalette();
    }

    deactivate() {
        this.preview = false;
        this.hideSymbolPalette();
    }

    setSymbol(type) {
        this.selectedSymbol = type;
        this.app.setStatus(`Symbol: ${SYMBOL_DEFS[type]?.label || type}`);
        this.app.requestRender();
    }

    onPointerDown(x, y) {
        this.currentX = x;
        this.currentY = y;

        const symbol = new Symbol({
            x, y,
            symbolType: this.selectedSymbol,
            size: 30,
            strokeColor: this.app.strokeColor,
            strokeWidth: this.app.strokeWidth
        });

        this.app.history.execute(
            new AddObjectCommand(this.app, this.app.activeLayer, symbol)
        );
    }

    onPointerMove(x, y) {
        this.currentX = x;
        this.currentY = y;
        this.app.requestRender();
    }

    drawPreview(ctx) {
        const def = SYMBOL_DEFS[this.selectedSymbol];
        if (!def) return;

        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = this.app.strokeColor;
        ctx.fillStyle = this.app.strokeColor;
        ctx.lineWidth = this.app.strokeWidth;
        ctx.translate(this.currentX, this.currentY);
        def.draw(ctx, 30);
        ctx.restore();
    }

    showSymbolPalette() {
        let palette = document.getElementById('symbol-palette');
        if (palette) {
            palette.classList.remove('hidden');
            return;
        }

        palette = document.createElement('div');
        palette.id = 'symbol-palette';
        palette.className = 'symbol-palette';
        palette.style.cssText = `
            position: absolute;
            bottom: 32px;
            left: 50%;
            transform: translateX(-50%);
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
            gap: 4px;
            padding: 8px;
            background: var(--bg-panel, #16213e);
            border: 1px solid var(--border-color, #2a2a4a);
            border-radius: 8px;
            z-index: 90;
            max-width: 500px;
        `;

        for (const [key, def] of Object.entries(SYMBOL_DEFS)) {
            const btn = document.createElement('button');
            btn.className = 'symbol-btn' + (key === this.selectedSymbol ? ' selected' : '');
            btn.title = def.label;
            btn.dataset.symbol = key;

            // Create small preview canvas
            const canvas = document.createElement('canvas');
            canvas.width = 36;
            canvas.height = 36;
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#eee';
            ctx.fillStyle = '#eee';
            ctx.lineWidth = 1.5;
            ctx.translate(18, 18);
            def.draw(ctx, 28);
            btn.appendChild(canvas);

            const label = document.createElement('div');
            label.style.cssText = 'font-size: 9px; color: #aab; margin-top: 2px;';
            label.textContent = def.label;
            btn.appendChild(label);
            btn.style.cssText += 'width: auto; height: auto; padding: 4px; flex-direction: column;';

            btn.addEventListener('click', () => {
                palette.querySelectorAll('.symbol-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.setSymbol(key);
            });

            palette.appendChild(btn);
        }

        document.getElementById('canvas-container').appendChild(palette);
    }

    hideSymbolPalette() {
        const palette = document.getElementById('symbol-palette');
        if (palette) palette.classList.add('hidden');
    }
}
