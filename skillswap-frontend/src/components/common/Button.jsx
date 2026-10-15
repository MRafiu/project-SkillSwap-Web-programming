function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  className = "",
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-brand-blue text-white hover:bg-brand-blueLight shadow-soft hover:shadow-card",

    purple:
      "bg-brand-purple text-white hover:bg-purple-700 shadow-soft hover:shadow-card",

    outline:
      "bg-white text-navy border border-gray-200 hover:border-brand-blue hover:text-brand-blue",

    outlineOnDark:
      "bg-transparent text-white border border-white/30 hover:bg-white/10 hover:border-white",

    ghost:
      "bg-transparent text-navy hover:bg-surface",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;