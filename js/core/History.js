// SiteSketch - History Module (Command Pattern Undo/Redo)

export class History {
    constructor(app) {
        this.app = app;
        this.undoStack = [];
        this.redoStack = [];
        this.maxSize = 100;
    }

    execute(command) {
        command.execute();
        this.undoStack.push(command);
        this.redoStack = [];
        if (this.undoStack.length > this.maxSize) {
            this.undoStack.shift();
        }
        this.app.updateHistoryButtons();
        this.app.requestRender();
    }

    undo() {
        if (this.undoStack.length === 0) return;
        const cmd = this.undoStack.pop();
        cmd.undo();
        this.redoStack.push(cmd);
        this.app.updateHistoryButtons();
        this.app.requestRender();
    }

    redo() {
        if (this.redoStack.length === 0) return;
        const cmd = this.redoStack.pop();
        cmd.execute();
        this.undoStack.push(cmd);
        this.app.updateHistoryButtons();
        this.app.requestRender();
    }

    get canUndo() { return this.undoStack.length > 0; }
    get canRedo() { return this.redoStack.length > 0; }

    clear() {
        this.undoStack = [];
        this.redoStack = [];
        this.app.updateHistoryButtons();
    }
}

// Command classes
export class AddObjectCommand {
    constructor(app, layer, obj) {
        this.app = app;
        this.layer = layer;
        this.obj = obj;
    }

    execute() {
        this.layer.objects.push(this.obj);
    }

    undo() {
        const idx = this.layer.objects.indexOf(this.obj);
        if (idx !== -1) this.layer.objects.splice(idx, 1);
        if (this.app.selection?.selected === this.obj) {
            this.app.selection.deselect();
        }
    }
}

export class RemoveObjectCommand {
    constructor(app, layer, obj) {
        this.app = app;
        this.layer = layer;
        this.obj = obj;
        this.index = -1;
    }

    execute() {
        this.index = this.layer.objects.indexOf(this.obj);
        if (this.index !== -1) this.layer.objects.splice(this.index, 1);
        if (this.app.selection?.selected === this.obj) {
            this.app.selection.deselect();
        }
    }

    undo() {
        if (this.index !== -1) {
            this.layer.objects.splice(this.index, 0, this.obj);
        } else {
            this.layer.objects.push(this.obj);
        }
    }
}

export class MoveObjectCommand {
    constructor(obj, dx, dy) {
        this.obj = obj;
        this.dx = dx;
        this.dy = dy;
    }

    execute() {
        this.obj.translate(this.dx, this.dy);
    }

    undo() {
        this.obj.translate(-this.dx, -this.dy);
    }
}

export class ModifyObjectCommand {
    constructor(obj, property, oldValue, newValue) {
        this.obj = obj;
        this.property = property;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }

    execute() {
        this.obj[this.property] = this.newValue;
    }

    undo() {
        this.obj[this.property] = this.oldValue;
    }
}

export class BatchCommand {
    constructor(commands) {
        this.commands = commands;
    }

    execute() {
        for (const cmd of this.commands) cmd.execute();
    }

    undo() {
        for (let i = this.commands.length - 1; i >= 0; i--) {
            this.commands[i].undo();
        }
    }
}
