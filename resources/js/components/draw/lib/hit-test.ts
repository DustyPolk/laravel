import type { Element, Point } from '../types';
import { getElementBounds  } from './bounds';
import type {Bounds} from './bounds';
import { HIT_THRESHOLD } from './constants';

function pointInBounds(px: number, py: number, b: Bounds, padding = 0): boolean {
    return (
        px >= b.x - padding &&
        px <= b.x + b.width + padding &&
        py >= b.y - padding &&
        py <= b.y + b.height + padding
    );
}

function distanceToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy;

    if (lenSq === 0) {
        return Math.hypot(px - ax, py - ay);
    }

    let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + t * dx;
    const cy = ay + t * dy;

    return Math.hypot(px - cx, py - cy);
}

function pointInPolygon(px: number, py: number, polygon: Point[]): boolean {
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];
        const intersect =
            yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-9) + xi;

        if (intersect) {
            inside = !inside;
        }
    }

    return inside;
}

export function hitTestElement(worldX: number, worldY: number, element: Element, threshold = HIT_THRESHOLD): boolean {
    const bounds = getElementBounds(element);

    if (!pointInBounds(worldX, worldY, bounds, threshold)) {
        return false;
    }

    const filled = element.fillColor !== 'transparent' && element.fillStyle !== 'none';

    switch (element.type) {
        case 'rectangle': {
            if (filled) {
                return pointInBounds(worldX, worldY, bounds);
            }

            const distToTop = Math.abs(worldY - bounds.y);
            const distToBottom = Math.abs(worldY - (bounds.y + bounds.height));
            const distToLeft = Math.abs(worldX - bounds.x);
            const distToRight = Math.abs(worldX - (bounds.x + bounds.width));
            const onHorizontalEdge =
                worldX >= bounds.x - threshold && worldX <= bounds.x + bounds.width + threshold &&
                (distToTop <= threshold || distToBottom <= threshold);
            const onVerticalEdge =
                worldY >= bounds.y - threshold && worldY <= bounds.y + bounds.height + threshold &&
                (distToLeft <= threshold || distToRight <= threshold);

            return onHorizontalEdge || onVerticalEdge;
        }
        case 'ellipse': {
            const cx = bounds.x + bounds.width / 2;
            const cy = bounds.y + bounds.height / 2;
            const rx = Math.max(bounds.width / 2, 1);
            const ry = Math.max(bounds.height / 2, 1);
            const norm = ((worldX - cx) / rx) ** 2 + ((worldY - cy) / ry) ** 2;

            if (filled) {
                return norm <= 1.05;
            }

            return Math.abs(norm - 1) < threshold / Math.min(rx, ry);
        }
        case 'diamond': {
            const cx = bounds.x + bounds.width / 2;
            const cy = bounds.y + bounds.height / 2;
            const polygon: Point[] = [
                [cx, bounds.y],
                [bounds.x + bounds.width, cy],
                [cx, bounds.y + bounds.height],
                [bounds.x, cy],
            ];

            if (filled) {
                return pointInPolygon(worldX, worldY, polygon);
            }

            for (let i = 0; i < 4; i++) {
                const a = polygon[i];
                const b = polygon[(i + 1) % 4];

                if (distanceToSegment(worldX, worldY, a[0], a[1], b[0], b[1]) <= threshold) {
                    return true;
                }
            }

            return false;
        }
        case 'line':
        case 'arrow':
        case 'freedraw': {
            const points = element.points;

            for (let i = 0; i < points.length - 1; i++) {
                const ax = element.x + points[i][0];
                const ay = element.y + points[i][1];
                const bx = element.x + points[i + 1][0];
                const by = element.y + points[i + 1][1];

                if (distanceToSegment(worldX, worldY, ax, ay, bx, by) <= threshold) {
                    return true;
                }
            }

            return false;
        }
        case 'text':
            return pointInBounds(worldX, worldY, bounds);
    }
}

export function hitTestTopElement(worldX: number, worldY: number, elements: Element[]): Element | null {
    for (let i = elements.length - 1; i >= 0; i--) {
        if (hitTestElement(worldX, worldY, elements[i])) {
            return elements[i];
        }
    }

    return null;
}

export function elementsInMarquee(marquee: Bounds, elements: Element[]): Element[] {
    const result: Element[] = [];

    for (const element of elements) {
        const b = getElementBounds(element);
        const intersects =
            b.x < marquee.x + marquee.width &&
            b.x + b.width > marquee.x &&
            b.y < marquee.y + marquee.height &&
            b.y + b.height > marquee.y;

        if (intersects) {
            result.push(element);
        }
    }

    return result;
}
