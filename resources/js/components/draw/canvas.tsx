import { useEffect, useRef } from 'react';
import { MIN_ZOOM, MAX_ZOOM } from './lib/constants';
import { screenToWorld, getDevicePixelRatio } from './lib/coords';
import { drawMarquee, drawScene, createRenderTarget  } from './lib/render';
import type {RenderTarget} from './lib/render';
import { useSceneStore } from './store';
import { getTool } from './tools';
import { selectToolState } from './tools/select';
import type { PointerInput } from './tools/types';
import type { ToolKey } from './types';

interface CanvasSurfaceProps {
    spacePressed: boolean;
}

function buildPointerInput(
    event: React.PointerEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement,
): PointerInput {
    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const viewport = useSceneStore.getState().viewport;
    const [worldX, worldY] = screenToWorld(screenX, screenY, viewport);

    return {
        screenX,
        screenY,
        worldX,
        worldY,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        pressure: event.pressure || 0.5,
        button: event.button,
        buttons: event.buttons,
    };
}

export function CanvasSurface({ spacePressed }: CanvasSurfaceProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const targetRef = useRef<RenderTarget | null>(null);
    const dprRef = useRef(getDevicePixelRatio());
    const sizeRef = useRef({ width: 0, height: 0 });
    const panningRef = useRef<{ active: boolean; startX: number; startY: number; offX: number; offY: number }>({
        active: false,
        startX: 0,
        startY: 0,
        offX: 0,
        offY: 0,
    });
    const activeToolRef = useRef<ToolKey | null>(null);
    const hasCapturedRef = useRef(false);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        targetRef.current = createRenderTarget(canvas);

        const observer = new ResizeObserver(() => {
            const rect = canvas.getBoundingClientRect();
            const dpr = getDevicePixelRatio();
            dprRef.current = dpr;
            sizeRef.current = { width: rect.width, height: rect.height };
            canvas.width = Math.max(1, Math.floor(rect.width * dpr));
            canvas.height = Math.max(1, Math.floor(rect.height * dpr));
        });
        observer.observe(canvas);

        let raf = 0;
        const tick = () => {
            const target = targetRef.current;

            if (target) {
                const state = useSceneStore.getState();
                drawScene(target, state.elements, state.viewport, dprRef.current);

                if (selectToolState.marquee) {
                    drawMarquee(target.ctx, state.viewport, dprRef.current, selectToolState.marquee);
                }
            }

            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(raf);
            observer.disconnect();
        };
    }, []);

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        canvas.setPointerCapture(e.pointerId);
        hasCapturedRef.current = true;
        const input = buildPointerInput(e, canvas);
        const isMiddleMouse = e.button === 1;
        const shouldPan = spacePressed || isMiddleMouse;

        if (shouldPan) {
            const v = useSceneStore.getState().viewport;
            panningRef.current = {
                active: true,
                startX: input.screenX,
                startY: input.screenY,
                offX: v.offsetX,
                offY: v.offsetY,
            };

            return;
        }

        if (e.button !== 0) {
            return;
        }

        const tool = useSceneStore.getState().tool;
        activeToolRef.current = tool;
        getTool(tool).onPointerDown(input);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const input = buildPointerInput(e, canvas);

        if (panningRef.current.active) {
            const dx = input.screenX - panningRef.current.startX;
            const dy = input.screenY - panningRef.current.startY;
            useSceneStore.getState().setViewport({
                offsetX: panningRef.current.offX + dx,
                offsetY: panningRef.current.offY + dy,
            });

            return;
        }

        const tool = activeToolRef.current;

        if (tool) {
            getTool(tool).onPointerMove(input);
        }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        if (hasCapturedRef.current) {
            try {
                canvas.releasePointerCapture(e.pointerId);
            } catch {
                // already released
            }

            hasCapturedRef.current = false;
        }

        const input = buildPointerInput(e, canvas);

        if (panningRef.current.active) {
            panningRef.current.active = false;

            return;
        }

        const tool = activeToolRef.current;

        if (tool) {
            getTool(tool).onPointerUp(input);
            activeToolRef.current = null;
        }
    };

    const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const rect = canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const store = useSceneStore.getState();
        const viewport = store.viewport;

        if (e.ctrlKey || e.metaKey) {
            const factor = Math.exp(-e.deltaY * 0.0015);
            const nextScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, viewport.scale * factor));
            const ratio = nextScale / viewport.scale;
            store.setViewport({
                scale: nextScale,
                offsetX: screenX - (screenX - viewport.offsetX) * ratio,
                offsetY: screenY - (screenY - viewport.offsetY) * ratio,
            });
        } else {
            store.setViewport({
                offsetX: viewport.offsetX - e.deltaX,
                offsetY: viewport.offsetY - e.deltaY,
            });
        }
    };

    const tool = useSceneStore((s) => s.tool);
    const cursor = spacePressed ? 'grab' : getTool(tool).cursor;

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full touch-none select-none"
            style={{ cursor }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
            onContextMenu={(e) => e.preventDefault()}
        />
    );
}
