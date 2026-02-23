// FieldSketch - Project Dialog UI

export class ProjectDialog {
    constructor(app) {
        this.app = app;
        this.dialogEl = document.getElementById('project-dialog');
        this.titleEl = document.getElementById('dialog-title');
        this.contentEl = document.getElementById('dialog-content');
        this.confirmEl = document.getElementById('dialog-confirm');
        this.cancelEl = document.getElementById('dialog-cancel');

        this.cancelEl.addEventListener('click', () => this.close());
        this.dialogEl.addEventListener('click', (e) => {
            if (e.target === this.dialogEl) this.close();
        });

        // Wire up menu items
        document.getElementById('menu-new')?.addEventListener('click', () => this.showNewProject());
        document.getElementById('menu-open')?.addEventListener('click', () => this.showOpenProject());
        document.getElementById('menu-save')?.addEventListener('click', () => {
            this.app.store.saveCurrentProject();
            this.app.toggleMenu(false);
            this.app.setStatus('Project saved');
            setTimeout(() => this.app.setStatus(''), 2000);
        });
    }

    close() {
        this.dialogEl.classList.add('hidden');
    }

    showNewProject() {
        this.app.toggleMenu(false);
        this.titleEl.textContent = 'New Project';
        this.contentEl.innerHTML = `
            <div class="form-field">
                <label>Project Name</label>
                <input type="text" id="new-project-name" value="Site Inspection ${new Date().toLocaleDateString()}">
            </div>
            <div class="form-field">
                <label>Site Location</label>
                <input type="text" id="new-project-location" placeholder="e.g. 123 Main St, Building A">
            </div>
            <div class="form-field">
                <label>Notes</label>
                <textarea id="new-project-notes" placeholder="Optional notes about the inspection"></textarea>
            </div>
        `;

        this.confirmEl.textContent = 'Create';
        this.confirmEl.onclick = () => {
            const name = document.getElementById('new-project-name').value.trim() || 'Untitled';
            const location = document.getElementById('new-project-location').value.trim();
            const notes = document.getElementById('new-project-notes').value.trim();
            this.app.newProject(name, { location, notes });
            this.close();
        };

        this.dialogEl.classList.remove('hidden');
        setTimeout(() => document.getElementById('new-project-name')?.select(), 100);
    }

    async showOpenProject() {
        this.app.toggleMenu(false);
        this.titleEl.textContent = 'Open Project';

        const projects = await this.app.store.listProjects();

        if (projects.length === 0) {
            this.contentEl.innerHTML = '<p class="placeholder-text">No saved projects</p>';
            this.confirmEl.style.display = 'none';
        } else {
            this.confirmEl.style.display = '';
            this.contentEl.innerHTML = '<div class="project-list"></div>';
            const listEl = this.contentEl.querySelector('.project-list');
            let selectedId = null;

            for (const proj of projects.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))) {
                const item = document.createElement('div');
                item.className = 'project-item';
                item.innerHTML = `
                    <div class="project-info">
                        <div class="project-title">${this.escapeHtml(proj.name || 'Untitled')}</div>
                        <div class="project-date">${new Date(proj.updatedAt || proj.createdAt).toLocaleString()}</div>
                    </div>
                `;

                const delBtn = document.createElement('button');
                delBtn.className = 'project-delete';
                delBtn.innerHTML = '&times;';
                delBtn.title = 'Delete project';
                delBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    if (!confirm(`Delete "${proj.name}"?`)) return;
                    await this.app.store.deleteProject(proj.id);
                    item.remove();
                });

                item.appendChild(delBtn);
                item.addEventListener('click', () => {
                    listEl.querySelectorAll('.project-item').forEach(i => i.classList.remove('selected'));
                    item.classList.add('selected');
                    selectedId = proj.id;
                });

                listEl.appendChild(item);
            }

            this.confirmEl.textContent = 'Open';
            this.confirmEl.onclick = async () => {
                if (!selectedId) return;
                await this.app.loadProject(selectedId);
                this.close();
            };
        }

        this.dialogEl.classList.remove('hidden');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
