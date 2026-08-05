import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-ink/40 dark:bg-black/60 animate-[fadeIn_.15s_ease-out]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-paper dark:bg-paper-d rounded-t-2xl max-h-[88vh] flex flex-col animate-[slideUp_.22s_cubic-bezier(0.22,1,0.36,1)] shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
        <div className="flex items-center justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-9 h-1 rounded-full bg-line dark:bg-line-d" />
        </div>
        <div className="flex items-center justify-between px-5 pt-1 pb-3 shrink-0 border-b border-line dark:border-line-d">
          <h2 className="font-display font-bold text-[17px]">{title}</h2>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="p-1.5 -m-1.5 rounded-full text-ink-soft dark:text-ink-soft-d active:bg-paper-dim dark:active:bg-paper-dim-d"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto scroll-quiet px-5 py-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
