import { useRef } from 'react';
import { getSelectionBounds } from './lib/bounds';
import { HANDLE_SIZE } from './lib/constants';
import { worldToScreen } from './lib/coords';
import { useSceneStore } from './store';
import {
    beginEndpointDrag,
    beginHandleResize,
    continueEndpointDrag,
    continueHandleResize,
    endEndpointDrag,
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
    const dragRef = useRef<{ active: boolean; pointerId: number | null; mode: 'box' | 'endpoint' }>({
        active: false,
        pointerId: null,
        mode: 'box',
    });

    const selectedIds = useSceneStore((s) => s.selectedIds);
    const elements = useSceneStore((s) => s.elements);
    const viewport = useSceneStore((s) => s.viewport);

    const selected = elements.filter((el) => selectedIds.includes(el.id));
    const bounds = getSelectionBounds(selected);

    if (!bounds || selected.length === 0) {
        return null;
    }

    const isSingleLinear =
        selected.length === 1 && (selected[0].type === 'line' || selected[0].type === 'arrow');

    const [screenX, screenY] = worldToScreen(bounds.x, bounds.y, viewport);
    const screenWidth = bounds.width * viewport.scale;
    const screenHeight = bounds.height * viewport.scale;

    const worldFromEvent = (e: React.PointerEvent) => {
        const surface = surfaceRef.current;

        if (!surface) {
            return null;
        }

        const rect = surface.getBoundingClientRect();
        const screenPx = e.clientX - rect.left;
        const screenPy = e.clientY - rect.top;
        const v = useSceneStore.getState().viewport;

        return {
            worldX: (screenPx - v.offsetX) / v.scale,
            worldY: (screenPy - v.offsetY) / v.scale,
        };
    };

    const onHandlePointerDown = (handle: HandleKey, e: React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const w = worldFromEvent(e);

        if (!w) {
            return;
        }

        beginHandleResize(handle, w.worldX, w.worldY);
        dragRef.current = { active: true, pointerId: e.pointerId, mode: 'box' };
        (e.target as Element).setPointerCapture(e.pointerId);
    };

    const onHandlePointerMove = (e: React.PointerEvent) => {
        if (!dragRef.current.active) {
            return;
        }

        const w = worldFromEvent(e);

        if (!w) {
            return;
        }

        if (dragRef.current.mode === 'box') {
            continueHandleResize(w.worldX, w.worldY, e.shiftKey);
        } else {
            continueEndpointDrag(w.worldX, w.worldY, e.shiftKey);
        }
    };

    const onHandlePointerUp = (e: React.PointerEvent) => {
        if (!dragRef.current.active) {
            return;
        }

        if (dragRef.current.mode === 'box') {
            endHandleResize();
        } else {
            endEndpointDrag();
        }

        dragRef.current = { active: false, pointerId: null, mode: 'box' };

        try {
            (e.target as Element).releasePointerCapture(e.pointerId);
        } catch {
            // already released
        }
    };

    const onEndpointPointerDown = (pointIndex: number, e: React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (!isSingleLinear) {
            return;
        }

        beginEndpointDrag(selected[0].id, pointIndex);
        dragRef.current = { active: true, pointerId: e.pointerId, mode: 'endpoint' };
        (e.target as Element).setPointerCapture(e.pointerId);
    };

    const padding = 4;

    if (isSingleLinear) {
        const linear = selected[0];

        if (linear.type !== 'line' && linear.type !== 'arrow') {
            return null;
        }

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
                <div className="absolute inset-0 rounded-sm border border-dashed border-blue-500/50" />
                {linear.points.map((point, index) => {
                    const [worldPx, worldPy] = [linear.x + point[0], linear.y + point[1]];
                    const [screenPx, screenPy] = worldToScreen(worldPx, worldPy, viewport);
                    const localLeft = screenPx - (screenX - padding) - HANDLE_SIZE / 2;
                    const localTop = screenPy - (screenY - padding) - HANDLE_SIZE / 2;
                    const isEndpoint = index === 0 || index === linear.points.length - 1;

                    if (!isEndpoint) {
                        return null;
                    }

                    return (
                        <button
                            key={index}
                            type="button"
                            aria-label={index === 0 ? 'Drag start' : 'Drag end'}
                            className="pointer-events-auto absolute rounded-full border-2 border-blue-600 bg-white shadow-sm hover:bg-blue-100"
                            style={{
                                width: HANDLE_SIZE + 2,
                                height: HANDLE_SIZE + 2,
                                left: localLeft - 1,
                                top: localTop - 1,
                                cursor: 'grab',
                            }}
                            onPointerDown={(e) => onEndpointPointerDown(index, e)}
                            onPointerMove={onHandlePointerMove}
                            onPointerUp={onHandlePointerUp}
                            onPointerCancel={onHandlePointerUp}
                        />
                    );
                })}
            </div>
        );
    }

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
