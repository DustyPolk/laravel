import type { ToolKey } from '../types';
import { createArrowTool } from './arrow';
import { createDiamondTool } from './diamond';
import { createEllipseTool } from './ellipse';
import { createFreeDrawTool } from './freedraw';
import { createLineTool } from './line';
import { createRectangleTool } from './rectangle';
import { createSelectTool } from './select';
import { createTextTool } from './text';
import type { ToolDescriptor } from './types';

const registry: Record<ToolKey, ToolDescriptor> = {
    select: createSelectTool(),
    rectangle: createRectangleTool(),
    ellipse: createEllipseTool(),
    diamond: createDiamondTool(),
    line: createLineTool(),
    arrow: createArrowTool(),
    freedraw: createFreeDrawTool(),
    text: createTextTool(),
};

export const TOOL_ORDER: ToolKey[] = [
    'select',
    'rectangle',
    'ellipse',
    'diamond',
    'line',
    'arrow',
    'freedraw',
    'text',
];

export function getTool(key: ToolKey): ToolDescriptor {
    return registry[key];
}

export function getAllTools(): ToolDescriptor[] {
    return TOOL_ORDER.map((key) => registry[key]);
}

export type { ToolDescriptor };
