import { getStroke } from 'perfect-freehand';
import rough from 'roughjs';
import type { RoughCanvas } from 'roughjs/bin/canvas';
import type { Element, FreeDrawElement, LinearElement, TextElement, Viewport } from '../types';
import { getDrawable } from './rough-cache';

export interface RenderTarget {
    ctx: CanvasRenderingContext2D;
    rc: RoughCanvas;
}

export function createRenderTarget(canvas: HTMLCanvasElement): RenderTarget {
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('canvas 2d context unavailable');
    }

    const rc = rough.canvas(canvas);

    return { ctx, rc };
}

export function clearCanvas(ctx: CanvasRenderingContext2D): void {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function applyViewport(ctx: CanvasRenderingContext2D, viewport: Viewport, dpr: number): void {
    ctx.setTransform(
        dpr * viewport.scale,
        0,
        0,
        dpr * viewport.scale,
        dpr * viewport.offsetX,
        dpr * viewport.offsetY,
    );
}

function drawFreeDraw(ctx: CanvasRenderingContext2D, element: FreeDrawElement): void {
    const path = getStroke(
        element.points.map(([x, y], i) => [x, y, element.pressures?.[i] ?? 0.5]),
        {
            size: element.strokeWidth * 2.5,
            thinning: 0.6,
            smoothing: 0.5,
            streamline: 0.5,
            simulatePressure: !element.pressures,
        },
    );

    if (path.length === 0) {
        return;
    }

    ctx.save();
    ctx.translate(element.x, element.y);
    ctx.fillStyle = element.strokeColor;
    ctx.beginPath();
    ctx.moveTo(path[0][0], path[0][1]);

    for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i][0], path[i][1]);
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawText(ctx: CanvasRenderingContext2D, element: TextElement): void {
    if (!element.text) {
        return;
    }

    ctx.save();
    ctx.fillStyle = element.strokeColor;
    ctx.font = `${element.fontSize}px ${element.fontFamily}`;
    ctx.textBaseline = 'top';
    ctx.textAlign = element.textAlign;

    const lines = element.text.split('\n');
    const lineHeight = element.fontSize * 1.4;
    const xOffset =
        element.textAlign === 'center'
            ? element.width / 2
            : element.textAlign === 'right'
              ? element.width
              : 0;

    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], element.x + xOffset, element.y + i * lineHeight);
    }

    ctx.restore();
}

function drawArrowHead(ctx: CanvasRenderingContext2D, element: LinearElement): void {
    const points = element.points;

    if (points.length < 2) {
        return;
    }

    const [px, py] = points[points.length - 2];
    const [tx, ty] = points[points.length - 1];
    const angle = Math.atan2(ty - py, tx - px);
    const size = 10 + element.strokeWidth * 2;

    ctx.save();
    ctx.strokeStyle = element.strokeColor;
    ctx.fillStyle = element.strokeColor;
    ctx.lineWidth = element.strokeWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.translate(element.x + tx, element.y + ty);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, -size / 2);
    ctx.lineTo(-size * 0.6, 0);
    ctx.lineTo(-size, size / 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawShape(target: RenderTarget, element: Element, drafting: boolean): void {
    const { ctx, rc } = target;

    if (element.opacity !== 1) {
        ctx.globalAlpha = element.opacity;
    }

    if (element.type === 'freedraw') {
        drawFreeDraw(ctx, element);
    } else if (element.type === 'text') {
        drawText(ctx, element);
    } else {
        const drawable = getDrawable(rc.generator, element);

        if (drawable) {
            ctx.save();
            ctx.translate(element.x, element.y);
            rc.draw(drawable);
            ctx.restore();

            if (element.type === 'arrow') {
                drawArrowHead(ctx, element);
            }
        }
    }

    if (drafting && (element.type === 'rectangle' || element.type === 'ellipse' || element.type === 'diamond')) {
        // no extra drafting indicator needed
    }

    ctx.globalAlpha = 1;
}

export function drawScene(
    target: RenderTarget,
    elements: Element[],
    viewport: Viewport,
    dpr: number,
): void {
    const { ctx } = target;
    clearCanvas(ctx);
    applyViewport(ctx, viewport, dpr);

    for (const element of elements) {
        drawShape(target, element, false);
    }
}

export function drawMarquee(
    ctx: CanvasRenderingContext2D,
    viewport: Viewport,
    dpr: number,
    bounds: { x: number; y: number; width: number; height: number },
): void {
    ctx.save();
    applyViewport(ctx, viewport, dpr);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1 / viewport.scale;
    ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
    ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.restore();
}
