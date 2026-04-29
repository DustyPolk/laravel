import { Head, Link, usePage } from '@inertiajs/react';
import { login } from '@/routes';
import { index as drawingsIndex } from '@/routes/drawings';

export default function Welcome() {
    const { auth } = usePage().props;
    const appHref = auth.user ? drawingsIndex() : login();

    return (
        <>
            <Head title="OpenDraw — sketch ideas like you mean it">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=caveat:400,500,700|fraunces:400,500,600,700,900|instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <style>{`
                @keyframes draw-stroke {
                    from { stroke-dashoffset: var(--len); }
                    to { stroke-dashoffset: 0; }
                }
                @keyframes float-gentle {
                    0%, 100% { transform: translateY(0) rotate(var(--r, 0deg)); }
                    50% { transform: translateY(-6px) rotate(var(--r, 0deg)); }
                }
                @keyframes scribble-in {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes highlight-sweep {
                    from { width: 0; }
                    to { width: 100%; }
                }
                .xc-stroke { stroke-dasharray: var(--len); stroke-dashoffset: var(--len); animation: draw-stroke 1.4s cubic-bezier(.65,0,.35,1) forwards; }
                .xc-stroke-2 { animation-delay: .25s; }
                .xc-stroke-3 { animation-delay: .5s; }
                .xc-stroke-4 { animation-delay: .75s; }
                .xc-float { animation: float-gentle 6s ease-in-out infinite; }
                .xc-rise { opacity: 0; animation: scribble-in .9s cubic-bezier(.2,.7,.2,1) forwards; }
                .xc-paper {
                    background-image:
                        radial-gradient(circle at 1px 1px, rgba(26,26,24,0.07) 1px, transparent 0);
                    background-size: 28px 28px;
                }
                .dark .xc-paper {
                    background-image:
                        radial-gradient(circle at 1px 1px, rgba(255,250,237,0.06) 1px, transparent 0);
                }
                .xc-grain {
                    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
                }
                .xc-display { font-family: 'Fraunces', Georgia, serif; font-feature-settings: 'ss01' on, 'ss02' on; }
                .xc-hand { font-family: 'Caveat', cursive; }
                .xc-body { font-family: 'Instrument Sans', system-ui, sans-serif; }
                .xc-highlight {
                    position: relative;
                    display: inline-block;
                }
                .xc-highlight::before {
                    content: '';
                    position: absolute;
                    inset: 30% -2% 8% -2%;
                    background: #FFD23F;
                    z-index: -1;
                    transform: skew(-3deg, -1deg);
                    animation: highlight-sweep 1.1s .6s cubic-bezier(.65,0,.35,1) backwards;
                }
                .dark .xc-highlight::before { background: #FFB400; opacity: .85; }
                .xc-card {
                    transition: transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s ease;
                }
                .xc-card:hover {
                    transform: translateY(-4px) rotate(0deg) !important;
                    box-shadow: 0 24px 60px -20px rgba(26,26,24,.25);
                }
                .xc-cta {
                    position: relative;
                    transition: transform .25s cubic-bezier(.2,.7,.2,1);
                }
                .xc-cta:hover { transform: translate(-2px, -2px); }
                .xc-cta::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: #1a1a18;
                    border-radius: inherit;
                    z-index: -1;
                    transform: translate(6px, 6px);
                    transition: transform .25s cubic-bezier(.2,.7,.2,1);
                }
                .xc-cta:hover::after { transform: translate(8px, 8px); }
                .dark .xc-cta::after { background: #FFD23F; }
            `}</style>

            <div className="xc-body relative min-h-screen overflow-x-hidden bg-[#FBF8F2] text-[#1A1A18] dark:bg-[#0E0E0C] dark:text-[#F4EFE2]">
                <div className="xc-paper pointer-events-none absolute inset-0 opacity-70" />
                <div className="xc-grain pointer-events-none absolute inset-0 opacity-50 mix-blend-multiply dark:mix-blend-overlay" />

                {/* margin scribbles */}
                <svg
                    aria-hidden
                    className="pointer-events-none absolute -left-10 top-40 hidden h-72 w-32 text-[#E94F37] opacity-60 lg:block"
                    viewBox="0 0 120 280"
                    fill="none"
                >
                    <path
                        d="M30 10 C 60 60, 0 110, 40 160 S 80 240, 30 270"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        style={{ ['--len' as string]: '600' }}
                        className="xc-stroke"
                    />
                </svg>

                <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 pt-8 lg:px-12">
                    <Link href="/" className="group flex items-center gap-3">
                        <svg width="44" height="44" viewBox="0 0 60 60" className="text-[#1A1A18] dark:text-[#F4EFE2]">
                            <rect
                                x="6"
                                y="6"
                                width="48"
                                height="48"
                                rx="6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinejoin="round"
                                style={{ ['--len' as string]: '200' }}
                                className="xc-stroke"
                            />
                            <path
                                d="M14 36 Q 22 18, 30 30 T 46 26"
                                fill="none"
                                stroke="#E94F37"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                style={{ ['--len' as string]: '90' }}
                                className="xc-stroke xc-stroke-2"
                            />
                            <circle cx="44" cy="20" r="3" fill="#FFD23F" />
                        </svg>
                        <span className="xc-display text-2xl font-semibold tracking-tight">
                            OpenDraw
                        </span>
                    </Link>

                    <nav className="flex items-center gap-2">
                        <a
                            href="#features"
                            className="hidden rounded-full px-4 py-2 text-sm font-medium text-[#3D3A33] transition-colors hover:text-[#1A1A18] sm:inline-block dark:text-[#B8B0A0] dark:hover:text-[#F4EFE2]"
                        >
                            Features
                        </a>
                        <a
                            href="#how"
                            className="hidden rounded-full px-4 py-2 text-sm font-medium text-[#3D3A33] transition-colors hover:text-[#1A1A18] sm:inline-block dark:text-[#B8B0A0] dark:hover:text-[#F4EFE2]"
                        >
                            How it works
                        </a>
                        {auth.user ? (
                            <Link
                                href={appHref}
                                className="rounded-full border-2 border-[#1A1A18] bg-[#FFD23F] px-5 py-2 text-sm font-semibold text-[#1A1A18] shadow-[3px_3px_0_0_#1A1A18] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#1A1A18] dark:border-[#F4EFE2] dark:shadow-[3px_3px_0_0_#F4EFE2] dark:hover:shadow-[5px_5px_0_0_#F4EFE2]"
                            >
                                Open my drawings
                            </Link>
                        ) : (
                            <Link
                                href={appHref}
                                className="rounded-full border-2 border-[#1A1A18] bg-transparent px-5 py-2 text-sm font-semibold text-[#1A1A18] transition-colors hover:bg-[#1A1A18] hover:text-[#FBF8F2] dark:border-[#F4EFE2] dark:text-[#F4EFE2] dark:hover:bg-[#F4EFE2] dark:hover:text-[#0E0E0C]"
                            >
                                Sign in
                            </Link>
                        )}
                    </nav>
                </header>

                <main className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12">
                    {/* HERO */}
                    <section className="grid grid-cols-1 items-center gap-12 pt-16 pb-24 lg:grid-cols-12 lg:gap-8 lg:pt-24 lg:pb-32">
                        <div className="lg:col-span-7">
                            <div className="xc-rise mb-6 flex items-center gap-3" style={{ animationDelay: '.1s' }}>
                                <span className="h-px w-10 bg-[#1A1A18] dark:bg-[#F4EFE2]" />
                                <span className="xc-hand text-xl text-[#E94F37]">a whiteboard, but charming</span>
                            </div>

                            <h1 className="xc-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.95] font-medium tracking-[-0.02em]">
                                <span className="xc-rise block" style={{ animationDelay: '.2s' }}>
                                    <span className="xc-highlight">Sketch</span> ideas
                                </span>
                                <span className="xc-rise block italic text-[#E94F37]" style={{ animationDelay: '.35s' }}>
                                    like you mean it.
                                </span>
                            </h1>

                            <p
                                className="xc-rise mt-8 max-w-xl text-lg leading-relaxed text-[#3D3A33] dark:text-[#B8B0A0]"
                                style={{ animationDelay: '.55s' }}
                            >
                                A virtual whiteboard with that hand-drawn feel.
                                Diagrams, flows, wireframes, and the napkin sketch
                                you'll wish you'd kept — without the napkin.
                            </p>

                            <div
                                className="xc-rise mt-10 flex flex-wrap items-center gap-5"
                                style={{ animationDelay: '.7s' }}
                            >
                                <Link
                                    href={appHref}
                                    className="xc-cta inline-flex items-center gap-2 rounded-md border-2 border-[#1A1A18] bg-[#FFD23F] px-7 py-4 text-base font-semibold text-[#1A1A18] dark:border-[#F4EFE2] dark:bg-[#F4EFE2] dark:text-[#0E0E0C]"
                                >
                                    {auth.user ? 'Open my drawings' : 'Start drawing — free'}
                                    <svg width="20" height="14" viewBox="0 0 28 14" fill="none">
                                        <path
                                            d="M2 7 H 24 M 18 2 L 25 7 L 18 12"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </Link>

                                <a
                                    href="#features"
                                    className="xc-hand text-xl text-[#1A1A18] underline decoration-[#E94F37] decoration-wavy decoration-2 underline-offset-[6px] hover:decoration-[#FFD23F] dark:text-[#F4EFE2]"
                                >
                                    or peek at what's inside →
                                </a>
                            </div>

                            <div
                                className="xc-rise mt-12 flex items-center gap-6 text-sm text-[#7A7468] dark:text-[#8B857A]"
                                style={{ animationDelay: '.85s' }}
                            >
                                <span className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-[#2F9E44]" />
                                    Auto-saves while you sketch
                                </span>
                                <span className="hidden sm:inline-flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-[#1971C2]" />
                                    Teams &amp; sharing built-in
                                </span>
                            </div>
                        </div>

                        {/* hero illustration */}
                        <div className="relative lg:col-span-5">
                            <HeroSketch />
                        </div>
                    </section>

                    {/* FEATURES */}
                    <section id="features" className="relative pb-32">
                        <div className="mb-16 flex items-end justify-between">
                            <div>
                                <p className="xc-hand mb-2 text-xl text-[#E94F37]">— what's in the box</p>
                                <h2 className="xc-display text-4xl font-medium tracking-tight md:text-5xl">
                                    All the tools, none of the fuss.
                                </h2>
                            </div>
                            <svg
                                aria-hidden
                                className="hidden h-20 w-32 text-[#1A1A18] opacity-70 md:block dark:text-[#F4EFE2]"
                                viewBox="0 0 120 80"
                                fill="none"
                            >
                                <path
                                    d="M10 60 C 30 40, 60 70, 90 30"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    style={{ ['--len' as string]: '160' }}
                                    className="xc-stroke"
                                />
                                <path
                                    d="M82 24 L 92 30 L 86 40"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ ['--len' as string]: '40' }}
                                    className="xc-stroke xc-stroke-2"
                                />
                            </svg>
                        </div>

                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            <FeatureCard
                                rotation="-1.5deg"
                                accent="#FFD23F"
                                title="Hand-drawn feel"
                                body="Rough strokes, wobbly circles, that warm sketchpad look — without the eraser dust."
                                icon={<IconRough />}
                            />
                            <FeatureCard
                                rotation="1.2deg"
                                accent="#E94F37"
                                title="Drag the endpoints"
                                body="Grab an arrow's tip and twist it. Resize circles. Reshape diamonds. It just bends."
                                icon={<IconArrow />}
                            />
                            <FeatureCard
                                rotation="-0.8deg"
                                accent="#1971C2"
                                title="Infinite canvas"
                                body="Pan, zoom, sprawl. Your big idea isn't getting cropped at 1920×1080."
                                icon={<IconCanvas />}
                            />
                            <FeatureCard
                                rotation="1.6deg"
                                accent="#2F9E44"
                                title="Saves itself"
                                body="Every stroke lands in the cloud. Refresh, leave, come back tomorrow — it's still there."
                                icon={<IconSave />}
                            />
                        </div>
                    </section>

                    {/* HOW IT WORKS */}
                    <section id="how" className="relative pb-32">
                        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-12">
                            <div className="lg:col-span-5">
                                <p className="xc-hand mb-2 text-xl text-[#1971C2]">— three steps, tops</p>
                                <h2 className="xc-display text-4xl font-medium leading-tight tracking-tight md:text-5xl">
                                    From blank page to{' '}
                                    <span className="italic text-[#E94F37]">"oh, that's it!"</span>{' '}
                                    in a minute.
                                </h2>
                                <p className="mt-6 max-w-md text-[#3D3A33] dark:text-[#B8B0A0]">
                                    No tutorials. No onboarding wizard. Pick a tool, drop it
                                    on the canvas, drag the endpoints if it's not quite right.
                                </p>
                            </div>

                            <ol className="space-y-6 lg:col-span-7">
                                <Step
                                    n="01"
                                    title="Sign in & spin up a board"
                                    body="One click. Your team's drawings live behind your name, not buried in a maze of folders."
                                />
                                <Step
                                    n="02"
                                    title="Pick a tool, scribble away"
                                    body="Rectangles, ellipses, diamonds, lines, arrows, freehand, text. The toolbar is the toolbar — that's it."
                                />
                                <Step
                                    n="03"
                                    title="Tweak until it's right"
                                    body="Drag the endpoints of an arrow. Pull a corner of a circle. Yank the bounding box. It always behaves."
                                />
                            </ol>
                        </div>
                    </section>

                    {/* CTA STRIP */}
                    <section className="relative pb-32">
                        <div className="relative overflow-hidden rounded-[2rem] border-2 border-[#1A1A18] bg-[#1A1A18] px-8 py-16 text-center text-[#FBF8F2] shadow-[8px_8px_0_0_#FFD23F] md:px-16 md:py-24 dark:border-[#F4EFE2] dark:shadow-[8px_8px_0_0_#E94F37]">
                            <svg
                                aria-hidden
                                className="absolute -right-8 -top-8 h-40 w-40 text-[#FFD23F] opacity-90"
                                viewBox="0 0 100 100"
                                fill="none"
                            >
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeDasharray="3 6"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="28"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeDasharray="3 6"
                                />
                            </svg>
                            <p className="xc-hand mb-4 text-2xl text-[#FFD23F]">— your move</p>
                            <h2 className="xc-display text-4xl font-medium leading-tight tracking-tight md:text-6xl">
                                The blank canvas is{' '}
                                <span className="italic text-[#FFD23F]">waiting.</span>
                            </h2>
                            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Link
                                    href={appHref}
                                    className="rounded-md bg-[#FFD23F] px-8 py-4 text-base font-semibold text-[#1A1A18] transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-4px_rgba(255,210,63,0.5)]"
                                >
                                    {auth.user ? 'Back to your drawings →' : 'Start drawing — free →'}
                                </Link>
                                {!auth.user && (
                                    <span className="xc-hand text-xl text-[#FBF8F2]/80">
                                        no credit card, just vibes
                                    </span>
                                )}
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="relative z-10 border-t border-[#1A1A18]/10 dark:border-[#F4EFE2]/10">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-[#7A7468] sm:flex-row lg:px-12 dark:text-[#8B857A]">
                        <span className="xc-hand text-lg">made with squiggly lines &amp; Laravel</span>
                        <span>© {new Date().getFullYear()} OpenDraw</span>
                    </div>
                </footer>
            </div>
        </>
    );
}

