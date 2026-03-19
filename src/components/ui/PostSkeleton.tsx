import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

const PostSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="p-3 space-y-2.5 bg-card border-l-4 border-l-muted">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-2.5 w-16" />
          </div>
          <Skeleton className="h-2.5 w-10" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <div className="flex gap-1.5">
          {Array.from({ length: 5 }).map((_, j) => (
            <Skeleton key={j} className="flex-1 h-8 rounded-lg" />
          ))}
        </div>
      </Card>
    ))}
  </div>
);

export default PostSkeleton;
