export default function LogsLoading() {
  return (
    <div className="space-y-6 animate-pulse p-1">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
          <div className="h-5 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
        <div className="h-4 w-96 bg-zinc-200 dark:bg-zinc-800 rounded-md opacity-70" />
      </div>

      {/* Bento Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border border-border p-6 rounded-lg space-y-4">
            <div className="h-3.5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="flex items-end justify-between">
              <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
              <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar Skeleton */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-muted/20 border border-border rounded-lg justify-between">
        <div className="flex flex-wrap gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
          ))}
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
          <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-md" />
        </div>
      </div>

      {/* Logs Table Skeleton */}
      <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col min-h-[400px]">
        {/* Table Header */}
        <div className="grid grid-cols-12 border-b border-border bg-muted/40 p-4">
          <div className="col-span-3 h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="col-span-2 h-3 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="col-span-5 h-3 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="col-span-2 h-3 w-12 bg-zinc-200 dark:bg-zinc-800 rounded ml-auto" />
        </div>

        {/* Table Rows Skeleton */}
        <div className="flex-1 divide-y divide-border/40">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="grid grid-cols-12 p-4 items-center gap-4">
              <div className="col-span-3 h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="col-span-2 h-5 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              <div className="col-span-5 h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="col-span-2 h-4 w-16 bg-zinc-200 dark:bg-zinc-800 rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
