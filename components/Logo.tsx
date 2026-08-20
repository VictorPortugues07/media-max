export function Logo({ className = "h-7 w-auto object-contain" }: { className?: string }) {
  return (
    <div className="flex items-center gap-2">
      <img
        src="/logo.svg"
        alt="Media Max"
        className={className}
      />
      <span className="font-bold tracking-tight text-slate-900 text-lg sm:text-xl font-heading">
        Media<span className="text-blue-600">Max</span>
      </span>
    </div>
  );
}