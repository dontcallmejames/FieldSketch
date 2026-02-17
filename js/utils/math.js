// SiteSketch - Math Utilities

export function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

export function angleDeg(x1, y1, x2, y2) {
    return angle(x1, y1, x2, y2) * 180 / Math.PI;
}

export function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

export function snapToGrid(value, gridSize) {
    return Math.round(value / gridSize) * gridSize;
}

export function snapPointToGrid(x, y, gridSize) {
    return {
        x: snapToGrid(x, gridSize),
        y: snapToGrid(y, gridSize)
    };
}

export function pointToLineDistance(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return distance(px, py, x1, y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = clamp(t, 0, 1);
    return distance(px, py, x1 + t * dx, y1 + t * dy);
}

export function pointInRect(px, py, x, y, w, h) {
    return px >= x && px <= x + w && py >= y && py <= y + h;
}

export function pointInCircle(px, py, cx, cy, r) {
    return distance(px, py, cx, cy) <= r;
}

export function rectIntersectsRect(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
}

export function normalizeRect(x1, y1, x2, y2) {
    return {
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        w: Math.abs(x2 - x1),
        h: Math.abs(y2 - y1)
    };
}

export function midpoint(x1, y1, x2, y2) {
    return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
}

// Simplify a polyline using Ramer-Douglas-Peucker algorithm
export function simplifyPath(points, tolerance = 1) {
    if (points.length <= 2) return points;

    let maxDist = 0;
    let maxIdx = 0;
    const first = points[0];
    const last = points[points.length - 1];

    for (let i = 1; i < points.length - 1; i++) {
        const d = pointToLineDistance(
            points[i].x, points[i].y,
            first.x, first.y, last.x, last.y
        );
        if (d > maxDist) {
            maxDist = d;
            maxIdx = i;
        }
    }

    if (maxDist > tolerance) {
        const left = simplifyPath(points.slice(0, maxIdx + 1), tolerance);
        const right = simplifyPath(points.slice(maxIdx), tolerance);
        return left.slice(0, -1).concat(right);
    }

    return [first, last];
}

// Get bounding box of a set of points
export function boundingBox(points) {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    for (const p of points) {
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
    }
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

// Rotate a point around a center
export function rotatePoint(px, py, cx, cy, angleDeg) {
    const rad = angleDeg * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const dx = px - cx;
    const dy = py - cy;
    return {
        x: cx + dx * cos - dy * sin,
        y: cy + dx * sin + dy * cos
    };
}

// Format a number for display (trim trailing zeros)
export function formatNumber(num, decimals = 2) {
    return parseFloat(num.toFixed(decimals)).toString();
}

// Generate a unique ID
let idCounter = 0;
export function uid() {
    return `obj_${Date.now()}_${++idCounter}`;
}
