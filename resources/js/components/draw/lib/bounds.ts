import type { Element, HandleKey, Point } from '../types';

export interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function getElementBounds(element: Element): Bounds {
    if (element.type === 'line' || element.type === 'arrow' || element.type === 'freedraw') {
        const points = element.points;

        if (points.length === 0) {
            return { x: element.x, y: element.y, width: 0, height: 0 };
        }

        let minX = points[0][0];
        let minY = points[0][1];
        let maxX = points[0][0];
        let maxY = points[0][1];

        for (const [px, py] of points) {
            if (px < minX) {
                minX = px;
            }

            if (py < minY) {
                minY = py;
            }

            if (px > maxX) {
                maxX = px;
            }

            if (py > maxY) {
                maxY = py;
            }
        }

        return {
            x: element.x + minX,
            y: element.y + minY,
            width: maxX - minX,
            height: maxY - minY,
        };
    }

    return {
        x: Math.min(element.x, element.x + element.width),
        y: Math.min(element.y, element.y + element.height),
        width: Math.abs(element.width),
        height: Math.abs(element.height),
    };
}

export function getSelectionBounds(elements: Element[]): Bounds | null {
    if (elements.length === 0) {
        return null;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const element of elements) {
        const bounds = getElementBounds(element);

        if (bounds.x < minX) {
            minX = bounds.x;
        }

        if (bounds.y < minY) {
            minY = bounds.y;
        }

        if (bounds.x + bounds.width > maxX) {
            maxX = bounds.x + bounds.width;
        }

        if (bounds.y + bounds.height > maxY) {
            maxY = bounds.y + bounds.height;
        }
    }

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
}

export function getHandlePosition(bounds: Bounds, handle: HandleKey): Point {
    const { x, y, width, height } = bounds;

    switch (handle) {
        case 'nw':
            return [x, y];
        case 'n':
            return [x + width / 2, y];
        case 'ne':
            return [x + width, y];
        case 'e':
            return [x + width, y + height / 2];
        case 'se':
            return [x + width, y + height];
        case 's':
            return [x + width / 2, y + height];
        case 'sw':
            return [x, y + height];
        case 'w':
            return [x, y + height / 2];
        case 'rotate':
            return [x + width / 2, y - 24];
    }
}

export function resizeBounds(
    original: Bounds,
    handle: HandleKey,
    worldX: number,
    worldY: number,
    keepAspect: boolean,
): Bounds {
    let { x, y, width, height } = original;
    let right = x + width;
    let bottom = y + height;

    switch (handle) {
        case 'nw':
            x = worldX;
            y = worldY;
            break;
        case 'n':
            y = worldY;
            break;
        case 'ne':
            right = worldX;
            y = worldY;
            break;
        case 'e':
            right = worldX;
            break;
        case 'se':
            right = worldX;
            bottom = worldY;
            break;
        case 's':
            bottom = worldY;
            break;
        case 'sw':
            x = worldX;
            bottom = worldY;
            break;
        case 'w':
            x = worldX;
            break;
        case 'rotate':
            return original;
    }

    width = right - x;
    height = bottom - y;

    if (keepAspect && original.width !== 0 && original.height !== 0) {
        const ratio = original.width / original.height;
        const absW = Math.abs(width);
        const absH = Math.abs(height);

        if (absW / Math.max(absH, 1e-6) > ratio) {
            const newH = absW / ratio;
            height = height < 0 ? -newH : newH;
        } else {
            const newW = absH * ratio;
            width = width < 0 ? -newW : newW;
        }
    }

    return { x, y, width, height };
}

export function applyBoundsToElement(element: Element, original: Bounds, next: Bounds): Element {
    const sx = original.width === 0 ? 1 : next.width / original.width;
    const sy = original.height === 0 ? 1 : next.height / original.height;

    if (element.type === 'line' || element.type === 'arrow' || element.type === 'freedraw') {
        const newPoints = element.points.map<Point>(([px, py]) => [px * sx, py * sy]);

        return {
            ...element,
            x: next.x,
            y: next.y,
            width: next.width,
            height: next.height,
            points: newPoints,
            version: element.version + 1,
        };
    }

    return {
        ...element,
        x: next.x,
        y: next.y,
        width: next.width,
        height: next.height,
        version: element.version + 1,
    };
}
