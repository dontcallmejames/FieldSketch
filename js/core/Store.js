// SiteSketch - IndexedDB Storage Module

const DB_NAME = 'SiteSketchDB';
const DB_VERSION = 1;
const PROJECTS_STORE = 'projects';

export class Store {
    constructor(app) {
        this.app = app;
        this.db = null;
        this.autoSaveTimer = null;
        this.autoSaveDelay = 2000;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
                    db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
                }
            };
            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve();
            };
            request.onerror = (e) => reject(e.target.error);
        });
    }

    scheduleAutoSave() {
        if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = setTimeout(() => {
            this.saveCurrentProject();
        }, this.autoSaveDelay);
    }

    async saveCurrentProject() {
        if (!this.db || !this.app.projectId) return;
        const data = this.app.serializeProject();
        return this._put(PROJECTS_STORE, data);
    }

    async loadProject(id) {
        return this._get(PROJECTS_STORE, id);
    }

    async listProjects() {
        return this._getAll(PROJECTS_STORE);
    }

    async deleteProject(id) {
        return this._delete(PROJECTS_STORE, id);
    }

    // IndexedDB helpers
    _put(storeName, data) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readwrite');
            tx.objectStore(storeName).put(data);
            tx.oncomplete = () => resolve();
            tx.onerror = (e) => reject(e.target.error);
        });
    }

    _get(storeName, key) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readonly');
            const req = tx.objectStore(storeName).get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = (e) => reject(e.target.error);
        });
    }

    _getAll(storeName) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readonly');
            const req = tx.objectStore(storeName).getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = (e) => reject(e.target.error);
        });
    }

    _delete(storeName, key) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readwrite');
            tx.objectStore(storeName).delete(key);
            tx.oncomplete = () => resolve();
            tx.onerror = (e) => reject(e.target.error);
        });
    }
}
