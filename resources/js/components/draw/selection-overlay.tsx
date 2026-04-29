import { useRef } from 'react';
import { getSelectionBounds } from './lib/bounds';
import { HANDLE_SIZE } from './lib/constants';
import { worldToScreen } from './lib/coords';
import { useSceneStore } from './store';
import {
    beginHandleResize,
    continueHandleResize,
    endHandleResize,
} from './tools/select';
import type { HandleKey } from './types';

const HANDLES: { key: HandleKey; cursor: string; xFactor: number; yFactor: number }[] = [
    { key: 'nw', cursor: 'nwse-resize', xFactor: 0, yFactor: 0 },
    { key: 'n', cursor: 'ns-resize', xFactor: 0.5, yFactor: 0 },
    { key: 'ne', cursor: 'nesw-resize', xFactor: 1, yFactor: 0 },
    { key: 'e', cursor: 'ew-resize', xFactor: 1, yFactor: 0.5 },
    { key: 'se', cursor: 'nwse-resize', xFactor: 1, yFactor: 1 },
    { key: 's', cursor: 'ns-resize', xFactor: 0.5, yFactor: 1 },
    { key: 'sw', cursor: 'nesw-resize', xFactor: 0, yFactor: 1 },
    { key: 'w', cursor: 'ew-resize', xFactor: 0, yFactor: 0.5 },
];

interface SelectionOverlayProps {
    surfaceRef: React.RefObject<HTMLElement | null>;
}

export function SelectionOverlay({ surfaceRef }: SelectionOverlayProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<{ active: boolean; pointerId: number | null }>({
        active: false,
        pointerId: null,
    });

    const selectedIds = useSceneStore((s) => s.selectedIds);
    const elements = useSceneStore((s) => s.elements);
    const viewport = useSceneStore((s) => s.viewport);

    const selected = elements.filter((el) => selectedIds.includes(el.id));
    const bounds = getSelectionBounds(selected);

    if (!bounds || selected.length === 0) {
        return null;
    }

    const [screenX, screenY] = worldToScreen(bounds.x, bounds.y, viewport);
    const screenWidth = bounds.width * viewport.scale;
    const screenHeight = bounds.height * viewport.scale;

    const onHandlePointerDown = (handle: HandleKey, e: React.PointerEvent) => {
        const surface = surfaceRef.current;

        if (!surface) {
            return;
        }

        e.stopPropagation();
        e.preventDefault();
        const rect = surface.getBoundingClientRect();
        const screenPx = e.clientX - rect.left;
        const screenPy = e.clientY - rect.top;
        const v = useSceneStore.getState().viewport;
        const worldX = (screenPx - v.offsetX) / v.scale;
        const worldY = (screenPy - v.offsetY) / v.scale;
        beginHandleResize(handle, worldX, worldY);
        dragRef.current = { active: true, pointerId: e.pointerId };
        (e.target as Element).setPointerCapture(e.pointerId);
    };

    const onHandlePointerMove = (e: React.PointerEvent) => {
        if (!dragRef.current.active) {
            return;
        }

        const surface = surfaceRef.current;

        if (!surface) {
            return;
        }

        const rect = surface.getBoundingClientRect();
        const screenPx = e.clientX - rect.left;
        const screenPy = e.clientY - rect.top;
        const v = useSceneStore.getState().viewport;
        const worldX = (screenPx - v.offsetX) / v.scale;
        const worldY = (screenPy - v.offsetY) / v.scale;
        continueHandleResize(worldX, worldY, e.shiftKey);
    };

    const onHandlePointerUp = (e: React.PointerEvent) => {
        if (!dragRef.current.active) {
            return;
        }

        endHandleResize();
        dragRef.current = { active: false, pointerId: null };

        try {
            (e.target as Element).releasePointerCapture(e.pointerId);
        } catch {
            // already released
        }
    };

    const padding = 4;

    return (
        <div
            ref={overlayRef}
            className="pointer-events-none absolute"
            style={{
                left: screenX - padding,
                top: screenY - padding,
                width: screenWidth + padding * 2,
                height: screenHeight + padding * 2,
            }}
        >
            <div className="absolute inset-0 rounded-sm border border-blue-500/70" />
            {HANDLES.map((h) => {
                const left = h.xFactor * (screenWidth + padding * 2) - HANDLE_SIZE / 2;
                const top = h.yFactor * (screenHeight + padding * 2) - HANDLE_SIZE / 2;

                return (
                    <button
                        key={h.key}
                        type="button"
                        aria-label={`Resize ${h.key}`}
                        className="pointer-events-auto absolute rounded-sm border border-blue-600 bg-white shadow-sm hover:bg-blue-50"
                        style={{
                            width: HANDLE_SIZE,
                            height: HANDLE_SIZE,
                            left,
                            top,
                            cursor: h.cursor,
                        }}
                        onPointerDown={(e) => onHandlePointerDown(h.key, e)}
                        onPointerMove={onHandlePointerMove}
                        onPointerUp={onHandlePointerUp}
                        onPointerCancel={onHandlePointerUp}
                    />
                );
            })}
        </div>
    );
}