function HeroSketch() {
    return (
        <div className="relative">
            <div
                className="xc-float relative aspect-[4/5] w-full max-w-md rounded-2xl border-2 border-[#1A1A18] bg-[#FBF8F2] p-6 shadow-[10px_10px_0_0_#1A1A18] dark:border-[#F4EFE2] dark:bg-[#181715] dark:shadow-[10px_10px_0_0_#FFD23F]"
                style={{ ['--r' as string]: '-2deg' }}
            >
                <div className="mb-4 flex items-center gap-2 border-b border-dashed border-[#1A1A18]/20 pb-3 dark:border-[#F4EFE2]/20">
                    <span className="h-3 w-3 rounded-full bg-[#E94F37]" />
                    <span className="h-3 w-3 rounded-full bg-[#FFD23F]" />
                    <span className="h-3 w-3 rounded-full bg-[#2F9E44]" />
                    <span className="xc-hand ml-3 text-base text-[#7A7468] dark:text-[#8B857A]">
                        flow-diagram-v3.xcd
                    </span>
                </div>
                <svg viewBox="0 0 320 380" className="h-full w-full" fill="none">
                    {/* Idea node */}
                    <g className="text-[#1A1A18] dark:text-[#F4EFE2]">
                        <rect
                            x="30"
                            y="40"
                            width="120"
                            height="56"
                            rx="6"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            fill="#FFD23F"
                            fillOpacity="0.25"
                            style={{ ['--len' as string]: '360' }}
                            className="xc-stroke"
                        />
                        <text
                            x="90"
                            y="74"
                            textAnchor="middle"
                            fontFamily="Caveat, cursive"
                            fontSize="22"
                            fill="currentColor"
                        >
                            an idea ✨
                        </text>
                    </g>

                    {/* Arrow */}
                    <g className="text-[#E94F37]">
                        <path
                            d="M 90 100 C 90 130, 200 130, 230 160"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            style={{ ['--len' as string]: '200' }}
                            className="xc-stroke xc-stroke-2"
                        />
                        <path
                            d="M 220 152 L 232 162 L 218 168"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ ['--len' as string]: '40' }}
                            className="xc-stroke xc-stroke-3"
                        />
                    </g>

                    {/* Process node */}
                    <g className="text-[#1A1A18] dark:text-[#F4EFE2]">
                        <ellipse
                            cx="230"
                            cy="180"
                            rx="60"
                            ry="32"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            fill="#A5D8FF"
                            fillOpacity="0.3"
                            style={{ ['--len' as string]: '300' }}
                            className="xc-stroke xc-stroke-2"
                        />
                        <text
                            x="230"
                            y="186"
                            textAnchor="middle"
                            fontFamily="Caveat, cursive"
                            fontSize="20"
                            fill="currentColor"
                        >
                            sketch it
                        </text>
                    </g>

                    {/* Arrow 2 */}
                    <g className="text-[#1971C2]">
                        <path
                            d="M 230 212 L 230 260"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            style={{ ['--len' as string]: '60' }}
                            className="xc-stroke xc-stroke-3"
                        />
                        <path
                            d="M 222 252 L 230 262 L 238 252"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ ['--len' as string]: '40' }}
                            className="xc-stroke xc-stroke-4"
                        />
                    </g>

                    {/* Output diamond */}
                    <g className="text-[#1A1A18] dark:text-[#F4EFE2]">
                        <path
                            d="M 230 264 L 290 314 L 230 364 L 170 314 Z"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            fill="#B2F2BB"
                            fillOpacity="0.35"
                            strokeLinejoin="round"
                            style={{ ['--len' as string]: '320' }}
                            className="xc-stroke xc-stroke-3"
                        />
                        <text
                            x="230"
                            y="320"
                            textAnchor="middle"
                            fontFamily="Caveat, cursive"
                            fontSize="20"
                            fill="currentColor"
                        >
                            ship it
                        </text>
                    </g>

                    {/* Marginalia */}
                    <g className="text-[#E94F37]">
                        <path
                            d="M 80 250 Q 60 280, 90 310"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            fill="none"
                            style={{ ['--len' as string]: '90' }}
                            className="xc-stroke xc-stroke-4"
                        />
                        <text
                            x="36"
                            y="245"
                            fontFamily="Caveat, cursive"
                            fontSize="18"
                            fill="currentColor"
                        >
                            ← yes!
                        </text>
                    </g>

                    {/* Annotated dot */}
                    <circle cx="290" cy="60" r="4" fill="#FFD23F" />
                    <text
                        x="270"
                        y="40"
                        fontFamily="Caveat, cursive"
                        fontSize="16"
                        fill="#7A7468"
                        className="dark:fill-[#8B857A]"
                    >
                        whoa
                    </text>
                </svg>
            </div>

            {/* Sticky note overlap */}
            <div
                className="xc-float absolute -bottom-6 -left-8 hidden w-44 rotate-[6deg] rounded-md bg-[#FFD23F] p-4 shadow-[6px_6px_0_0_#1A1A18] sm:block dark:shadow-[6px_6px_0_0_#F4EFE2]"
                style={{ ['--r' as string]: '6deg' }}
            >
                <p className="xc-hand text-lg leading-tight text-[#1A1A18]">
                    p.s. drag any arrow's tip — it bends.
                </p>
            </div>
        </div>
    );
}

