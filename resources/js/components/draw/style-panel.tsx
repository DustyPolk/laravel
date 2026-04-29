import { cn } from '@/lib/utils';
import {
    FILL_COLORS,
    ROUGHNESS_LEVELS,
    STROKE_COLORS,
    STROKE_WIDTHS,
} from './lib/constants';
import { useSceneStore } from './store';
import type { DefaultStyles, StrokeStyle } from './types';

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {title}
            </p>
            {children}
        </div>
    );
}

function ColorSwatch({
    color,
    selected,
    onClick,
}: {
    color: string;
    selected: boolean;
    onClick: () => void;
}) {
    const isTransparent = color === 'transparent';

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'h-7 w-7 rounded-md border transition-transform hover:scale-110',
                selected ? 'border-foreground ring-2 ring-foreground/40' : 'border-border',
            )}
            style={{
                backgroundColor: isTransparent ? '#fff' : color,
                backgroundImage: isTransparent
                    ? 'linear-gradient(45deg, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%), linear-gradient(45deg, #ddd 25%, transparent 25%, transparent 75%, #ddd 75%)'
                    : undefined,
                backgroundSize: isTransparent ? '8px 8px' : undefined,
                backgroundPosition: isTransparent ? '0 0, 4px 4px' : undefined,
            }}
            aria-label={isTransparent ? 'No fill' : color}
        />
    );
}

function NumberPills<T extends number>({
    options,
    value,
    onChange,
}: {
    options: T[];
    value: T;
    onChange: (next: T) => void;
}) {
    return (
        <div className="flex gap-1">
            {options.map((opt) => (
                <button
                    key={opt}
                    type="button"
                    onClick={() => onChange(opt)}
                    className={cn(
                        'h-7 min-w-7 rounded-md border px-2 text-xs transition-colors',
                        value === opt
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border hover:bg-accent',
                    )}
                >
                    {opt}
                </button>
            ))}
        </div>
    );
}

function StrokeStylePicker({
    value,
    onChange,
}: {
    value: StrokeStyle;
    onChange: (next: StrokeStyle) => void;
}) {
    const items: { key: StrokeStyle; label: string; pattern: string }[] = [
        { key: 'solid', label: 'Solid', pattern: '——' },
        { key: 'dashed', label: 'Dashed', pattern: '- -' },
        { key: 'dotted', label: 'Dotted', pattern: '· · ·' },
    ];

    return (
        <div className="flex gap-1">
            {items.map((item) => (
                <button
                    key={item.key}
                    type="button"
                    onClick={() => onChange(item.key)}
                    className={cn(
                        'h-7 flex-1 rounded-md border px-2 text-xs transition-colors',
                        value === item.key
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border hover:bg-accent',
                    )}
                    aria-label={item.label}
                >
                    {item.pattern}
                </button>
            ))}
        </div>
    );
}

export function StylePanel() {
    const styles = useSceneStore((s) => s.styles);
    const setStyles = useSceneStore((s) => s.setStyles);

    const update = <K extends keyof DefaultStyles>(key: K, value: DefaultStyles[K]) => {
        setStyles({ [key]: value } as Partial<DefaultStyles>);
    };

    return (
        <div className="pointer-events-auto w-56 space-y-4 rounded-xl border border-border bg-background/95 p-4 shadow-md backdrop-blur">
            <PanelSection title="Stroke">
                <div className="grid grid-cols-4 gap-1.5">
                    {STROKE_COLORS.map((color) => (
                        <ColorSwatch
                            key={color}
                            color={color}
                            selected={styles.strokeColor === color}
                            onClick={() => update('strokeColor', color)}
                        />
                    ))}
                </div>
            </PanelSection>

            <PanelSection title="Fill">
                <div className="grid grid-cols-4 gap-1.5">
                    {FILL_COLORS.map((color) => (
                        <ColorSwatch
                            key={color}
                            color={color}
                            selected={styles.fillColor === color}
                            onClick={() => update('fillColor', color)}
                        />
                    ))}
                </div>
            </PanelSection>

            <PanelSection title="Stroke width">
                <NumberPills
                    options={STROKE_WIDTHS}
                    value={styles.strokeWidth}
                    onChange={(next) => update('strokeWidth', next)}
                />
            </PanelSection>

            <PanelSection title="Stroke style">
                <StrokeStylePicker
                    value={styles.strokeStyle}
                    onChange={(next) => update('strokeStyle', next)}
                />
            </PanelSection>

            <PanelSection title="Sloppiness">
                <NumberPills
                    options={ROUGHNESS_LEVELS}
                    value={styles.roughness}
                    onChange={(next) => update('roughness', next)}
                />
            </PanelSection>
        </div>
    );
}
