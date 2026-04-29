import { Diamond } from 'lucide-react';
import { makeDiamond } from '../lib/element-factory';
import { useSceneStore } from '../store';
import type { ToolDescriptor } from './types';

export function createDiamondTool(): ToolDescriptor {
    let activeId: string | null = null;
    let startX = 0;
    let startY = 0;

    return {
        key: 'diamond',
        label: 'Diamond',
        cursor: 'crosshair',
        icon: Diamond,
        shortcut: 'D',

        onPointerDown(input) {
            const store = useSceneStore.getState();
            store.pushHistory();
            const element = makeDiamond(input.worldX, input.worldY, store.styles);
            activeId = element.id;
            startX = input.worldX;
            startY = input.worldY;
            store.addElement(element);
        },

        onPointerMove(input) {
            if (!activeId) {
                return;
            }

            useSceneStore.getState().updateElement(activeId, {
                width: input.worldX - startX,
                height: input.worldY - startY,
            });
        },

        onPointerUp() {
            if (!activeId) {
                return;
            }

            const store = useSceneStore.getState();
            const element = store.elements.find((el) => el.id === activeId);

            if (!element || (Math.abs(element.width) < 2 && Math.abs(element.height) < 2)) {
                store.replaceElements(store.elements.filter((el) => el.id !== activeId));
            } else {
                store.select([activeId]);
            }

            store.setTool('select');
            activeId = null;
        },
    };
}
