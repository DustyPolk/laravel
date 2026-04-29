import { Head } from '@inertiajs/react';
import { DrawingEditor } from '@/components/draw/editor';
import type { DrawingPayload } from '@/components/draw/types';

interface Props {
    drawing: DrawingPayload;
}

export default function DrawingsEdit({ drawing }: Props) {
    return (
        <>
            <Head title={drawing.title || 'Untitled drawing'} />
            <DrawingEditor drawing={drawing} />
        </>
    );
}
