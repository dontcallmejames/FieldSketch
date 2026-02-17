// SiteSketch - Main Application Entry Point

import { Canvas } from './core/Canvas.js';
import { Grid } from './core/Grid.js';
import { Renderer } from './core/Renderer.js';
import { History, AddObjectCommand, RemoveObjectCommand, MoveObjectCommand } from './core/History.js';
import { Selection } from './core/Selection.js';
import { Store } from './core/Store.js';

import { Line } from './objects/Line.js';
import { Rectangle } from './objects/Rectangle.js';
import { Circle } from './objects/Circle.js';
import { Arc } from './objects/Arc.js';
import { Polyline } from './objects/Polyline.js';
import { Freehand } from './objects/Freehand.js';
import { TextLabel } from './objects/TextLabel.js';
import { Dimension } from './objects/Dimension.js';
import { Callout } from './objects/Callout.js';
import { Arrow } from './objects/Arrow.js';
import { Symbol } from './objects/Symbol.js';
import { ImageObject } from './objects/ImageObject.js';

import { SelectTool } from './tools/SelectTool.js';
import { LineTool } from './tools/LineTool.js';
import { RectTool } from './tools/RectTool.js';
import { CircleTool } from './tools/CircleTool.js';
import { ArcTool } from './tools/ArcTool.js';
import { PolylineTool } from './tools/PolylineTool.js';
import { FreehandTool } from './tools/FreehandTool.js';
import { EraserTool } from './tools/EraserTool.js';
import { DimensionTool } from './tools/DimensionTool.js';
import { TextTool } from './tools/TextTool.js';
import { CalloutTool } from './tools/CalloutTool.js';
import { ArrowTool } from './tools/ArrowTool.js';
import { SymbolTool } from './tools/SymbolTool.js';

import { Toolbar } from './ui/Toolbar.js';
import { LayerPanel } from './ui/LayerPanel.js';
import { PropertyPanel } from './ui/PropertyPanel.js';
import { ProjectDialog } from './ui/ProjectDialog.js';
import { ExportDialog } from './ui/ExportDialog.js';

class App {
    constructor() {
        // Project state
        this.projectId = null;
        this.projectName = 'Untitled';
        this.projectMeta = {};

        // Drawing state
        this.strokeColor = '#000000';
        this.strokeWidth = 2;
        this.strokeStyle = 'solid';
        this.scaleValue = 1;
        this.scaleUnit = 'ft';

        // Layers
        this.layers = [
            { name: 'Background', objects: [], visible: true, locked: false },
            { name: 'Drawing', objects: [], visible: true, locked: false }
        ];
        this.activeLayerIndex = 1;

        // Object/command class references for dynamic use
        this._objectClasses = {
            Line, Rectangle, Circle, Arc, Polyline, Freehand,
            TextLabel, Dimension, Callout, Arrow, Symbol, ImageObject
        };
        this._commandClasses = { AddObjectCommand, RemoveObjectCommand, MoveObjectCommand };

        // Type map for deserialization
        this._typeMap = {
            line: Line, rect: Rectangle, circle: Circle, arc: Arc,
            polyline: Polyline, freehand: Freehand, text: TextLabel,
            dimension: Dimension, callout: Callout, arrow: Arrow,
            symbol: Symbol, image: ImageObject
        };
    }

    async init() {
        const canvasEl = document.getElementById('drawing-canvas');

        // Core modules - renderer first so requestRender works during Canvas init
        this.grid = new Grid(this);
        this.renderer = new Renderer(this);
        this.history = new History(this);
        this.selection = new Selection(this);
        this.store = new Store(this);
        this.canvas = new Canvas(canvasEl, this);

        // Tools
        this.tools = {
            select: new SelectTool(this),
            line: new LineTool(this),
            rect: new RectTool(this),
            circle: new CircleTool(this),
            arc: new ArcTool(this),
            polyline: new PolylineTool(this),
            freehand: new FreehandTool(this),
            eraser: new EraserTool(this),
            dimension: new DimensionTool(this),
            text: new TextTool(this),
            callout: new CalloutTool(this),
            arrow: new ArrowTool(this),
            symbol: new SymbolTool(this)
        };
        this.activeTool = this.tools.select;

        // UI modules
        this.toolbar = new Toolbar(this);
        this.layerPanel = new LayerPanel(this);
        this.propertyPanel = new PropertyPanel(this);
        this.projectDialog = new ProjectDialog(this);
        this.exportDialog = new ExportDialog(this);

        // Menu grid size
        document.getElementById('menu-grid-size')?.addEventListener('change', (e) => {
            this.grid.setSize(parseInt(e.target.value));
            this.updateGridStatus();
        });

        // Menu scale
        document.getElementById('menu-scale-value')?.addEventListener('input', (e) => {
            this.scaleValue = parseFloat(e.target.value) || 1;
        });
        document.getElementById('menu-scale-unit')?.addEventListener('change', (e) => {
            this.scaleUnit = e.target.value;
        });

        // Menu overlay click outside
        document.getElementById('menu-overlay')?.addEventListener('click', (e) => {
            if (e.target.id === 'menu-overlay') this.toggleMenu(false);
        });

        // Initialize storage
        await this.store.init();

        // Center viewport
        this.canvas.resetView();

        // Initial render
        this.requestRender();
        this.updateGridStatus();

        console.log('SiteSketch initialized');
    }

    get activeLayer() {
        return this.layers[this.activeLayerIndex];
    }

