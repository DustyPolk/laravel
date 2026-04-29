import type {
    DefaultStyles,
    DiamondElement,
    EllipseElement,
    Element,
    ElementBase,
    FreeDrawElement,
    LinearElement,
    Point,
    RectangleElement,
    TextElement,
} from '../types';
import { DEFAULT_STYLES } from './constants';

function baseFor(styles: Partial<DefaultStyles>): Omit<ElementBase, 'id' | 'type' | 'x' | 'y' | 'width' | 'height'> {
    const merged = { ...DEFAULT_STYLES, ...styles };

    return {
        angle: 0,
        strokeColor: merged.strokeColor,
        fillColor: merged.fillColor,
        strokeWidth: merged.strokeWidth,
        strokeStyle: merged.strokeStyle,
        fillStyle: merged.fillStyle,
        roughness: merged.roughness,
        opacity: merged.opacity,
        seed: Math.floor(Math.random() * 1_000_000),
        version: 0,
    };
}

export function makeRectangle(x: number, y: number, styles: Partial<DefaultStyles>): RectangleElement {
    return {
        id: crypto.randomUUID(),
        type: 'rectangle',
        x,
        y,
        width: 0,
        height: 0,
        ...baseFor(styles),
    };
}

export function makeEllipse(x: number, y: number, styles: Partial<DefaultStyles>): EllipseElement {
    return {
        id: crypto.randomUUID(),
        type: 'ellipse',
        x,
        y,
        width: 0,
        height: 0,
        ...baseFor(styles),
    };
}

export function makeDiamond(x: number, y: number, styles: Partial<DefaultStyles>): DiamondElement {
    return {
        id: crypto.randomUUID(),
        type: 'diamond',
        x,
        y,
        width: 0,
        height: 0,
        ...baseFor(styles),
    };
}

export function makeLinear(
    x: number,
    y: number,
    type: 'line' | 'arrow',
    styles: Partial<DefaultStyles>,
): LinearElement {
    return {
        id: crypto.randomUUID(),
        type,
        x,
        y,
        width: 0,
        height: 0,
        points: [
            [0, 0],
            [0, 0],
        ],
        ...baseFor(styles),
    };
}

export function makeFreeDraw(x: number, y: number, styles: Partial<DefaultStyles>): FreeDrawElement {
    return {
        id: crypto.randomUUID(),
        type: 'freedraw',
        x,
        y,
        width: 0,
        height: 0,
        points: [[0, 0]],
        pressures: [0.5],
        ...baseFor(styles),
    };
}

export function makeText(
    x: number,
    y: number,
    styles: Partial<DefaultStyles>,
    text = '',
): TextElement {
    const merged = { ...DEFAULT_STYLES, ...styles };

    return {
        id: crypto.randomUUID(),
        type: 'text',
        x,
        y,
        width: 0,
        height: merged.fontSize * 1.4,
        text,
        fontSize: merged.fontSize,
        fontFamily: merged.fontFamily,
        textAlign: 'left',
        ...baseFor(styles),
    };
}

export function isLinearElement(element: Element): element is LinearElement {
    return element.type === 'line' || element.type === 'arrow';
}

export function recomputeLinearBounds(element: LinearElement | FreeDrawElement, points: Point[]): Pick<ElementBase, 'width' | 'height'> {
    if (points.length === 0) {
        return { width: 0, height: 0 };
    }

    let minX = points[0][0];
    let minY = points[0][1];
    let maxX = points[0][0];
    let maxY = points[0][1];

    for (const [px, py] of points) {
        if (px < minX) {
            minX = px;
        }

        if (py < minY) {
            minY = py;
        }

        if (px > maxX) {
            maxX = px;
        }

        if (py > maxY) {
            maxY = py;
        }
    }

    return { width: maxX - minX, height: maxY - minY };
}
