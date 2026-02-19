import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full">
      <div className="aspect-square bg-system-100 animate-pulse" />
      <CardContent className="p-4 space-y-3">
        <div className="h-4 w-16 bg-system-200 rounded-full animate-pulse" />
        <div className="h-5 w-full bg-system-200 rounded animate-pulse" />
        <div className="h-5 w-3/4 bg-system-200 rounded animate-pulse" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="h-6 w-24 bg-system-200 rounded animate-pulse" />
      </CardFooter>
    </Card>
  );
}
