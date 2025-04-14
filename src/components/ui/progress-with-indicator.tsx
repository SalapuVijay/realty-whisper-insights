
import React from "react";
import { cn } from "@/lib/utils";

interface ProgressWithIndicatorProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
  max?: number;
}

const ProgressWithIndicator = ({
  value,
  max = 100,
  className,
  indicatorClassName,
}: ProgressWithIndicatorProps) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  return (
    <div className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <div
        className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export { ProgressWithIndicator };
