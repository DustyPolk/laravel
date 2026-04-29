import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="relative flex h-16 shrink-0 items-center gap-3 border-b border-dashed border-[#1A1A18]/20 bg-[#FBF8F2] px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 dark:border-[#F4EFE2]/15 dark:bg-[#0E0E0C]">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1" />
                <span className="hidden h-6 w-px bg-[#1A1A18]/20 sm:block dark:bg-[#F4EFE2]/20" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
        </header>
    );
}
