export type Point = [number, number];

export type ElementType =
    | 'rectangle'
    | 'ellipse'
    | 'diamond'
    | 'line'
    | 'arrow'
    | 'freedraw'
    | 'text';

export type StrokeStyle = 'solid' | 'dashed' | 'dotted';
export type FillStyle = 'solid' | 'hachure' | 'cross-hatch' | 'none';
export type TextAlign = 'left' | 'center' | 'right';

export interface ElementBase {
    id: string;
    type: ElementType;
    x: number;
    y: number;
    width: number;
    height: number;
    angle: number;
    strokeColor: string;
    fillColor: string;
    strokeWidth: number;
    strokeStyle: StrokeStyle;
    fillStyle: FillStyle;
    roughness: number;
    opacity: number;
    seed: number;
    version: number;
}

export interface RectangleElement extends ElementBase {
    type: 'rectangle';
}

export interface EllipseElement extends ElementBase {
    type: 'ellipse';
}

export interface DiamondElement extends ElementBase {
    type: 'diamond';
}

export interface LinearElement extends ElementBase {
    type: 'line' | 'arrow';
    points: Point[];
}

export interface FreeDrawElement extends ElementBase {
    type: 'freedraw';
    points: Point[];
    pressures?: number[];
}

export interface TextElement extends ElementBase {
    type: 'text';
    text: string;
    fontSize: number;
    fontFamily: string;
    textAlign: TextAlign;
}

export type Element =
    | RectangleElement
    | EllipseElement
    | DiamondElement
    | LinearElement
    | FreeDrawElement
    | TextElement;

export interface Viewport {
    offsetX: number;
    offsetY: number;
    scale: number;
}

export interface DefaultStyles {
    strokeColor: string;
    fillColor: string;
    strokeWidth: number;
    strokeStyle: StrokeStyle;
    fillStyle: FillStyle;
    roughness: number;
    opacity: number;
    fontSize: number;
    fontFamily: string;
}

export type ToolKey =
    | 'select'
    | 'rectangle'
    | 'ellipse'
    | 'diamond'
    | 'line'
    | 'arrow'
    | 'freedraw'
    | 'text';

export type HandleKey =
    | 'nw'
    | 'n'
    | 'ne'
    | 'e'
    | 'se'
    | 's'
    | 'sw'
    | 'w'
    | 'rotate';

export interface DrawingPayload {
    id: string;
    title: string;
    elements: Element[];
    app_state: {
        viewport?: Viewport;
        styles?: Partial<DefaultStyles>;
    } | null;
    updated_at: string;
}