function FeatureCard({
    rotation,
    accent,
    title,
    body,
    icon,
}: {
    rotation: string;
    accent: string;
    title: string;
    body: string;
    icon: React.ReactNode;
}) {
    return (
        <div
            className="xc-card group relative rounded-xl border-2 border-[#1A1A18] bg-[#FBF8F2] p-6 shadow-[6px_6px_0_0_#1A1A18] dark:border-[#F4EFE2] dark:bg-[#181715] dark:shadow-[6px_6px_0_0_#F4EFE2]"
            style={{ transform: `rotate(${rotation})` }}
        >
            <span
                className="absolute -right-3 -top-3 h-6 w-6 rounded-full border-2 border-[#1A1A18] dark:border-[#F4EFE2]"
                style={{ background: accent }}
            />
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg" style={{ background: `${accent}30` }}>
                {icon}
            </div>
            <h3 className="xc-display text-2xl font-semibold tracking-tight">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#3D3A33] dark:text-[#B8B0A0]">{body}</p>
        </div>
    );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
    return (
        <li className="flex gap-6 border-b border-dashed border-[#1A1A18]/15 pb-6 last:border-0 dark:border-[#F4EFE2]/15">
            <span className="xc-hand flex-shrink-0 text-5xl text-[#E94F37]">{n}</span>
            <div>
                <h4 className="xc-display text-2xl font-medium tracking-tight">{title}</h4>
                <p className="mt-2 text-[#3D3A33] dark:text-[#B8B0A0]">{body}</p>
            </div>
        </li>
    );
}

