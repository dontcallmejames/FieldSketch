// SiteSketch - Layer Panel UI

export class LayerPanel {
    constructor(app) {
        this.app = app;
        this.listEl = document.getElementById('layer-list');

        document.getElementById('btn-add-layer').addEventListener('click', () => {
            const name = prompt('Layer name:', `Layer ${this.app.layers.length + 1}`);
            if (!name) return;
            this.app.addLayer(name);
        });

        this.render();
    }

    render() {
        this.listEl.innerHTML = '';

        // Render from top to bottom (last layer on top)
        for (let i = this.app.layers.length - 1; i >= 0; i--) {
            const layer = this.app.layers[i];
            const item = document.createElement('div');
            item.className = 'layer-item' + (layer === this.app.activeLayer ? ' active' : '');

            // Visibility toggle
            const visBtn = document.createElement('button');
            visBtn.className = 'layer-btn' + (layer.visible ? '' : ' off');
            visBtn.innerHTML = layer.visible ? '&#128065;' : '&#128064;';
            visBtn.title = 'Toggle visibility';
            visBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                layer.visible = !layer.visible;
                this.render();
                this.app.requestRender();
            });

            // Lock toggle
            const lockBtn = document.createElement('button');
            lockBtn.className = 'layer-btn' + (layer.locked ? '' : ' off');
            lockBtn.innerHTML = layer.locked ? '&#128274;' : '&#128275;';
            lockBtn.title = 'Toggle lock';
            lockBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                layer.locked = !layer.locked;
                this.render();
            });

            // Name
            const nameEl = document.createElement('span');
            nameEl.className = 'layer-name';
            nameEl.textContent = layer.name;

            // Object count
            const countEl = document.createElement('span');
            countEl.style.cssText = 'font-size: 10px; color: var(--text-muted); margin-left: 4px;';
            countEl.textContent = `(${layer.objects.length})`;

            // Delete button (can't delete last layer)
            const delBtn = document.createElement('button');
            delBtn.className = 'layer-btn';
            delBtn.innerHTML = '&times;';
            delBtn.title = 'Delete layer';
            delBtn.style.display = this.app.layers.length > 1 ? '' : 'none';
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.app.layers.length <= 1) return;
                if (!confirm(`Delete layer "${layer.name}"?`)) return;
                this.app.removeLayer(i);
            });

            item.appendChild(visBtn);
            item.appendChild(lockBtn);
            item.appendChild(nameEl);
            item.appendChild(countEl);
            item.appendChild(delBtn);

            item.addEventListener('click', () => {
                this.app.setActiveLayer(i);
            });

            this.listEl.appendChild(item);
        }
    }
}
