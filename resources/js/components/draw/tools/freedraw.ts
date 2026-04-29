import { Pencil } from 'lucide-react';
import { makeFreeDraw, recomputeLinearBounds } from '../lib/element-factory';
import { useSceneStore } from '../store';
import type { FreeDrawElement, Point } from '../types';
import type { ToolDescriptor } from './types';

export function createFreeDrawTool(): ToolDescriptor {
    let activeId: string | null = null;
    let originX = 0;
    let originY = 0;
    let points: Point[] = [];
    let pressures: number[] = [];

    return {
        key: 'freedraw',
        label: 'Draw',
        cursor: 'crosshair',
        icon: Pencil,
        shortcut: 'P',

        onPointerDown(input) {
            const store = useSceneStore.getState();
            store.pushHistory();
            const element = makeFreeDraw(input.worldX, input.worldY, store.styles);
            activeId = element.id;
            originX = input.worldX;
            originY = input.worldY;
            points = [[0, 0]];
            pressures = [input.pressure || 0.5];
            store.addElement(element);
        },

        onPointerMove(input) {
            if (!activeId) {
                return;
            }

            points.push([input.worldX - originX, input.worldY - originY]);
            pressures.push(input.pressure || 0.5);
            const bounds = recomputeLinearBounds({ type: 'freedraw' } as FreeDrawElement, points);
            useSceneStore.getState().updateElement(activeId, {
                points: [...points],
                pressures: [...pressures],
                ...bounds,
            });
        },

        onPointerUp() {
            if (!activeId) {
                return;
            }

            const store = useSceneStore.getState();

            if (points.length < 2) {
                store.replaceElements(store.elements.filter((el) => el.id !== activeId));
            } else {
                store.select([activeId]);
            }

            store.setTool('select');
            activeId = null;
            points = [];
            pressures = [];
        },
    };
}
