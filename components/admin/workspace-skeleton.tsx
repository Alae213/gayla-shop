/**
 * Workspace Loading Skeleton
 * 
 * Displayed while admin components are lazy loading.
 * Prevents layout shift and improves perceived performance.
 */

export function WorkspaceSkeleton() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between p-6 border-b border-[#ECECEC]">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-[#F5F5F5] rounded-lg" />
          <div className="h-6 w-48 bg-[#F5F5F5] rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-32 bg-[#F5F5F5] rounded-lg" />
          <div className="h-10 w-10 bg-[#F5F5F5] rounded-lg" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-4 px-6 py-4 border-b border-[#ECECEC]">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 w-24 bg-[#F5F5F5] rounded-lg" />
        ))}
      </div>

      {/* Kanban board skeleton */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="flex gap-6 h-full">
          {/* Columns */}
          {[1, 2, 3, 4].map((col) => (
            <div key={col} className="flex flex-col w-[320px] shrink-0">
              {/* Column header */}
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-[#F5F5F5] rounded" />
                  <div className="h-5 w-20 bg-[#F5F5F5] rounded" />
                  <div className="h-6 w-8 bg-[#F5F5F5] rounded-full" />
                </div>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((card) => (
                  <div
                    key={card}
                    className="bg-white rounded-tracking-card p-4 shadow-tracking border border-[#ECECEC]"
                  >
                    {/* Card header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-[#F5F5F5] rounded mb-2" />
                        <div className="h-5 w-32 bg-[#F5F5F5] rounded" />
                      </div>
                      <div className="h-5 w-5 bg-[#F5F5F5] rounded" />
                    </div>

                    {/* Product info */}
                    <div className="space-y-2 mb-3">
                      <div className="h-4 w-full bg-[#F5F5F5] rounded" />
                      <div className="h-4 w-3/4 bg-[#F5F5F5] rounded" />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#ECECEC]">
                      <div className="h-4 w-20 bg-[#F5F5F5] rounded" />
                      <div className="h-5 w-24 bg-[#F5F5F5] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact skeleton for smaller loading states
 */
export function CompactSkeleton() {
  return (
    <div className="flex items-center justify-center h-64 animate-pulse">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 bg-[#F5F5F5] rounded-full" />
        <div className="h-4 w-32 bg-[#F5F5F5] rounded" />
      </div>
    </div>
  );
}

/**
 * Order details skeleton (for side panel)
 */
export function OrderDetailsSkeleton() {
  return (
    <div className="flex flex-col h-full p-8 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-4 w-32 bg-[#F5F5F5] rounded mb-3" />
        <div className="h-8 w-48 bg-[#F5F5F5] rounded mb-2" />
        <div className="h-6 w-40 bg-[#F5F5F5] rounded-full" />
      </div>

      {/* Customer details */}
      <div className="mb-8">
        <div className="h-5 w-36 bg-[#F5F5F5] rounded mb-4" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-10 w-10 bg-[#F5F5F5] rounded-lg" />
              <div className="flex-1">
                <div className="h-4 w-full bg-[#F5F5F5] rounded mb-2" />
                <div className="h-4 w-2/3 bg-[#F5F5F5] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order summary */}
      <div className="bg-[#F7F7F7] rounded-2xl p-6">
        <div className="h-4 w-28 bg-[#E0E0E0] rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-32 bg-[#E0E0E0] rounded" />
              <div className="h-4 w-20 bg-[#E0E0E0] rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-auto pt-6">
        <div className="h-12 w-full bg-[#F5F5F5] rounded-lg" />
      </div>
    </div>
  );
}