function IconRough() {
    return (
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path
                d="M5 22 C 9 14, 16 26, 21 16 S 28 12, 28 8"
                stroke="#1A1A18"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="dark:stroke-[#F4EFE2]"
            />
            <path
                d="M5 26 C 10 20, 18 30, 26 22"
                stroke="#E94F37"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

function IconArrow() {
    return (
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path
                d="M6 22 Q 16 6, 26 14"
                stroke="#1A1A18"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                className="dark:stroke-[#F4EFE2]"
            />
            <path
                d="M20 12 L 26 14 L 24 20"
                stroke="#1A1A18"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                className="dark:stroke-[#F4EFE2]"
            />
            <circle cx="6" cy="22" r="3" fill="#FFD23F" stroke="#1A1A18" strokeWidth="1.5" />
            <circle cx="26" cy="14" r="3" fill="#FFD23F" stroke="#1A1A18" strokeWidth="1.5" />
        </svg>
    );
}

function IconCanvas() {
    return (
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect
                x="4"
                y="6"
                width="24"
                height="20"
                rx="2"
                stroke="#1A1A18"
                strokeWidth="2.5"
                strokeDasharray="2 3"
                className="dark:stroke-[#F4EFE2]"
            />
            <circle cx="11" cy="14" r="2.5" fill="#E94F37" />
            <rect x="16" y="11" width="9" height="6" fill="#1971C2" />
        </svg>
    );
}

function IconSave() {
    return (
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path
                d="M16 4 V 20 M 9 14 L 16 21 L 23 14"
                stroke="#1A1A18"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="dark:stroke-[#F4EFE2]"
            />
            <path
                d="M5 26 H 27"
                stroke="#2F9E44"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
        </svg>
    );
}
