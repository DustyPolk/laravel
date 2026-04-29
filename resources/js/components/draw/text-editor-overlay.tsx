import { useEffect, useRef } from 'react';
import { worldToScreen } from './lib/coords';
import { useSceneStore } from './store';
import type { TextElement } from './types';

export function TextEditorOverlay() {
    const editingId = useSceneStore((s) => s.editingTextId);
    const elements = useSceneStore((s) => s.elements);
    const viewport = useSceneStore((s) => s.viewport);
    const updateElement = useSceneStore((s) => s.updateElement);
    const cancelTextEdit = useSceneStore((s) => s.cancelTextEdit);
    const replaceElements = useSceneStore((s) => s.replaceElements);
    const ref = useRef<HTMLTextAreaElement>(null);

    const element = elements.find((el): el is TextElement => el.id === editingId && el.type === 'text');

    useEffect(() => {
        if (editingId && ref.current) {
            ref.current.focus();
            ref.current.setSelectionRange(ref.current.value.length, ref.current.value.length);
        }
    }, [editingId]);

    if (!element) {
        return null;
    }

    const [screenX, screenY] = worldToScreen(element.x, element.y, viewport);

    const measureWidth = (text: string): number => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return 80;
        }

        ctx.font = `${element.fontSize}px ${element.fontFamily}`;
        let max = 80;

        for (const line of text.split('\n')) {
            const w = ctx.measureText(line).width;

            if (w > max) {
                max = w;
            }
        }

        return max + 12;
    };

    const finishEdit = () => {
        const trimmed = element.text.trim();

        if (trimmed.length === 0) {
            replaceElements(useSceneStore.getState().elements.filter((el) => el.id !== element.id));
        }

        cancelTextEdit();
    };

    return (
        <textarea
            ref={ref}
            value={element.text}
            onChange={(e) => {
                const next = e.target.value;
                const lines = next.split('\n').length;
                updateElement(element.id, {
                    text: next,
                    width: measureWidth(next),
                    height: lines * element.fontSize * 1.4,
                });
            }}
            onBlur={finishEdit}
            onKeyDown={(e) => {
                if (e.key === 'Escape') {
                    finishEdit();
                }
            }}
            className="absolute m-0 resize-none overflow-hidden border-none bg-transparent p-0 outline-none ring-0 focus:outline-none focus:ring-0"
            style={{
                left: screenX,
                top: screenY,
                color: element.strokeColor,
                fontFamily: element.fontFamily,
                fontSize: element.fontSize * viewport.scale,
                lineHeight: 1.4,
                minWidth: 80,
                minHeight: element.fontSize * viewport.scale * 1.4,
                width: element.width * viewport.scale,
                opacity: element.opacity,
                transformOrigin: 'top left',
            }}
            placeholder="Type here…"
        />
    );
}
