import { Skeleton } from "@/components/ui/skeleton";

const PageSkeleton = () => (
  <div className="page-skeleton">
    <Skeleton className="h-4 w-2/5" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />

    <div className="skeleton-card">
      {[...Array(5)].map((_, i) => (
        <Skeleton
          key={i}
          className="mx-4 h-[52px] rounded-lg"
        />
      ))}
    </div>
  </div>
);

export default PageSkeleton;