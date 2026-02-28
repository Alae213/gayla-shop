export function ProductInfoSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-6 w-20 bg-system-200 animate-pulse rounded" />
        <div className="h-12 w-3/4 bg-system-200 animate-pulse rounded" />
        <div className="h-10 w-32 bg-system-200 animate-pulse rounded" />
      </div>
      
      <div className="h-px bg-system-200" />
      
      <div className="space-y-2">
        <div className="h-4 w-full bg-system-100 animate-pulse rounded" />
        <div className="h-4 w-full bg-system-100 animate-pulse rounded" />
        <div className="h-4 w-3/4 bg-system-100 animate-pulse rounded" />
      </div>
      
      <div className="h-px bg-system-200" />
      
      <div className="h-48 bg-system-100 animate-pulse rounded-xl" />
    </div>
  );
}
