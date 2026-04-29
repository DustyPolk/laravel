import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSceneStore } from './store';
import { getAllTools } from './tools';
import type { ToolKey } from './types';

export function Toolbar() {
    const tool = useSceneStore((s) => s.tool);
    const setTool = useSceneStore((s) => s.setTool);

    return (
        <div className="pointer-events-auto flex items-center rounded-xl border border-border bg-background/95 p-1 shadow-md backdrop-blur">
            <ToggleGroup
                type="single"
                value={tool}
                onValueChange={(value) => {
                    if (value) {
                        setTool(value as ToolKey);
                    }
                }}
                variant="default"
            >
                {getAllTools().map((descriptor) => {
                    const Icon = descriptor.icon;

                    return (
                        <Tooltip key={descriptor.key}>
                            <TooltipTrigger asChild>
                                <ToggleGroupItem
                                    value={descriptor.key}
                                    aria-label={descriptor.label}
                                    className="h-9 w-9"
                                >
                                    <Icon className="size-4" />
                                </ToggleGroupItem>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" sideOffset={6}>
                                {descriptor.label}
                                <span className="ml-1 text-muted-foreground">
                                    {descriptor.shortcut}
                                </span>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </ToggleGroup>
        </div>
    );
}
