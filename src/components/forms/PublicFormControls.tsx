import type { ButtonHTMLAttributes, ReactNode } from "react";

export const PUBLIC_FORM_LABEL_CLASS =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-900";

export const PUBLIC_FORM_INPUT_CLASS =
  "w-full border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-500 placeholder:text-zinc-500 outline-none transition focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800/30";

type FormSubmitButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  children: ReactNode;
  loading?: boolean;
  loadingText?: string;
};

export function FormSubmitButton({
  children,
  loading = false,
  loadingText = "Please wait…",
  disabled,
  className = "",
  ...props
}: FormSubmitButtonProps) {
  return (
    <button
      {...props}
      type="submit"
      disabled={disabled || loading}
      className={`w-full bg-[#e63946] px-4 py-3 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-[#c1121f] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading ? loadingText : children}
    </button>
  );
}

type FormSecondaryButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  children: ReactNode;
};

export function FormSecondaryButton({
  children,
  className = "",
  ...props
}: FormSecondaryButtonProps) {
  return (
    <button
      {...props}
      type="button"
      className={`w-full px-4 py-2 text-xs font-medium text-zinc-600 underline-offset-4 transition-colors hover:text-[#e63946] hover:underline ${className}`}
    >
      {children}
    </button>
  );
}
