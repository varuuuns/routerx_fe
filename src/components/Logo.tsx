export function Logo({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <span className={`text-xl font-extrabold tracking-tight ${light ? "text-white" : "text-ink"} ${className}`}>
      routerx
    </span>
  );
}
