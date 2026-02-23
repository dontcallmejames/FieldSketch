// FieldSketch - Toolbar UI Module

export class Toolbar {
    constructor(app) {
        this.app = app;
        this.init();
    }

    init() {
        // Tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const toolName = btn.dataset.tool;
                this.app.setTool(toolName);
            });
        });

        // Color picker
        document.getElementById('stroke-color').addEventListener('input', (e) => {
            this.app.strokeColor = e.target.value;
        });

        // Stroke width
        document.getElementById('stroke-width').addEventListener('change', (e) => {
            this.app.strokeWidth = parseInt(e.target.value);
        });

        // Stroke style
        document.getElementById('stroke-style').addEventListener('change', (e) => {
            this.app.strokeStyle = e.target.value;
        });

        // Grid toggle
        document.getElementById('btn-grid').addEventListener('click', () => {
            const visible = this.app.grid.toggleVisible();
            document.getElementById('btn-grid').classList.toggle('active', visible);
        });

        // Snap toggle
        document.getElementById('btn-snap').addEventListener('click', () => {
            const snap = this.app.grid.toggleSnap();
            document.getElementById('btn-snap').classList.toggle('active', snap);
        });

        // Undo/Redo
        document.getElementById('btn-undo').addEventListener('click', () => this.app.history.undo());
        document.getElementById('btn-redo').addEventListener('click', () => this.app.history.redo());

        // Menu
        document.getElementById('btn-menu').addEventListener('click', () => this.app.toggleMenu());
        document.getElementById('menu-close').addEventListener('click', () => this.app.toggleMenu(false));

        // Side panel toggle
        document.getElementById('btn-toggle-panel').addEventListener('click', () => this.app.togglePanel());

        // Panel tabs
        document.querySelectorAll('.panel-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.panel-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(`${tab.dataset.panel}-panel`).classList.add('active');
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Don't handle shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') { e.preventDefault(); this.app.history.undo(); }
                if (e.key === 'y') { e.preventDefault(); this.app.history.redo(); }
                if (e.key === 's') { e.preventDefault(); this.app.store.saveCurrentProject(); }
            } else {
                switch (e.key.toLowerCase()) {
                    case 'v': this.app.setTool('select'); break;
                    case 'l': this.app.setTool('line'); break;
                    case 'r': this.app.setTool('rect'); break;
                    case 'c': this.app.setTool('circle'); break;
                    case 'a': this.app.setTool('arc'); break;
                    case 'p': this.app.setTool('polyline'); break;
                    case 'f': this.app.setTool('freehand'); break;
                    case 'e': this.app.setTool('eraser'); break;
                    case 'd': this.app.setTool('dimension'); break;
                    case 't': this.app.setTool('text'); break;
                    case 'g': document.getElementById('btn-grid').click(); break;
                    case 's': document.getElementById('btn-snap').click(); break;
                    case 'delete':
                    case 'backspace':
                        this.app.deleteSelected();
                        break;
                    case 'escape':
                        this.app.setTool('select');
                        break;
                }
            }
        });
    }

    setActiveTool(toolName) {
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === toolName);
        });
    }
}
