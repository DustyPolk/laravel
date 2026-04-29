import { usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDrawingShortcuts } from '@/hooks/use-drawing-shortcuts';
import { index as drawingsIndex } from '@/routes/drawings';
import { CanvasSurface } from './canvas';
import { createAutoSave } from './lib/auto-save';
import { generateThumbnail } from './lib/export-png';
import { clearRoughCache } from './lib/rough-cache';
import { SelectionOverlay } from './selection-overlay';
import { useSceneStore } from './store';
import { StylePanel } from './style-panel';
import { TextEditorOverlay } from './text-editor-overlay';
import { Toolbar } from './toolbar';
import { TopBar } from './top-bar';
import type { DrawingPayload } from './types';
import { ZoomControls } from './zoom-controls';

interface DrawingEditorProps {
    drawing: DrawingPayload;
}

export function DrawingEditor({ drawing }: DrawingEditorProps) {
    const surfaceRef = useRef<HTMLDivElement>(null);
    const [spacePressed, setSpacePressed] = useState(false);

    const page = usePage();
    const teamSlug = page.props.currentTeam?.slug ?? '';

    useEffect(() => {
        useSceneStore.getState().init({
            drawingId: drawing.id,
            title: drawing.title,
            elements: drawing.elements,
            viewport: drawing.app_state?.viewport,
            styles: drawing.app_state?.styles,
        });
        clearRoughCache();
    }, [drawing.id, drawing.title, drawing.elements, drawing.app_state?.viewport, drawing.app_state?.styles]);

    const autoSave = useMemo(() => {
        return createAutoSave({
            teamSlug,
            drawingId: drawing.id,
            onStatus: (status) => useSceneStore.getState().setSaveStatus(status),
        });
    }, [teamSlug, drawing.id]);

    useEffect(() => {
        let lastFingerprint = '';
        const unsubscribe = useSceneStore.subscribe((state, prev) => {
            if (state.elements === prev.elements && state.title === prev.title) {
                return;
            }

            const fingerprint = JSON.stringify({
                t: state.title,
                n: state.elements.length,
                v: state.elements.reduce((sum, el) => sum + el.version, 0),
            });

            if (fingerprint === lastFingerprint) {
                return;
            }

            lastFingerprint = fingerprint;
            const thumbnailPromise = generateThumbnail(state.elements);
            thumbnailPromise.then((thumbnail) => {
                autoSave.save({
                    title: state.title,
                    elements: state.elements,
                    app_state: { viewport: state.viewport },
                    thumbnail: thumbnail ?? undefined,
                });
            });
        });

        return () => {
            unsubscribe();
            autoSave.flush();
        };
    }, [autoSave]);

    useDrawingShortcuts({ onSpaceChange: setSpacePressed });

    const backHref = teamSlug ? drawingsIndex(teamSlug).url : '/';

    return (
        <div ref={surfaceRef} className="relative h-screen w-screen overflow-hidden bg-background">
            <CanvasSurface spacePressed={spacePressed} />
            <SelectionOverlay surfaceRef={surfaceRef} />
            <TextEditorOverlay />

            <div className="pointer-events-none absolute left-0 right-0 top-0 flex justify-center px-4 pt-4">
                <TopBar backHref={backHref} />
            </div>

            <div className="pointer-events-none absolute left-1/2 top-20 flex -translate-x-1/2 gap-3">
                <Toolbar />
            </div>

            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                <StylePanel />
            </div>

            <div className="pointer-events-none absolute bottom-4 right-4">
                <ZoomControls />
            </div>
        </div>
    );
}
