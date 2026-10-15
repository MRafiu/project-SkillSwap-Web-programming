function Badge({ children, variant = "blue", className = "" }) {
  const variants = {
    blue: "bg-brand-blue/10 text-brand-blue",
    purple: "bg-brand-purple/10 text-brand-purple",
    green: "bg-success/10 text-success",
    navy: "bg-white/10 text-white",
    gray: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;