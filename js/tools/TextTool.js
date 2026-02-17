// SiteSketch - Text Tool

import { Tool } from './Tool.js';
import { TextLabel } from '../objects/TextLabel.js';
import { AddObjectCommand } from '../core/History.js';

export class TextTool extends Tool {
    constructor(app) {
        super('text', app);
    }

    activate() {
        this.app.setStatus('Click to place text');
    }

    onPointerDown(x, y) {
        const text = prompt('Enter text:', 'Text');
        if (!text) return;

        const label = new TextLabel({
            x, y,
            text,
            fontSize: Math.max(this.app.strokeWidth * 6, 14),
            strokeColor: this.app.strokeColor,
            opacity: 1
        });

        this.app.history.execute(
            new AddObjectCommand(this.app, this.app.activeLayer, label)
        );
    }
}
