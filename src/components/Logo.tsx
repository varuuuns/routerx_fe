export function Logo({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <span className={`font-serif text-2xl italic ${light ? "text-white" : "text-ink"} ${className}`}>
      routerx
    </span>
  );
}
