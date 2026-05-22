"use client";

import { type Icon as TablerIcon } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: TablerIcon;
  description?: string;
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, description, className }: StatsCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-5 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="size-9 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="size-5 text-primary" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
