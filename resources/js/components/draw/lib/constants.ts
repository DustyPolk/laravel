import type { DefaultStyles } from '../types';

export const STROKE_COLORS = [
    '#1e1e1e',
    '#e03131',
    '#2f9e44',
    '#1971c2',
    '#f08c00',
    '#9c36b5',
    '#e8590c',
    '#0c8599',
];

export const FILL_COLORS = [
    'transparent',
    '#ffc9c9',
    '#b2f2bb',
    '#a5d8ff',
    '#ffec99',
    '#eebefa',
    '#ffd8a8',
    '#99e9f2',
];

export const STROKE_WIDTHS = [1, 2, 4];

export const ROUGHNESS_LEVELS = [0, 1, 2];

export const FONT_FAMILIES = [
    { label: 'Hand-drawn', value: '"Comic Sans MS", "Segoe Print", cursive' },
    { label: 'Sans', value: 'system-ui, sans-serif' },
    { label: 'Serif', value: 'Georgia, serif' },
    { label: 'Mono', value: '"Courier New", monospace' },
];

export const FONT_SIZES = [16, 20, 28, 36];

export const DEFAULT_STYLES: DefaultStyles = {
    strokeColor: '#1e1e1e',
    fillColor: 'transparent',
    strokeWidth: 2,
    strokeStyle: 'solid',
    fillStyle: 'hachure',
    roughness: 1,
    opacity: 1,
    fontSize: 20,
    fontFamily: '"Comic Sans MS", "Segoe Print", cursive',
};

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 8;
export const HISTORY_LIMIT = 100;
export const HANDLE_SIZE = 8;
export const HIT_THRESHOLD = 6;
