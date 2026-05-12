import type { ReactNode } from 'react';

export interface PageHeadProps {
  title: string;
  description?: string;
  numeral?: string;
  actions?: ReactNode;
}

export default function PageHead({ title, description, numeral, actions }: PageHeadProps) {
  return (
    <header className="flex items-start gap-4 mb-6 pb-4 border-b border-[rgba(197,182,157,0.10)]">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="font-title text-2xl sm:text-3xl font-semibold text-primary tracking-[0.06em] m-0 leading-tight">
            {title}
          </h1>
          {numeral && (
            <span className="text-[12px] tracking-[0.32em] text-primary/70 uppercase">
              {numeral}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1.5 max-w-[60ch] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </header>
  );
}
