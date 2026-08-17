import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-[#333333]",
  ghost: "bg-transparent text-ink hover:bg-surface",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
