import { ArrowRight } from 'lucide-react';
import { makeLinear, recomputeLinearBounds } from '../lib/element-factory';
import { useSceneStore } from '../store';
import type { LinearElement } from '../types';
import type { ToolDescriptor } from './types';

export function createArrowTool(): ToolDescriptor {
    let activeId: string | null = null;
    let startX = 0;
    let startY = 0;

    return {
        key: 'arrow',
        label: 'Arrow',
        cursor: 'crosshair',
        icon: ArrowRight,
        shortcut: 'A',

        onPointerDown(input) {
            const store = useSceneStore.getState();
            store.pushHistory();
            const element = makeLinear(input.worldX, input.worldY, 'arrow', store.styles);
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
            const bounds = recomputeLinearBounds({ type: 'arrow' } as LinearElement, points);
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
                (element.type === 'arrow' && Math.abs(element.width) < 2 && Math.abs(element.height) < 2)
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
