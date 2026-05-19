import type { ReactNode } from 'react';

export interface PageHeadProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function PageHead({ title, description, actions }: PageHeadProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-start gap-3 md:gap-4 mb-6 pb-4 border-b border-[rgba(197,182,157,0.10)]">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <h1 className="font-title text-2xl sm:text-3xl font-semibold text-primary tracking-[0.06em] m-0 leading-tight">
            {title}
          </h1>
          {description && (
            <span className="hidden md:inline text-sm text-muted-foreground/80">
              — {description}
            </span>
          )}
        </div>
        {description && (
          <p className="md:hidden text-sm text-muted-foreground mt-1.5 max-w-[60ch] leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">{actions}</div>}
    </header>
  );
}
