import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { destroy, edit, index, store } from '@/routes/drawings';

interface DrawingListItem {
    id: string;
    title: string;
    thumbnail: string | null;
    updated_at: string;
    creator: { id: number; name: string; avatar: string | null } | null;
}

interface Props {
    drawings: DrawingListItem[];
}

function formatRelative(iso: string): string {
    const updated = new Date(iso).getTime();
    const diff = Date.now() - updated;
    const minutes = Math.floor(diff / 60_000);

    if (minutes < 1) {
        return 'just now';
    }

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 30) {
        return `${days}d ago`;
    }

    return new Date(iso).toLocaleDateString();
}

function DrawingCard({ drawing, teamSlug }: { drawing: DrawingListItem; teamSlug: string }) {
    const [confirmOpen, setConfirmOpen] = useState(false);

    return (
        <div className="group relative overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
            <Link
                href={edit({ current_team: teamSlug, drawing: drawing.id })}
                className="block"
            >
                <div className="aspect-video w-full bg-muted/40">
                    {drawing.thumbnail ? (
                        <img
                            src={drawing.thumbnail}
                            alt=""
                            className="h-full w-full object-contain"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Pencil className="size-8 opacity-30" />
                        </div>
                    )}
                </div>
                <div className="space-y-1 px-4 py-3">
                    <p className="truncate font-medium">
                        {drawing.title || 'Untitled drawing'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Updated {formatRelative(drawing.updated_at)}
                        {drawing.creator ? ` · ${drawing.creator.name}` : null}
                    </p>
                </div>
            </Link>

            <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="secondary"
                            size="icon"
                            aria-label="Delete drawing"
                            className="h-8 w-8"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete drawing?</DialogTitle>
                            <DialogDescription>
                                {drawing.title || 'Untitled drawing'} will be removed for everyone on this team.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="ghost"
                                onClick={() => setConfirmOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Form
                                {...destroy.form({
                                    current_team: teamSlug,
                                    drawing: drawing.id,
                                })}
                            >
                                <Button type="submit" variant="destructive">
                                    Delete
                                </Button>
                            </Form>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

export default function DrawingsIndex({ drawings }: Props) {
    useFlashToast();
    const page = usePage();
    const teamSlug = page.props.currentTeam?.slug ?? '';

    return (
        <>
            <Head title="Drawings" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Drawings"
                        description="Sketch, diagram, and ship together."
                    />

                    <Form {...store.form(teamSlug)}>
                        <Button type="submit">
                            <Plus className="size-4" />
                            New drawing
                        </Button>
                    </Form>
                </div>

                {drawings.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
                        <Pencil className="mb-4 size-10 text-muted-foreground" />
                        <h3 className="text-lg font-medium">No drawings yet</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Create your first drawing to get started.
                        </p>
                        <Form {...store.form(teamSlug)}>
                            <Button type="submit" className="mt-4">
                                <Plus className="size-4" />
                                New drawing
                            </Button>
                        </Form>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {drawings.map((drawing) => (
                            <DrawingCard
                                key={drawing.id}
                                drawing={drawing}
                                teamSlug={teamSlug}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

DrawingsIndex.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Drawings',
            href: props.currentTeam ? index(props.currentTeam.slug) : '/',
        },
    ],
});
