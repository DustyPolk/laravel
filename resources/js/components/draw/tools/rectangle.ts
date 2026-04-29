import { Square } from 'lucide-react';
import { makeRectangle } from '../lib/element-factory';
import { useSceneStore } from '../store';
import type { ToolDescriptor } from './types';

export function createRectangleTool(): ToolDescriptor {
    let activeId: string | null = null;
    let startX = 0;
    let startY = 0;

    return {
        key: 'rectangle',
        label: 'Rectangle',
        cursor: 'crosshair',
        icon: Square,
        shortcut: 'R',

        onPointerDown(input) {
            const store = useSceneStore.getState();
            store.pushHistory();
            const element = makeRectangle(input.worldX, input.worldY, store.styles);
            activeId = element.id;
            startX = input.worldX;
            startY = input.worldY;
            store.addElement(element);
        },

        onPointerMove(input) {
            if (!activeId) {
                return;
            }

            const width = input.worldX - startX;
            const height = input.worldY - startY;
            useSceneStore.getState().updateElement(activeId, { width, height });
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
