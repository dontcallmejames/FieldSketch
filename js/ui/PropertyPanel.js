// FieldSketch - Property Panel UI

export class PropertyPanel {
    constructor(app) {
        this.app = app;
        this.fieldsEl = document.getElementById('property-fields');
    }

    update() {
        const obj = this.app.selection?.selected;
        if (!obj) {
            this.fieldsEl.innerHTML = '<p class="placeholder-text">Select an object to edit properties</p>';
            return;
        }

        this.fieldsEl.innerHTML = '';

        // Common properties
        this.addColorField('Stroke Color', obj.strokeColor, (v) => { obj.strokeColor = v; });
        this.addSelectField('Stroke Width', obj.strokeWidth, [1, 2, 3, 4, 6, 8], (v) => { obj.strokeWidth = parseInt(v); });
        this.addSelectField('Stroke Style', obj.strokeStyle, ['solid', 'dashed', 'dotted'], (v) => { obj.strokeStyle = v; });
        this.addSliderField('Opacity', obj.opacity, 0, 1, 0.05, (v) => { obj.opacity = parseFloat(v); });

        // Type-specific properties
        if (obj.type === 'text') {
            this.addTextField('Text', obj.text, (v) => { obj.text = v; });
            this.addNumberField('Font Size', obj.fontSize, 6, 200, (v) => { obj.fontSize = parseInt(v); });
        }

        if (obj.type === 'callout') {
            this.addTextField('Text', obj.text, (v) => { obj.text = v; });
            this.addNumberField('Font Size', obj.fontSize, 6, 72, (v) => { obj.fontSize = parseInt(v); });
        }

        if (obj.type === 'dimension') {
            this.addTextField('Override Text', obj.textOverride || '', (v) => { obj.textOverride = v || null; });
            this.addNumberField('Offset', obj.offset, -200, 200, (v) => { obj.offset = parseInt(v); });
            this.addNumberField('Font Size', obj.fontSize, 6, 72, (v) => { obj.fontSize = parseInt(v); });
        }

        if (obj.type === 'symbol') {
            this.addTextField('Label', obj.label, (v) => { obj.label = v; });
            this.addNumberField('Size', obj.size, 10, 200, (v) => { obj.size = parseInt(v); });
        }

        if (obj.type === 'image') {
            this.addSliderField('Opacity', obj.opacity, 0, 1, 0.05, (v) => { obj.opacity = parseFloat(v); });
            this.addNumberField('Width', obj.w, 1, 10000, (v) => { obj.w = parseInt(v); });
            this.addNumberField('Height', obj.h, 1, 10000, (v) => { obj.h = parseInt(v); });
        }

        if (obj.type === 'rect') {
            this.addColorField('Fill Color', obj.fillColor || '', (v) => { obj.fillColor = v || null; });
        }

        if (obj.type === 'circle') {
            this.addColorField('Fill Color', obj.fillColor || '', (v) => { obj.fillColor = v || null; });
        }

        if (obj.type === 'polyline' && obj.closed) {
            this.addColorField('Fill Color', obj.fillColor || '', (v) => { obj.fillColor = v || null; });
        }

        if (obj.type === 'arrow') {
            this.addCheckboxField('Double Head', obj.doubleHead, (v) => { obj.doubleHead = v; });
        }
    }

    addTextField(label, value, onChange) {
        const group = this.createGroup(label);
        const input = document.createElement('textarea');
        input.value = value;
        input.rows = 2;
        input.addEventListener('input', () => { onChange(input.value); this.app.requestRender(); });
        group.appendChild(input);
        this.fieldsEl.appendChild(group);
    }

    addNumberField(label, value, min, max, onChange) {
        const group = this.createGroup(label);
        const input = document.createElement('input');
        input.type = 'number';
        input.value = value;
        input.min = min;
        input.max = max;
        input.addEventListener('input', () => { onChange(input.value); this.app.requestRender(); });
        group.appendChild(input);
        this.fieldsEl.appendChild(group);
    }

    addColorField(label, value, onChange) {
        const group = this.createGroup(label);
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '4px';
        row.style.alignItems = 'center';
        const input = document.createElement('input');
        input.type = 'color';
        input.value = value || '#000000';
        input.style.width = '32px';
        input.style.height = '24px';
        input.addEventListener('input', () => { onChange(input.value); this.app.requestRender(); });

        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear';
        clearBtn.className = 'small-btn';
        clearBtn.style.fontSize = '10px';
        clearBtn.style.width = 'auto';
        clearBtn.style.padding = '2px 6px';
        clearBtn.addEventListener('click', () => { onChange(null); input.value = '#000000'; this.app.requestRender(); });

        row.appendChild(input);
        row.appendChild(clearBtn);
        group.appendChild(row);
        this.fieldsEl.appendChild(group);
    }

    addSelectField(label, value, options, onChange) {
        const group = this.createGroup(label);
        const select = document.createElement('select');
        for (const opt of options) {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            if (String(opt) === String(value)) option.selected = true;
            select.appendChild(option);
        }
        select.addEventListener('change', () => { onChange(select.value); this.app.requestRender(); });
        group.appendChild(select);
        this.fieldsEl.appendChild(group);
    }

    addSliderField(label, value, min, max, step, onChange) {
        const group = this.createGroup(label);
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '8px';
        row.style.alignItems = 'center';
        const input = document.createElement('input');
        input.type = 'range';
        input.min = min;
        input.max = max;
        input.step = step;
        input.value = value;
        input.style.flex = '1';
        const display = document.createElement('span');
        display.textContent = parseFloat(value).toFixed(2);
        display.style.fontSize = '11px';
        display.style.minWidth = '32px';
        input.addEventListener('input', () => {
            onChange(input.value);
            display.textContent = parseFloat(input.value).toFixed(2);
            this.app.requestRender();
        });
        row.appendChild(input);
        row.appendChild(display);
        group.appendChild(row);
        this.fieldsEl.appendChild(group);
    }

    addCheckboxField(label, value, onChange) {
        const group = this.createGroup(label);
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = value;
        input.addEventListener('change', () => { onChange(input.checked); this.app.requestRender(); });
        group.appendChild(input);
        this.fieldsEl.appendChild(group);
    }

    createGroup(label) {
        const group = document.createElement('div');
        group.className = 'property-group';
        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        group.appendChild(labelEl);
        return group;
    }
}
