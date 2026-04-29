import { router } from '@inertiajs/react';
import DrawingController from '@/actions/App/Http/Controllers/DrawingController';
import type { Element, Viewport } from '../types';

export interface SavePayload {
    title: string;
    elements: Element[];
    app_state: { viewport: Viewport };
    thumbnail?: string;
}

export interface AutoSaveOptions {
    teamSlug: string;
    drawingId: string;
    onStatus(status: 'pending' | 'saving' | 'saved' | 'error'): void;
}

export function createAutoSave(options: AutoSaveOptions, debounceMs = 1000) {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let pending: SavePayload | null = null;
    let inFlight = false;

    const flush = () => {
        if (!pending || inFlight) {
            return;
        }

        const data = pending;
        pending = null;
        inFlight = true;
        options.onStatus('saving');
        const action = DrawingController.update({
            current_team: options.teamSlug,
            drawing: options.drawingId,
        });
        router.put(
            action.url,
            data as unknown as Parameters<typeof router.put>[1],
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    options.onStatus(pending ? 'pending' : 'saved');
                },
                onError: () => {
                    options.onStatus('error');
                },
                onFinish: () => {
                    inFlight = false;

                    if (pending) {
                        schedule();
                    }
                },
            },
        );
    };

    const schedule = () => {
        if (timeout) {
            clearTimeout(timeout);
        }

        options.onStatus('pending');
        timeout = setTimeout(flush, debounceMs);
    };

    return {
        save(payload: SavePayload) {
            pending = payload;
            schedule();
        },
        flush() {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }

            flush();
        },
    };
}
