import { Minus } from 'lucide-react';
import { makeLinear, recomputeLinearBounds } from '../lib/element-factory';
import { useSceneStore } from '../store';
import type { LinearElement } from '../types';
import type { ToolDescriptor } from './types';

export function createLineTool(): ToolDescriptor {
    let activeId: string | null = null;
    let startX = 0;
    let startY = 0;

    return {
        key: 'line',
        label: 'Line',
        cursor: 'crosshair',
        icon: Minus,
        shortcut: 'L',

        onPointerDown(input) {
            const store = useSceneStore.getState();
            store.pushHistory();
            const element = makeLinear(input.worldX, input.worldY, 'line', store.styles);
            activeId = element.id;
            startX = input.worldX;
            startY = input.worldY;
            store.addElement(element);
        },

        onPointerMove(input) {
            if (!activeId) {
                return;
            }

            const dx = input.worldX - startX;
            const dy = input.worldY - startY;
            const points: LinearElement['points'] = [
                [0, 0],
                [dx, dy],
            ];
            const bounds = recomputeLinearBounds({ type: 'line' } as LinearElement, points);
            useSceneStore.getState().updateElement(activeId, { points, ...bounds });
        },

        onPointerUp() {
            if (!activeId) {
                return;
            }

            const store = useSceneStore.getState();
            const element = store.elements.find((el) => el.id === activeId);

            if (
                !element ||
                (element.type === 'line' && Math.abs(element.width) < 2 && Math.abs(element.height) < 2)
            ) {
                store.replaceElements(store.elements.filter((el) => el.id !== activeId));
            } else {
                store.select([activeId]);
            }

            store.setTool('select');
            activeId = null;
        },
    };
}
