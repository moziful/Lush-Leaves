import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  // Base classes
  const baseStyle =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed select-none";

  // Variant classes
  const variants = {
    primary: "bg-forest text-white hover:bg-forest-dark shadow-md shadow-forest/10",
    secondary: "bg-white/10 text-white border border-white/30 backdrop-blur-sm hover:bg-white/20",
    outline: "border border-forest text-forest hover:bg-forest/5 bg-transparent",
    danger: "border border-red-500/20 bg-red-500/10 text-red-600 hover:bg-red-500/20",
  };

  // Size classes
  const sizes = {
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}
