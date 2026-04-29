import type { LucideIcon } from 'lucide-react';
import type { ToolKey } from '../types';

export interface PointerInput {
    worldX: number;
    worldY: number;
    screenX: number;
    screenY: number;
    shiftKey: boolean;
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    pressure: number;
    button: number;
    buttons: number;
}

export interface ToolDescriptor {
    key: ToolKey;
    label: string;
    cursor: string;
    icon: LucideIcon;
    shortcut: string;
    onPointerDown(input: PointerInput): void;
    onPointerMove(input: PointerInput): void;
    onPointerUp(input: PointerInput): void;
}

export type ToolFactory = () => ToolDescriptor;
