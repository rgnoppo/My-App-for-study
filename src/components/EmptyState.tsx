export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="w-11 h-11 rounded-full border-2 border-dashed border-line dark:border-line-d mb-3" />
      <p className="text-[15px] font-medium text-ink-soft dark:text-ink-soft-d">
        {title}
      </p>
      {hint && (
        <p className="text-[13px] text-ink-soft/70 dark:text-ink-soft-d/70 mt-1 max-w-[220px]">
          {hint}
        </p>
      )}
    </div>
  );
}
