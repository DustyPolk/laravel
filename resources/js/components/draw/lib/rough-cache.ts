import type { Drawable } from 'roughjs/bin/core';
import type { RoughGenerator } from 'roughjs/bin/generator';
import type { Element } from '../types';

const cache = new Map<string, Drawable>();
const order: string[] = [];
const MAX_ENTRIES = 500;

function cacheKey(element: Element): string {
    return `${element.id}:${element.version}`;
}

function evictIfNeeded(): void {
    while (order.length > MAX_ENTRIES) {
        const oldest = order.shift();

        if (oldest) {
            cache.delete(oldest);
        }
    }
}

function fillStyleFor(element: Element): string | undefined {
    if (element.fillColor === 'transparent' || element.fillStyle === 'none') {
        return undefined;
    }

    return element.fillStyle;
}

function strokeDashFor(element: Element): number[] | undefined {
    if (element.strokeStyle === 'dashed') {
        return [10, 6];
    }

    if (element.strokeStyle === 'dotted') {
        return [2, 4];
    }

    return undefined;
}

function makeOptions(element: Element) {
    const fillStyle = fillStyleFor(element);

    return {
        seed: element.seed,
        roughness: element.roughness,
        stroke: element.strokeColor,
        strokeWidth: element.strokeWidth,
        fill: fillStyle ? element.fillColor : undefined,
        fillStyle: fillStyle ?? 'solid',
        fillWeight: element.strokeWidth / 2,
        hachureGap: 8,
        strokeLineDash: strokeDashFor(element),
    };
}

export function getDrawable(generator: RoughGenerator, element: Element): Drawable | null {
    const key = cacheKey(element);
    const cached = cache.get(key);

    if (cached) {
        return cached;
    }

    let drawable: Drawable | null = null;
    const opts = makeOptions(element);

    switch (element.type) {
        case 'rectangle':
            drawable = generator.rectangle(0, 0, element.width, element.height, opts);
            break;
        case 'ellipse':
            drawable = generator.ellipse(
                element.width / 2,
                element.height / 2,
                Math.abs(element.width),
                Math.abs(element.height),
                opts,
            );
            break;
        case 'diamond': {
            const w = element.width;
            const h = element.height;
            drawable = generator.polygon(
                [
                    [w / 2, 0],
                    [w, h / 2],
                    [w / 2, h],
                    [0, h / 2],
                ],
                opts,
            );
            break;
        }
        case 'line':
        case 'arrow': {
            const points = element.points;

            if (points.length >= 2) {
                drawable = generator.linearPath(points, opts);
            }

            break;
        }
        case 'freedraw':
            return null;
        case 'text':
            return null;
    }

    if (drawable) {
        cache.set(key, drawable);
        order.push(key);
        evictIfNeeded();
    }

    return drawable;
}

export function clearRoughCache(): void {
    cache.clear();
    order.length = 0;
}
