import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center rounded-md border-2 border-[#1A1A18] bg-[#FBF8F2] text-[#1A1A18] shadow-[2px_2px_0_0_#1A1A18] dark:border-[#F4EFE2] dark:bg-[#0E0E0C] dark:text-[#F4EFE2] dark:shadow-[2px_2px_0_0_#F4EFE2]">
                <AppLogoIcon className="size-6" />
            </div>
            <div className="ml-1 grid flex-1 text-left">
                <span className="font-display truncate text-lg font-semibold leading-tight tracking-tight">
                    OpenDraw
                </span>
                <span className="font-hand truncate text-sm leading-none text-[#E94F37] dark:text-[#FFD23F]">
                    sketchpad
                </span>
            </div>
        </>
    );
}
