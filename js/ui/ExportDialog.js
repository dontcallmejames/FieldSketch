// SiteSketch - Export Dialog UI

export class ExportDialog {
    constructor(app) {
        this.app = app;

        document.getElementById('menu-export-png')?.addEventListener('click', () => this.exportPNG());
        document.getElementById('menu-export-pdf')?.addEventListener('click', () => this.exportPDF());
        document.getElementById('menu-import-image')?.addEventListener('click', () => this.importImage());
        document.getElementById('menu-import-pdf')?.addEventListener('click', () => this.importPDF());

        // File input handlers
        document.getElementById('file-image')?.addEventListener('change', (e) => this.handleImageFile(e));
        document.getElementById('file-pdf')?.addEventListener('change', (e) => this.handlePDFFile(e));
    }

    exportPNG() {
        this.app.toggleMenu(false);

        const canvas = this.app.canvas;
        const ctx = canvas.ctx;

        // Create an offscreen canvas
        const offscreen = document.createElement('canvas');
        const bounds = this.getContentBounds();
        const padding = 40;

        offscreen.width = (bounds.w + padding * 2) * 2;
        offscreen.height = (bounds.h + padding * 2) * 2;
        const offCtx = offscreen.getContext('2d');
        offCtx.scale(2, 2);

        // White background
        offCtx.fillStyle = '#ffffff';
        offCtx.fillRect(0, 0, bounds.w + padding * 2, bounds.h + padding * 2);

        // Draw grid if visible
        if (this.app.grid.visible) {
            this.drawGridExport(offCtx, bounds, padding);
        }

        // Draw all objects
        offCtx.save();
        offCtx.translate(padding - bounds.x, padding - bounds.y);
        for (const layer of this.app.layers) {
            if (!layer.visible) continue;
            for (const obj of layer.objects) {
                obj.draw(offCtx, this.app);
            }
        }
        offCtx.restore();

        // Download
        const link = document.createElement('a');
        link.download = `${this.app.projectName || 'drawing'}.png`;
        link.href = offscreen.toDataURL('image/png');
        link.click();
    }

    exportPDF() {
        this.app.toggleMenu(false);

        // Check if jsPDF is available
        if (typeof window.jspdf === 'undefined') {
            alert('PDF export requires jsPDF library. Place jspdf.min.js in the lib/ folder.');
            return;
        }

        const bounds = this.getContentBounds();
        const padding = 20;
        const width = bounds.w + padding * 2;
        const height = bounds.h + padding * 2;

        const orientation = width > height ? 'landscape' : 'portrait';
        const pdf = new window.jspdf.jsPDF({
            orientation,
            unit: 'px',
            format: [width, height]
        });

        // Render to canvas first, then add as image
        const offscreen = document.createElement('canvas');
        offscreen.width = width * 2;
        offscreen.height = height * 2;
        const offCtx = offscreen.getContext('2d');
        offCtx.scale(2, 2);

        offCtx.fillStyle = '#ffffff';
        offCtx.fillRect(0, 0, width, height);

        if (this.app.grid.visible) {
            this.drawGridExport(offCtx, bounds, padding);
        }

        offCtx.save();
        offCtx.translate(padding - bounds.x, padding - bounds.y);
        for (const layer of this.app.layers) {
            if (!layer.visible) continue;
            for (const obj of layer.objects) {
                obj.draw(offCtx, this.app);
            }
        }
        offCtx.restore();

        const imgData = offscreen.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        pdf.save(`${this.app.projectName || 'drawing'}.pdf`);
    }

    importImage() {
        this.app.toggleMenu(false);
        document.getElementById('file-image').click();
    }

    importPDF() {
        this.app.toggleMenu(false);
        document.getElementById('file-pdf').click();
    }

    handleImageFile(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                const { ImageObject } = this.app._objectClasses;
                const imgObj = new ImageObject({
                    x: 0, y: 0,
                    w: img.naturalWidth,
                    h: img.naturalHeight,
                    imageData: ev.target.result,
                    opacity: 0.5
                });
                imgObj._img = img;
                imgObj._loaded = true;

                const { AddObjectCommand } = this.app._commandClasses;
                this.app.history.execute(
                    new AddObjectCommand(this.app, this.app.activeLayer, imgObj)
                );
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }

    async handlePDFFile(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (typeof pdfjsLib === 'undefined') {
            alert('PDF import requires pdf.js library. Place pdf.min.js and pdf.worker.min.js in the lib/ folder.');
            e.target.value = '';
            return;
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        await page.render({ canvasContext: ctx, viewport }).promise;

        const dataUrl = canvas.toDataURL('image/png');
        const { ImageObject } = this.app._objectClasses;
        const imgObj = new ImageObject({
            x: 0, y: 0,
            w: viewport.width / 2,
            h: viewport.height / 2,
            imageData: dataUrl,
            opacity: 0.5
        });
        imgObj._loadImage();

        const { AddObjectCommand } = this.app._commandClasses;
        this.app.history.execute(
            new AddObjectCommand(this.app, this.app.activeLayer, imgObj)
        );

        e.target.value = '';
    }

    getContentBounds() {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        for (const layer of this.app.layers) {
            for (const obj of layer.objects) {
                const b = obj.getBounds();
                if (!b) continue;
                minX = Math.min(minX, b.x);
                minY = Math.min(minY, b.y);
                maxX = Math.max(maxX, b.x + b.w);
                maxY = Math.max(maxY, b.y + b.h);
            }
        }

        if (minX === Infinity) {
            return { x: 0, y: 0, w: 800, h: 600 };
        }

        return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }

    drawGridExport(ctx, bounds, padding) {
        const grid = this.app.grid;
        ctx.save();
        const startX = Math.floor(bounds.x / grid.size) * grid.size;
        const startY = Math.floor(bounds.y / grid.size) * grid.size;
        const endX = Math.ceil((bounds.x + bounds.w) / grid.size) * grid.size;
        const endY = Math.ceil((bounds.y + bounds.h) / grid.size) * grid.size;

        // Minor lines
        ctx.strokeStyle = 'rgba(180, 180, 200, 0.3)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let x = startX; x <= endX; x += grid.size) {
            const idx = Math.round(x / grid.size);
            if (idx % grid.majorEvery === 0) continue;
            ctx.moveTo(x - bounds.x + padding, 0);
            ctx.lineTo(x - bounds.x + padding, bounds.h + padding * 2);
        }
        for (let y = startY; y <= endY; y += grid.size) {
            const idx = Math.round(y / grid.size);
            if (idx % grid.majorEvery === 0) continue;
            ctx.moveTo(0, y - bounds.y + padding);
            ctx.lineTo(bounds.w + padding * 2, y - bounds.y + padding);
        }
        ctx.stroke();

        // Major lines
        ctx.strokeStyle = 'rgba(180, 180, 200, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = startX; x <= endX; x += grid.size) {
            const idx = Math.round(x / grid.size);
            if (idx % grid.majorEvery !== 0) continue;
            ctx.moveTo(x - bounds.x + padding, 0);
            ctx.lineTo(x - bounds.x + padding, bounds.h + padding * 2);
        }
        for (let y = startY; y <= endY; y += grid.size) {
            const idx = Math.round(y / grid.size);
            if (idx % grid.majorEvery !== 0) continue;
            ctx.moveTo(0, y - bounds.y + padding);
            ctx.lineTo(bounds.w + padding * 2, y - bounds.y + padding);
        }
        ctx.stroke();
        ctx.restore();
    }
}
