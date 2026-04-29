import rough from 'roughjs';
import type { Element } from '../types';
import { getSelectionBounds } from './bounds';
import { drawScene } from './render';

export async function exportToPng(elements: Element[], filename: string): Promise<void> {
    if (elements.length === 0) {
        return;
    }

    const padding = 32;
    const bounds = getSelectionBounds(elements);

    if (!bounds) {
        return;
    }

    const dpr = window.devicePixelRatio || 1;
    const width = (bounds.width + padding * 2) * dpr;
    const height = (bounds.height + padding * 2) * dpr;

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.floor(width));
    canvas.height = Math.max(1, Math.floor(height));

    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return;
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const rc = rough.canvas(canvas);
    drawScene(
        { ctx, rc },
        elements,
        {
            offsetX: -bounds.x + padding,
            offsetY: -bounds.y + padding,
            scale: 1,
        },
        dpr,
    );

    canvas.toBlob((blob) => {
        if (!blob) {
            return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
}

export async function generateThumbnail(elements: Element[], maxSize = 320): Promise<string | null> {
    if (elements.length === 0) {
        return null;
    }

    const bounds = getSelectionBounds(elements);

    if (!bounds || bounds.width === 0 || bounds.height === 0) {
        return null;
    }

    const padding = 16;
    const w = bounds.width + padding * 2;
    const h = bounds.height + padding * 2;
    const scale = Math.min(maxSize / w, maxSize / h, 1);

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.floor(w * scale));
    canvas.height = Math.max(1, Math.floor(h * scale));
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return null;
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const rc = rough.canvas(canvas);
    drawScene(
        { ctx, rc },
        elements,
        {
            offsetX: (-bounds.x + padding) * scale,
            offsetY: (-bounds.y + padding) * scale,
            scale,
        },
        1,
    );

    return canvas.toDataURL('image/png');
}
