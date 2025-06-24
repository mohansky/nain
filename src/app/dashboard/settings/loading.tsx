import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  // Add fallback UI that will be shown while the route is loading.
  return <Skeleton className="container max-w-lg h-96 mx-auto" />;
}