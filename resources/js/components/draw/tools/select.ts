import { MousePointer2 } from 'lucide-react';
import { applyBoundsToElement, getSelectionBounds, resizeBounds  } from '../lib/bounds';
import type {Bounds} from '../lib/bounds';
import { elementsInMarquee, hitTestTopElement } from '../lib/hit-test';
import { useSceneStore } from '../store';
import type { Element, HandleKey } from '../types';
import type { PointerInput, ToolDescriptor } from './types';

export interface SelectToolState {
    marquee: Bounds | null;
}

interface InternalState {
    mode: 'idle' | 'marquee' | 'move' | 'resize';
    startWorldX: number;
    startWorldY: number;
    moveSnapshot: Map<string, { x: number; y: number }>;
    resizeHandle: HandleKey | null;
    resizeOriginal: Bounds | null;
    resizeSnapshots: Map<string, Element>;
    didChange: boolean;
}

const internal: InternalState = {
    mode: 'idle',
    startWorldX: 0,
    startWorldY: 0,
    moveSnapshot: new Map(),
    resizeHandle: null,
    resizeOriginal: null,
    resizeSnapshots: new Map(),
    didChange: false,
};

export const selectToolState: SelectToolState = { marquee: null };

export function beginHandleResize(handle: HandleKey, worldX: number, worldY: number): void {
    const store = useSceneStore.getState();
    const selected = store.elements.filter((el) => store.selectedIds.includes(el.id));
    const bounds = getSelectionBounds(selected);

    if (!bounds) {
        return;
    }

    store.pushHistory();
    internal.mode = 'resize';
    internal.resizeHandle = handle;
    internal.resizeOriginal = bounds;
    internal.resizeSnapshots = new Map(selected.map((el) => [el.id, structuredClone(el)]));
    internal.startWorldX = worldX;
    internal.startWorldY = worldY;
    internal.didChange = false;
}

export function continueHandleResize(worldX: number, worldY: number, keepAspect: boolean): void {
    const { mode, resizeHandle, resizeOriginal, resizeSnapshots } = internal;

    if (mode !== 'resize' || !resizeHandle || !resizeOriginal) {
        return;
    }

    const next = resizeBounds(resizeOriginal, resizeHandle, worldX, worldY, keepAspect);
    const store = useSceneStore.getState();
    const updated = store.elements.map((el) => {
        const snapshot = resizeSnapshots.get(el.id);

        if (!snapshot) {
            return el;
        }

        const dx = snapshot.x - resizeOriginal.x;
        const dy = snapshot.y - resizeOriginal.y;
        const newWidthRatio = resizeOriginal.width === 0 ? 1 : next.width / resizeOriginal.width;
        const newHeightRatio = resizeOriginal.height === 0 ? 1 : next.height / resizeOriginal.height;
        const repositioned: Element = {
            ...snapshot,
            x: next.x + dx * newWidthRatio,
            y: next.y + dy * newHeightRatio,
            width: snapshot.width * newWidthRatio,
            height: snapshot.height * newHeightRatio,
            version: snapshot.version + 1,
        };

        if (snapshot.type === 'line' || snapshot.type === 'arrow' || snapshot.type === 'freedraw') {
            const scaled = applyBoundsToElement(snapshot, {
                x: snapshot.x,
                y: snapshot.y,
                width: snapshot.width,
                height: snapshot.height,
            }, {
                x: snapshot.x,
                y: snapshot.y,
                width: snapshot.width * newWidthRatio,
                height: snapshot.height * newHeightRatio,
            });

            return {
                ...scaled,
                x: next.x + dx * newWidthRatio,
                y: next.y + dy * newHeightRatio,
            };
        }

        return repositioned;
    });
    store.replaceElements(updated);
    internal.didChange = true;
}

export function endHandleResize(): void {
    internal.mode = 'idle';
    internal.resizeHandle = null;
    internal.resizeOriginal = null;
    internal.resizeSnapshots.clear();
    internal.didChange = false;
}

export function createSelectTool(): ToolDescriptor {
    return {
        key: 'select',
        label: 'Select',
        cursor: 'default',
        icon: MousePointer2,
        shortcut: 'V',

        onPointerDown(input: PointerInput) {
            const store = useSceneStore.getState();
            const hit = hitTestTopElement(input.worldX, input.worldY, store.elements);

            internal.startWorldX = input.worldX;
            internal.startWorldY = input.worldY;
            internal.didChange = false;

            if (hit) {
                const alreadySelected = store.selectedIds.includes(hit.id);

                if (!alreadySelected) {
                    store.select([hit.id], input.shiftKey);
                }

                store.pushHistory();
                internal.mode = 'move';
                internal.moveSnapshot = new Map(
                    store.elements
                        .filter((el) => store.selectedIds.includes(el.id) || el.id === hit.id)
                        .map((el) => [el.id, { x: el.x, y: el.y }]),
                );

                return;
            }

            if (!input.shiftKey) {
                store.clearSelection();
            }

            internal.mode = 'marquee';
            selectToolState.marquee = {
                x: input.worldX,
                y: input.worldY,
                width: 0,
                height: 0,
            };
        },

        onPointerMove(input: PointerInput) {
            const store = useSceneStore.getState();
            const dx = input.worldX - internal.startWorldX;
            const dy = input.worldY - internal.startWorldY;

            if (internal.mode === 'move') {
                const updated = store.elements.map((el) => {
                    const snap = internal.moveSnapshot.get(el.id);

                    return snap
                        ? ({ ...el, x: snap.x + dx, y: snap.y + dy, version: el.version + 1 } as Element)
                        : el;
                });
                store.replaceElements(updated);
                internal.didChange = Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5;

                return;
            }

            if (internal.mode === 'marquee') {
                const x = Math.min(internal.startWorldX, input.worldX);
                const y = Math.min(internal.startWorldY, input.worldY);
                const width = Math.abs(dx);
                const height = Math.abs(dy);
                selectToolState.marquee = { x, y, width, height };
                const inMarquee = elementsInMarquee(selectToolState.marquee, store.elements);
                store.select(
                    inMarquee.map((el) => el.id),
                    false,
                );
            }
        },

        onPointerUp() {
            if (internal.mode === 'marquee' && !internal.didChange) {
                selectToolState.marquee = null;
            }

            if (internal.mode === 'marquee') {
                selectToolState.marquee = null;
            }

            internal.mode = 'idle';
            internal.moveSnapshot.clear();
            internal.didChange = false;
        },
    };
}
