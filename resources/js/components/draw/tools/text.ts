import { Type } from 'lucide-react';
import { makeText } from '../lib/element-factory';
import { useSceneStore } from '../store';
import type { ToolDescriptor } from './types';

export function createTextTool(): ToolDescriptor {
    return {
        key: 'text',
        label: 'Text',
        cursor: 'text',
        icon: Type,
        shortcut: 'T',

        onPointerDown(input) {
            const store = useSceneStore.getState();
            store.pushHistory();
            const element = makeText(input.worldX, input.worldY, store.styles, '');
            store.addElement(element);
            store.beginTextEdit(element.id);
            store.setTool('select');
        },

        onPointerMove() {
            // no-op
        },

        onPointerUp() {
            // no-op
        },
    };
}
