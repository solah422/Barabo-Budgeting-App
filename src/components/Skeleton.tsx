/**
 * Author: -Solah-
 * OS support: -Windows and Android Mobile-
 * Description: Reusable skeleton loader component for UI placeholders.
 */
import React from 'react';
import { cn } from '../utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={cn("bg-slate-200 dark:bg-slate-800 animate-shimmer rounded-lg", className)} />
  );
};

/** --- End of Skeleton.tsx --- */
