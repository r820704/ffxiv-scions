import { useId, type ReactNode } from 'react';

export type AccordionItemProps = {
  expanded: boolean;
  onToggle: () => void;
  header: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Single accordion item, controlled by parent.
 * - `header` is always rendered inside a clickable button.
 * - `children` (body) only rendered when `expanded` is true.
 * - Keyboard accessible via native button semantics (Tab + Enter/Space).
 * - Implements WAI-ARIA disclosure pattern: button has aria-controls linking to body region.
 */
export function AccordionItem({
  expanded,
  onToggle,
  header,
  children,
  className,
}: AccordionItemProps) {
  const bodyId = useId();

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={bodyId}
        className="w-full flex items-center gap-2 hover:bg-gray-700/50 transition-colors p-1 rounded text-left select-text"
      >
        <span className="text-gray-400 text-xs flex-shrink-0" aria-hidden="true">
          {expanded ? '▼' : '▶'}
        </span>
        <div className="flex-1 min-w-0">{header}</div>
      </button>
      {expanded && (
        <div id={bodyId} role="region" className="mt-2 pl-5">
          {children}
        </div>
      )}
    </div>
  );
}
