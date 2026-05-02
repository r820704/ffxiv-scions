import * as RadixTooltip from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';

export type TooltipProps = {
  label: ReactNode;
  children: ReactNode;
  /** Delay in ms before tooltip appears. Default 200. */
  delayDuration?: number;
};

/**
 * Lightweight wrapper around Radix Tooltip. Faster + more customizable than
 * the native HTML `title` attribute (~1s delay, no touch support).
 */
export function Tooltip({ label, children, delayDuration = 200 }: TooltipProps) {
  if (!label) return <>{children}</>;
  return (
    <RadixTooltip.Provider delayDuration={delayDuration}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side="top"
            sideOffset={4}
            className="z-50 px-2 py-1 text-xs bg-gray-900 text-gray-100 border border-gray-700 rounded shadow-lg animate-in fade-in-0 zoom-in-95"
          >
            {label}
            <RadixTooltip.Arrow className="fill-gray-900" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
