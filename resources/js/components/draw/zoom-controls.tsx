import { Maximize2, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSelectionBounds } from './lib/bounds';
import { MAX_ZOOM, MIN_ZOOM } from './lib/constants';
import { useSceneStore } from './store';

export function ZoomControls() {
    const viewport = useSceneStore((s) => s.viewport);
    const setViewport = useSceneStore((s) => s.setViewport);

    const zoomBy = (factor: number) => {
        const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, viewport.scale * factor));
        setViewport({ scale: next });
    };

    const fitToContent = () => {
        const elements = useSceneStore.getState().elements;
        const bounds = getSelectionBounds(elements);

        if (!bounds || bounds.width === 0 || bounds.height === 0) {
            setViewport({ offsetX: 0, offsetY: 0, scale: 1 });

            return;
        }

        const padding = 64;
        const w = window.innerWidth - padding * 2;
        const h = window.innerHeight - padding * 2;
        const scale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.min(w / bounds.width, h / bounds.height, 1.5)));
        setViewport({
            scale,
            offsetX: padding - bounds.x * scale,
            offsetY: padding - bounds.y * scale,
        });
    };

    return (
        <div className="pointer-events-auto flex items-center gap-1 rounded-xl border border-border bg-background/95 px-1 py-1 shadow-md backdrop-blur">
            <Button variant="ghost" size="icon" onClick={() => zoomBy(0.8)} aria-label="Zoom out">
                <Minus className="size-4" />
            </Button>
            <button
                type="button"
                onClick={() => setViewport({ scale: 1, offsetX: 0, offsetY: 0 })}
                className="min-w-[3.5rem] rounded px-2 text-xs font-medium hover:bg-accent"
                aria-label="Reset zoom"
            >
                {Math.round(viewport.scale * 100)}%
            </button>
            <Button variant="ghost" size="icon" onClick={() => zoomBy(1.25)} aria-label="Zoom in">
                <Plus className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={fitToContent} aria-label="Fit to content">
                <Maximize2 className="size-4" />
            </Button>
        </div>
    );
}
