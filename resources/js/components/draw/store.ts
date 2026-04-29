import { create } from 'zustand';
import { DEFAULT_STYLES, HISTORY_LIMIT } from './lib/constants';
import type { DefaultStyles, Element, ToolKey, Viewport } from './types';

interface SceneState {
    drawingId: string;
    title: string;
    elements: Element[];
    selectedIds: string[];
    viewport: Viewport;
    tool: ToolKey;
    styles: DefaultStyles;
    editingTextId: string | null;
    history: { past: Element[][]; future: Element[][] };
    saveStatus: 'idle' | 'pending' | 'saving' | 'saved' | 'error';

    init(payload: {
        drawingId: string;
        title: string;
        elements: Element[];
        viewport?: Viewport;
        styles?: Partial<DefaultStyles>;
    }): void;

    addElement(element: Element): void;
    updateElement(id: string, patch: Partial<Element>): void;
    replaceElements(elements: Element[]): void;
    deleteSelected(): void;
    duplicateSelected(): string[];
    bringForward(): void;
    sendBackward(): void;

    select(ids: string[], additive?: boolean): void;
    clearSelection(): void;

    setTool(tool: ToolKey): void;
    setViewport(viewport: Partial<Viewport>): void;
    setStyles(styles: Partial<DefaultStyles>): void;
    setTitle(title: string): void;

    pushHistory(): void;
    undo(): void;
    redo(): void;

    beginTextEdit(id: string): void;
    cancelTextEdit(): void;

    setSaveStatus(status: SceneState['saveStatus']): void;
}

const cloneElements = (elements: Element[]): Element[] => structuredClone(elements);

export const useSceneStore = create<SceneState>()((set, get) => ({
    drawingId: '',
    title: 'Untitled drawing',
    elements: [],
    selectedIds: [],
    viewport: { offsetX: 0, offsetY: 0, scale: 1 },
    tool: 'select',
    styles: { ...DEFAULT_STYLES },
    editingTextId: null,
    history: { past: [], future: [] },
    saveStatus: 'idle',

    init(payload) {
        set({
            drawingId: payload.drawingId,
            title: payload.title,
            elements: payload.elements,
            selectedIds: [],
            viewport: payload.viewport ?? { offsetX: 0, offsetY: 0, scale: 1 },
            styles: { ...DEFAULT_STYLES, ...(payload.styles ?? {}) },
            history: { past: [], future: [] },
            editingTextId: null,
            saveStatus: 'idle',
        });
    },

    addElement(element) {
        set((state) => ({ elements: [...state.elements, element] }));
    },

    updateElement(id, patch) {
        set((state) => ({
            elements: state.elements.map((el) =>
                el.id === id ? ({ ...el, ...patch, version: el.version + 1 } as Element) : el,
            ),
        }));
    },

    replaceElements(elements) {
        set({ elements });
    },

    deleteSelected() {
        const { selectedIds, elements } = get();

        if (selectedIds.length === 0) {
            return;
        }

        const ids = new Set(selectedIds);
        set({
            elements: elements.filter((el) => !ids.has(el.id)),
            selectedIds: [],
        });
    },

    duplicateSelected() {
        const { selectedIds, elements } = get();

        if (selectedIds.length === 0) {
            return [];
        }

        const ids = new Set(selectedIds);
        const newElements: Element[] = [];
        const newIds: string[] = [];

        for (const el of elements) {
            if (ids.has(el.id)) {
                const copy: Element = {
                    ...structuredClone(el),
                    id: crypto.randomUUID(),
                    x: el.x + 16,
                    y: el.y + 16,
                    seed: Math.floor(Math.random() * 1_000_000),
                    version: 0,
                };
                newElements.push(copy);
                newIds.push(copy.id);
            }
        }

        set((state) => ({
            elements: [...state.elements, ...newElements],
            selectedIds: newIds,
        }));

        return newIds;
    },

    bringForward() {
        const { selectedIds, elements } = get();

        if (selectedIds.length === 0) {
            return;
        }

        const ids = new Set(selectedIds);
        const next = elements.filter((el) => !ids.has(el.id));
        const moved = elements.filter((el) => ids.has(el.id));
        set({ elements: [...next, ...moved] });
    },

    sendBackward() {
        const { selectedIds, elements } = get();

        if (selectedIds.length === 0) {
            return;
        }

        const ids = new Set(selectedIds);
        const moved = elements.filter((el) => ids.has(el.id));
        const next = elements.filter((el) => !ids.has(el.id));
        set({ elements: [...moved, ...next] });
    },

    select(ids, additive = false) {
        if (additive) {
            set((state) => {
                const existing = new Set(state.selectedIds);

                for (const id of ids) {
                    if (existing.has(id)) {
                        existing.delete(id);
                    } else {
                        existing.add(id);
                    }
                }

                return { selectedIds: Array.from(existing) };
            });
        } else {
            set({ selectedIds: ids });
        }
    },

    clearSelection() {
        set({ selectedIds: [] });
    },

    setTool(tool) {
        set({ tool, selectedIds: tool === 'select' ? get().selectedIds : [] });
    },

    setViewport(viewport) {
        set((state) => ({ viewport: { ...state.viewport, ...viewport } }));
    },

    setStyles(styles) {
        set((state) => ({ styles: { ...state.styles, ...styles } }));
        const { selectedIds, elements } = get();

        if (selectedIds.length > 0) {
            const ids = new Set(selectedIds);
            set({
                elements: elements.map((el) =>
                    ids.has(el.id)
                        ? ({ ...el, ...styles, version: el.version + 1 } as Element)
                        : el,
                ),
            });
        }
    },

    setTitle(title) {
        set({ title });
    },

    pushHistory() {
        const { elements, history } = get();
        const past = [...history.past, cloneElements(elements)];

        if (past.length > HISTORY_LIMIT) {
            past.shift();
        }

        set({ history: { past, future: [] } });
    },

    undo() {
        const { elements, history } = get();

        if (history.past.length === 0) {
            return;
        }

        const past = [...history.past];
        const previous = past.pop();

        if (!previous) {
            return;
        }

        set({
            elements: previous,
            history: {
                past,
                future: [...history.future, cloneElements(elements)],
            },
            selectedIds: [],
        });
    },

    redo() {
        const { elements, history } = get();

        if (history.future.length === 0) {
            return;
        }

        const future = [...history.future];
        const next = future.pop();

        if (!next) {
            return;
        }

        set({
            elements: next,
            history: {
                past: [...history.past, cloneElements(elements)],
                future,
            },
            selectedIds: [],
        });
    },

    beginTextEdit(id) {
        set({ editingTextId: id });
    },

    cancelTextEdit() {
        set({ editingTextId: null });
    },

    setSaveStatus(status) {
        set({ saveStatus: status });
    },
}));
