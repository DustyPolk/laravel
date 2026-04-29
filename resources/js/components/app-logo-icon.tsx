import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" {...props}>
            <rect
                x="6"
                y="6"
                width="48"
                height="48"
                rx="6"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinejoin="round"
            />
            <path
                d="M14 38 Q 22 18, 30 30 T 46 26"
                fill="none"
                stroke="#E94F37"
                strokeWidth="3"
                strokeLinecap="round"
            />
            <circle cx="44" cy="20" r="3.5" fill="#FFD23F" />
        </svg>
    );
}
