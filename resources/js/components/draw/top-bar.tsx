import { Link } from '@inertiajs/react';
import { ArrowLeft, Download } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { exportToPng } from './lib/export-png';
import { useSceneStore } from './store';

interface TopBarProps {
    backHref: string;
}

function statusLabel(status: ReturnType<typeof useSceneStore.getState>['saveStatus']): string {
    switch (status) {
        case 'pending':
            return 'Edited';
        case 'saving':
            return 'Saving…';
        case 'saved':
            return 'Saved';
        case 'error':
            return 'Save failed';
        default:
            return '';
    }
}

export function TopBar({ backHref }: TopBarProps) {
    const title = useSceneStore((s) => s.title);
    const setTitle = useSceneStore((s) => s.setTitle);
    const saveStatus = useSceneStore((s) => s.saveStatus);
    const elements = useSceneStore((s) => s.elements);
    const [editingTitle, setEditingTitle] = useState(false);

    return (
        <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-border bg-background/95 px-3 py-2 shadow-md backdrop-blur">
            <Button asChild variant="ghost" size="icon" aria-label="Back to drawings">
                <Link href={backHref}>
                    <ArrowLeft className="size-4" />
                </Link>
            </Button>

            {editingTitle ? (
                <Input
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => setEditingTitle(false)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === 'Escape') {
                            setEditingTitle(false);
                        }
                    }}
                    className="h-8 w-56"
                />
            ) : (
                <button
                    type="button"
                    onClick={() => setEditingTitle(true)}
                    className="text-sm font-medium hover:underline"
                >
                    {title || 'Untitled drawing'}
                </button>
            )}

            <span
                className={cn(
                    'text-xs text-muted-foreground transition-opacity',
                    saveStatus === 'idle' && 'opacity-0',
                    saveStatus === 'error' && 'text-destructive',
                )}
            >
                {statusLabel(saveStatus)}
            </span>

            <div className="ml-auto flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportToPng(elements, `${title || 'drawing'}.png`)}
                >
                    <Download className="size-4" />
                    Export
                </Button>
            </div>
        </div>
    );
}
