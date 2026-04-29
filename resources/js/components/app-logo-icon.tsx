import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
        >
            <rect
                x="6"
                y="6"
                width="52"
                height="52"
                rx="10"
                fill="#FFD23F"
                stroke="#1A1A18"
                strokeWidth="4"
                strokeLinejoin="round"
            />
            <path
                d="M14 42 Q 22 22, 32 34 T 50 28"
                fill="none"
                stroke="#E94F37"
                strokeWidth="4.5"
                strokeLinecap="round"
            />
            <circle cx="48" cy="18" r="3.5" fill="#1A1A18" />
        </svg>
    );
}
