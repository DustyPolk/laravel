import { useEffect } from 'react';
import { useSceneStore } from '@/components/draw/store';
import type { ToolKey } from '@/components/draw/types';

const KEY_TO_TOOL: Record<string, ToolKey> = {
    v: 'select',
    r: 'rectangle',
    o: 'ellipse',
    d: 'diamond',
    l: 'line',
    a: 'arrow',
    p: 'freedraw',
    t: 'text',
};

interface ShortcutOptions {
    onSpaceChange(pressed: boolean): void;
}

export function useDrawingShortcuts({ onSpaceChange }: ShortcutOptions) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            const isTyping =
                target?.tagName === 'INPUT' ||
                target?.tagName === 'TEXTAREA' ||
                target?.isContentEditable;

            if (e.key === ' ' && !isTyping) {
                onSpaceChange(true);

                return;
            }

            if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                useSceneStore.getState().undo();

                return;
            }

            if (
                (e.ctrlKey || e.metaKey) &&
                ((e.shiftKey && e.key.toLowerCase() === 'z') || e.key.toLowerCase() === 'y')
            ) {
                e.preventDefault();
                useSceneStore.getState().redo();

                return;
            }

            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
                e.preventDefault();
                const store = useSceneStore.getState();
                store.pushHistory();
                store.duplicateSelected();

                return;
            }

            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (isTyping) {
                    return;
                }

                const store = useSceneStore.getState();

                if (store.selectedIds.length === 0) {
                    return;
                }

                e.preventDefault();
                store.pushHistory();
                store.deleteSelected();

                return;
            }

            if (isTyping) {
                return;
            }

            const tool = KEY_TO_TOOL[e.key.toLowerCase()];

            if (tool) {
                useSceneStore.getState().setTool(tool);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === ' ') {
                onSpaceChange(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [onSpaceChange]);
}
