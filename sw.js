// SiteSketch - Service Worker

const CACHE_NAME = 'sitesketch-v1';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './css/styles.css',
    './js/app.js',
    './js/core/Canvas.js',
    './js/core/Grid.js',
    './js/core/Renderer.js',
    './js/core/History.js',
    './js/core/Selection.js',
    './js/core/Store.js',
    './js/objects/DrawObject.js',
    './js/objects/Line.js',
    './js/objects/Rectangle.js',
    './js/objects/Circle.js',
    './js/objects/Arc.js',
    './js/objects/Polyline.js',
    './js/objects/Freehand.js',
    './js/objects/TextLabel.js',
    './js/objects/Dimension.js',
    './js/objects/Callout.js',
    './js/objects/Arrow.js',
    './js/objects/Symbol.js',
    './js/objects/ImageObject.js',
    './js/tools/Tool.js',
    './js/tools/SelectTool.js',
    './js/tools/LineTool.js',
    './js/tools/RectTool.js',
    './js/tools/CircleTool.js',
    './js/tools/ArcTool.js',
    './js/tools/PolylineTool.js',
    './js/tools/FreehandTool.js',
    './js/tools/EraserTool.js',
    './js/tools/DimensionTool.js',
    './js/tools/TextTool.js',
    './js/tools/CalloutTool.js',
    './js/tools/ArrowTool.js',
    './js/tools/SymbolTool.js',
    './js/ui/Toolbar.js',
    './js/ui/LayerPanel.js',
    './js/ui/PropertyPanel.js',
    './js/ui/ProjectDialog.js',
    './js/ui/ExportDialog.js',
    './js/utils/math.js',
    './js/utils/touch.js',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cached) => {
            return cached || fetch(event.request).catch(() => {
                // Return a basic offline page if both cache and network fail
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
