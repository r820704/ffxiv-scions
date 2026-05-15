import type { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type HelpDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Screen-reader-only description; omitted from visual UI. */
  srDescription: string;
  children: ReactNode;
};

/** Generic help/usage dialog used by every page's `?` toggle. */
export default function HelpDialog({
  isOpen,
  onClose,
  title,
  srDescription,
  children,
}: HelpDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-amber-300 text-lg">{title}</DialogTitle>
          <DialogDescription className="sr-only">{srDescription}</DialogDescription>
        </DialogHeader>
        <div className="text-sm">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

/** Section header inside a HelpDialog body. */
export function HelpSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-4">
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      {children}
    </section>
  );
}
