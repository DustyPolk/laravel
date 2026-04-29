import type { Point, Viewport } from '../types';

export function screenToWorld(
    screenX: number,
    screenY: number,
    viewport: Viewport,
): Point {
    return [
        (screenX - viewport.offsetX) / viewport.scale,
        (screenY - viewport.offsetY) / viewport.scale,
    ];
}

export function worldToScreen(
    worldX: number,
    worldY: number,
    viewport: Viewport,
): Point {
    return [
        worldX * viewport.scale + viewport.offsetX,
        worldY * viewport.scale + viewport.offsetY,
    ];
}

export function getDevicePixelRatio(): number {
    return typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
}
