import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode, ButtonHTMLAttributes } from "react";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block mb-4">
      <span className="block text-[13px] font-medium text-ink-soft dark:text-ink-soft-d mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-line dark:border-line-d bg-paper-dim/50 dark:bg-paper-dim-d/50 px-3.5 py-2.5 text-[15px] text-ink dark:text-ink-d placeholder:text-ink-soft/50 dark:placeholder:text-ink-soft-d/50 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${inputClass} resize-none ${props.className ?? ""}`}
    />
  );
}

export function PrimaryButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`w-full rounded-xl bg-accent text-white font-semibold text-[15px] py-3 active:opacity-85 disabled:opacity-40 transition ${
        props.className ?? ""
      }`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`w-full rounded-xl border border-line dark:border-line-d font-medium text-[15px] py-3 active:bg-paper-dim dark:active:bg-paper-dim-d transition ${
        props.className ?? ""
      }`}
    >
      {children}
    </button>
  );
}