    // Tool management
    setTool(name) {
        if (this.activeTool) {
            this.activeTool.deactivate();
        }
        this.activeTool = this.tools[name] || this.tools.select;
        this.activeTool.activate();
        this.toolbar.setActiveTool(name);
        document.getElementById('status-tool').textContent =
            name.charAt(0).toUpperCase() + name.slice(1);
        this.requestRender();
    }

    // Layer management
    setActiveLayer(index) {
        this.activeLayerIndex = index;
        this.layerPanel.render();
    }

    addLayer(name) {
        this.layers.push({ name, objects: [], visible: true, locked: false });
        this.activeLayerIndex = this.layers.length - 1;
        this.layerPanel.render();
    }

    removeLayer(index) {
        if (this.layers.length <= 1) return;
        this.layers.splice(index, 1);
        if (this.activeLayerIndex >= this.layers.length) {
            this.activeLayerIndex = this.layers.length - 1;
        }
        this.layerPanel.render();
        this.requestRender();
    }

    // Grid snap
    snapPoint(x, y) {
        return this.grid.snap(x, y);
    }

    // Selection + deletion
    deleteSelected() {
        if (!this.selection.selected) return;
        const obj = this.selection.selected;
        for (const layer of this.layers) {
            const idx = layer.objects.indexOf(obj);
            if (idx !== -1) {
                this.history.execute(new RemoveObjectCommand(this, layer, obj));
                break;
            }
        }
    }

    // Rendering
    requestRender() {
        this.renderer?.requestRender();
        this.store?.scheduleAutoSave();
    }

    // Status bar updates
    updateCoords(x, y) {
        document.getElementById('status-coords').textContent =
            `X: ${Math.round(x)} Y: ${Math.round(y)}`;
    }

    updateZoom(zoom) {
        document.getElementById('status-zoom').textContent = `${Math.round(zoom * 100)}%`;
    }

    updateGridStatus() {
        document.getElementById('status-grid').textContent = `Grid: ${this.grid.size}px`;
    }

    updateHistoryButtons() {
        document.getElementById('btn-undo').disabled = !this.history.canUndo;
        document.getElementById('btn-redo').disabled = !this.history.canRedo;
    }

    setStatus(text) {
        document.getElementById('status-info').textContent = text;
    }

    // Menu toggle
    toggleMenu(show) {
        const el = document.getElementById('menu-overlay');
        if (show === undefined) show = el.classList.contains('hidden');
        el.classList.toggle('hidden', !show);
    }

    // Side panel toggle
    togglePanel() {
        const panel = document.getElementById('side-panel');
        const btn = document.getElementById('btn-toggle-panel');
        const isCollapsed = panel.classList.contains('collapsed');
        panel.classList.toggle('collapsed');
        btn.classList.toggle('panel-open', isCollapsed);
    }

    // Project serialization
    serializeProject() {
        return {
            id: this.projectId || `proj_${Date.now()}`,
            name: this.projectName,
            meta: this.projectMeta,
            createdAt: this.projectMeta.createdAt || Date.now(),
            updatedAt: Date.now(),
            scaleValue: this.scaleValue,
            scaleUnit: this.scaleUnit,
            gridSize: this.grid.size,
            layers: this.layers.map(layer => ({
                name: layer.name,
                visible: layer.visible,
                locked: layer.locked,
                objects: layer.objects.map(obj => obj.toJSON())
            })),
            activeLayerIndex: this.activeLayerIndex
        };
    }

    deserializeProject(data) {
        this.projectId = data.id;
        this.projectName = data.name || 'Untitled';
        this.projectMeta = data.meta || {};
        this.scaleValue = data.scaleValue || 1;
        this.scaleUnit = data.scaleUnit || 'ft';
        this.grid.setSize(data.gridSize || 20);

        this.layers = data.layers.map(layerData => ({
            name: layerData.name,
            visible: layerData.visible ?? true,
            locked: layerData.locked ?? false,
            objects: layerData.objects.map(objData => {
                const Cls = this._typeMap[objData.type];
                if (!Cls) {
                    console.warn('Unknown object type:', objData.type);
                    return null;
                }
                return Cls.fromJSON(objData);
            }).filter(Boolean)
        }));

        this.activeLayerIndex = data.activeLayerIndex || 0;
        if (this.activeLayerIndex >= this.layers.length) {
            this.activeLayerIndex = 0;
        }

        // Update UI
        document.getElementById('project-name').textContent = this.projectName;
        document.getElementById('menu-grid-size').value = this.grid.size;
        document.getElementById('menu-scale-value').value = this.scaleValue;
        document.getElementById('menu-scale-unit').value = this.scaleUnit;

        this.history.clear();
        this.selection.deselect();
        this.layerPanel.render();
        this.requestRender();
    }

    // Project management
    newProject(name, meta = {}) {
        this.projectId = `proj_${Date.now()}`;
        this.projectName = name;
        this.projectMeta = { ...meta, createdAt: Date.now() };
        this.layers = [
            { name: 'Background', objects: [], visible: true, locked: false },
            { name: 'Drawing', objects: [], visible: true, locked: false }
        ];
        this.activeLayerIndex = 1;
        this.history.clear();
        this.selection.deselect();
        this.canvas.resetView();

        document.getElementById('project-name').textContent = this.projectName;
        this.layerPanel.render();
        this.store.saveCurrentProject();
        this.requestRender();
    }

    async loadProject(id) {
        const data = await this.store.loadProject(id);
        if (data) {
            this.deserializeProject(data);
        }
    }
}

// Boot
const app = new App();
window._app = app; // expose for debugging
app.init().catch(err => console.error('Failed to initialize SiteSketch:', err));
