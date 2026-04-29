import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { destroy, edit, index, store } from '@/routes/drawings';

interface DrawingListItem {
    id: string;
    title: string;
    thumbnail: string | null;
    updated_at: string;
}

interface Props {
    drawings: DrawingListItem[];
}

const PIN_COLORS = ['#E94F37', '#FFD23F', '#1971C2', '#2F9E44'];
const ROTATIONS = ['-1.4deg', '0.9deg', '-0.6deg', '1.6deg', '-1.1deg', '0.4deg'];
const STICKY_TINTS = [
    'bg-[#FFD23F]/20',
    'bg-[#A5D8FF]/30',
    'bg-[#B2F2BB]/30',
    'bg-[#FFB4A2]/25',
];

function formatRelative(iso: string): string {
    const updated = new Date(iso).getTime();
    const diff = Date.now() - updated;
    const minutes = Math.floor(diff / 60_000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;

    return new Date(iso).toLocaleDateString();
}

function DrawingCard({
    drawing,
    rotation,
    pinColor,
    tint,
    delay,
}: {
    drawing: DrawingListItem;
    rotation: string;
    pinColor: string;
    tint: string;
    delay: number;
}) {
    const [confirmOpen, setConfirmOpen] = useState(false);

    return (
        <div
            className="od-card od-rise group relative"
            style={
                {
                    transform: `rotate(${rotation})`,
                    animationDelay: `${delay}s`,
                } as React.CSSProperties
            }
        >
            <Link
                href={edit(drawing.id)}
                className="block rounded-md border-2 border-[#1A1A18] bg-[#FBF8F2] p-3 shadow-[6px_6px_0_0_#1A1A18] transition-shadow group-hover:shadow-[10px_10px_0_0_#1A1A18] dark:border-[#F4EFE2] dark:bg-[#181715] dark:shadow-[6px_6px_0_0_#F4EFE2] dark:group-hover:shadow-[10px_10px_0_0_#F4EFE2]"
            >
                {/* Pushpin */}
                <span
                    className="absolute -left-2 -top-2 z-10 h-5 w-5 rounded-full border-2 border-[#1A1A18] shadow-[2px_2px_0_0_rgba(26,26,24,0.4)] dark:border-[#F4EFE2]"
                    style={{ background: pinColor }}
                    aria-hidden
                />

                {/* Thumbnail */}
                <div
                    className={`relative aspect-video w-full overflow-hidden rounded-sm border border-dashed border-[#1A1A18]/25 dark:border-[#F4EFE2]/25 ${tint}`}
                >
                    {drawing.thumbnail ? (
                        <img
                            src={drawing.thumbnail}
                            alt=""
                            className="h-full w-full object-contain"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <BlankSketchMark />
                        </div>
                    )}
                </div>

                {/* Caption */}
                <div className="space-y-0.5 px-1 pb-1 pt-3">
                    <p className="font-display truncate text-lg font-medium tracking-tight text-[#1A1A18] dark:text-[#F4EFE2]">
                        {drawing.title || 'Untitled'}
                    </p>
                    <p className="font-hand truncate text-base text-[#7A7468] dark:text-[#8B857A]">
                        edited {formatRelative(drawing.updated_at)}
                    </p>
                </div>
            </Link>

            {/* Delete */}
            <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                    type="button"
                    aria-label="Delete drawing"
                    onClick={(e) => {
                        e.preventDefault();
                        setConfirmOpen(true);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#1A1A18] bg-[#FBF8F2] text-[#1A1A18] transition-transform hover:-translate-y-0.5 hover:bg-[#E94F37] hover:text-[#FBF8F2] dark:border-[#F4EFE2] dark:bg-[#181715] dark:text-[#F4EFE2]"
                >
                    <Trash2 className="size-4" />
                </button>
            </div>

            {confirmOpen && (
                <DeleteOverlay
                    drawing={drawing}
                    onClose={() => setConfirmOpen(false)}
                />
            )}
        </div>
    );
}

function DeleteOverlay({
    drawing,
    onClose,
}: {
    drawing: DrawingListItem;
    onClose: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A18]/60 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rotate-[-1deg] rounded-md border-2 border-[#1A1A18] bg-[#FBF8F2] p-6 shadow-[8px_8px_0_0_#FFD23F] dark:border-[#F4EFE2] dark:bg-[#181715] dark:shadow-[8px_8px_0_0_#E94F37]"
                onClick={(e) => e.stopPropagation()}
            >
                <p className="font-hand text-xl text-[#E94F37]">— hold up</p>
                <h3 className="font-display mt-1 text-2xl font-medium tracking-tight text-[#1A1A18] dark:text-[#F4EFE2]">
                    Toss "{drawing.title || 'Untitled'}"?
                </h3>
                <p className="mt-3 text-sm text-[#3D3A33] dark:text-[#B8B0A0]">
                    Once it's gone, it's gone. No undo, no recycling bin, no
                    second chances.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="font-hand rounded-md px-4 py-2 text-lg text-[#3D3A33] underline underline-offset-4 hover:text-[#1A1A18] dark:text-[#B8B0A0] dark:hover:text-[#F4EFE2]"
                    >
                        nevermind
                    </button>
                    <Form {...destroy.form(drawing.id)}>
                        <button
                            type="submit"
                            className="rounded-md border-2 border-[#1A1A18] bg-[#E94F37] px-5 py-2 text-sm font-semibold text-[#FBF8F2] shadow-[3px_3px_0_0_#1A1A18] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#1A1A18] dark:border-[#F4EFE2] dark:shadow-[3px_3px_0_0_#F4EFE2] dark:hover:shadow-[5px_5px_0_0_#F4EFE2]"
                        >
                            Yep, toss it
                        </button>
                    </Form>
                </div>
            </div>
        </div>
    );
}

function BlankSketchMark() {
    return (
        <svg
            width="60"
            height="44"
            viewBox="0 0 60 44"
            fill="none"
            className="opacity-40"
        >
            <path
                d="M6 32 C 14 18, 24 30, 32 18 S 50 12, 54 22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-[#1A1A18] dark:text-[#F4EFE2]"
            />
            <circle cx="6" cy="32" r="2.5" fill="#FFD23F" />
            <circle cx="54" cy="22" r="2.5" fill="#E94F37" />
        </svg>
    );
}

function NewDrawingButton({ tone = 'default' }: { tone?: 'default' | 'big' }) {
    if (tone === 'big') {
        return (
            <Form {...store.form()}>
                <button
                    type="submit"
                    className="od-cta inline-flex items-center gap-3 rounded-md border-2 border-[#1A1A18] bg-[#FFD23F] px-7 py-4 text-base font-semibold text-[#1A1A18] dark:border-[#F4EFE2] dark:bg-[#F4EFE2] dark:text-[#0E0E0C]"
                >
                    Start a fresh canvas
                    <svg width="22" height="14" viewBox="0 0 28 14" fill="none">
                        <path
                            d="M2 7 H 24 M 18 2 L 25 7 L 18 12"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </Form>
        );
    }

    return (
        <Form {...store.form()}>
            <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-md border-2 border-[#1A1A18] bg-[#FFD23F] px-5 py-2.5 text-sm font-semibold text-[#1A1A18] shadow-[3px_3px_0_0_#1A1A18] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#1A1A18] dark:border-[#F4EFE2] dark:bg-[#F4EFE2] dark:text-[#0E0E0C] dark:shadow-[3px_3px_0_0_#F4EFE2] dark:hover:shadow-[5px_5px_0_0_#F4EFE2]"
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                        d="M8 2 V 14 M 2 8 H 14"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                    />
                </svg>
                New drawing
            </button>
        </Form>
    );
}

function MarginScribble() {
    return (
        <svg
            aria-hidden
            className="pointer-events-none absolute -right-6 top-32 hidden h-64 w-32 text-[#1971C2] opacity-50 lg:block"
            viewBox="0 0 120 280"
            fill="none"
        >
            <path
                d="M80 10 C 50 60, 110 110, 70 160 S 30 240, 90 270"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                style={{ ['--len' as string]: '600' }}
                className="od-stroke"
            />
            <circle cx="80" cy="10" r="3" fill="#FFD23F" />
        </svg>
    );
}

function ArrowToCTA() {
    return (
        <svg
            aria-hidden
            className="pointer-events-none hidden h-16 w-28 -translate-y-2 text-[#E94F37] opacity-90 sm:block"
            viewBox="0 0 120 64"
            fill="none"
        >
            <path
                d="M10 50 C 30 30, 60 50, 100 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                style={{ ['--len' as string]: '180' }}
                className="od-stroke"
            />
            <path
                d="M92 12 L 102 18 L 96 28"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ ['--len' as string]: '40' }}
                className="od-stroke"
            />
        </svg>
    );
}

export default function DrawingsIndex({ drawings }: Props) {
    useFlashToast();
    const { auth } = usePage().props;
    const firstName = auth.user?.name?.split(' ')[0] ?? 'friend';

    const lastEdited = drawings.length > 0
        ? formatRelative(
              drawings.reduce(
                  (latest, d) =>
                      new Date(d.updated_at) > new Date(latest.updated_at)
                          ? d
                          : latest,
                  drawings[0]
              ).updated_at
          )
        : null;

    return (
        <>
            <Head title="Drawings" />

            <div className="bg-paper relative min-h-full flex-1 overflow-hidden">
                <div className="bg-grain pointer-events-none absolute inset-0 opacity-50 mix-blend-multiply dark:mix-blend-overlay" />
                <MarginScribble />

                <div className="relative mx-auto max-w-7xl px-6 py-10 lg:px-12 lg:py-14">
                    {/* Greeting / hero strip */}
                    <section className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
                        <div className="lg:col-span-7">
                            <p
                                className="od-rise font-hand mb-2 flex items-center gap-3 text-xl text-[#E94F37]"
                                style={{ animationDelay: '.1s' }}
                            >
                                <span className="h-px w-8 bg-[#1A1A18] dark:bg-[#F4EFE2]" />
                                hey {firstName.toLowerCase()},
                            </p>

                            <h1
                                className="od-rise font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[1] font-medium tracking-tight text-[#1A1A18] dark:text-[#F4EFE2]"
                                style={{ animationDelay: '.2s' }}
                            >
                                <span className="od-highlight">Your</span>{' '}
                                <span>sketchpad</span>
                                <span className="font-hand text-[#E94F37]">.</span>
                            </h1>

                            <p
                                className="od-rise mt-5 max-w-lg text-base leading-relaxed text-[#3D3A33] dark:text-[#B8B0A0]"
                                style={{ animationDelay: '.35s' }}
                            >
                                {drawings.length === 0
                                    ? 'Nothing pinned to the wall yet. Time to make a mess.'
                                    : drawings.length === 1
                                      ? 'One drawing on the corkboard. Make another?'
                                      : `${drawings.length} drawings on the corkboard. Make another?`}
                            </p>
                        </div>

                        <div
                            className="od-rise flex items-end gap-3 lg:col-span-5 lg:justify-end"
                            style={{ animationDelay: '.5s' }}
                        >
                            <ArrowToCTA />
                            <NewDrawingButton tone="big" />
                        </div>
                    </section>

                    {/* Stats strip — only when there are drawings */}
                    {drawings.length > 0 && (
                        <div
                            className="od-rise mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-dashed border-[#1A1A18]/20 pt-6 text-sm text-[#7A7468] dark:border-[#F4EFE2]/15 dark:text-[#8B857A]"
                            style={{ animationDelay: '.65s' }}
                        >
                            <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-[#2F9E44]" />
                                Auto-saved
                            </span>
                            {lastEdited && (
                                <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-[#FFD23F]" />
                                    Last touch — {lastEdited}
                                </span>
                            )}
                            <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-[#1971C2]" />
                                {drawings.length}{' '}
                                {drawings.length === 1 ? 'sketch' : 'sketches'}{' '}
                                in the wild
                            </span>
                        </div>
                    )}

                    {/* Grid / empty */}
                    {drawings.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <section className="mt-14">
                            <div className="mb-8 flex items-end justify-between">
                                <div>
                                    <p className="font-hand text-xl text-[#1971C2]">
                                        — pinned to the corkboard
                                    </p>
                                    <h2 className="font-display text-2xl font-medium tracking-tight text-[#1A1A18] md:text-3xl dark:text-[#F4EFE2]">
                                        Pick one up where you left it.
                                    </h2>
                                </div>
                                <div className="hidden sm:block">
                                    <NewDrawingButton />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {drawings.map((drawing, i) => (
                                    <DrawingCard
                                        key={drawing.id}
                                        drawing={drawing}
                                        rotation={ROTATIONS[i % ROTATIONS.length]}
                                        pinColor={
                                            PIN_COLORS[i % PIN_COLORS.length]
                                        }
                                        tint={
                                            STICKY_TINTS[
                                                i % STICKY_TINTS.length
                                            ]
                                        }
                                        delay={0.15 + i * 0.05}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </>
    );
}

function EmptyState() {
    return (
        <section className="mt-16">
            <div className="relative mx-auto max-w-2xl">
                <svg
                    aria-hidden
                    className="pointer-events-none absolute -left-12 -top-8 hidden h-24 w-24 text-[#E94F37] sm:block"
                    viewBox="0 0 100 100"
                    fill="none"
                >
                    <path
                        d="M10 90 C 30 60, 50 80, 80 30"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        style={{ ['--len' as string]: '180' }}
                        className="od-stroke"
                    />
                    <path
                        d="M72 24 L 82 30 L 76 40"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ ['--len' as string]: '40' }}
                        className="od-stroke"
                    />
                </svg>

                <div className="rotate-[-1deg] rounded-2xl border-2 border-dashed border-[#1A1A18] bg-[#FBF8F2]/60 p-10 text-center backdrop-blur-sm sm:p-14 dark:border-[#F4EFE2] dark:bg-[#181715]/60">
                    <div className="mx-auto mb-6 inline-flex h-20 w-20 rotate-[3deg] items-center justify-center rounded-md border-2 border-[#1A1A18] bg-[#FFD23F] shadow-[4px_4px_0_0_#1A1A18] dark:border-[#F4EFE2] dark:shadow-[4px_4px_0_0_#F4EFE2]">
                        <svg
                            width="44"
                            height="44"
                            viewBox="0 0 44 44"
                            fill="none"
                        >
                            <path
                                d="M8 30 C 14 20, 24 32, 30 20 S 38 14, 38 10"
                                stroke="#1A1A18"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            />
                            <circle cx="38" cy="10" r="3" fill="#E94F37" />
                        </svg>
                    </div>

                    <p className="font-hand mb-2 text-2xl text-[#E94F37]">
                        — a clean slate
                    </p>
                    <h3 className="font-display text-3xl font-medium tracking-tight text-[#1A1A18] sm:text-4xl dark:text-[#F4EFE2]">
                        The wall's bare. Let's{' '}
                        <span className="italic text-[#E94F37]">fix that.</span>
                    </h3>
                    <p className="mx-auto mt-4 max-w-md text-[#3D3A33] dark:text-[#B8B0A0]">
                        One blank canvas, infinite room to think out loud.
                        Doodle, diagram, or just drag a circle around until
                        something clicks.
                    </p>

                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <NewDrawingButton tone="big" />
                        <span className="font-hand text-lg text-[#7A7468] dark:text-[#8B857A]">
                            it's just a sketchpad — make a mess
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}

DrawingsIndex.layout = () => ({
    breadcrumbs: [
        {
            title: 'Drawings',
            href: index(),
        },
    ],
});
