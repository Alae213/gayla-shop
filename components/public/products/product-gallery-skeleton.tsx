export function ProductGallerySkeleton() {
  return (
    <div className="space-y-4">
      <div className="aspect-square rounded-2xl bg-system-100 animate-pulse" />
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="aspect-square rounded-lg bg-system-100 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
