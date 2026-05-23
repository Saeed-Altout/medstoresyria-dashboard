"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconEye } from "@tabler/icons-react";
import { formatDate } from "@/lib/utils/format";
import type { MaintenanceRequest, MaintenanceStatus } from "@/types";

const STATUS_VARIANT: Record<MaintenanceStatus, { variant: "secondary" | "outline" | "destructive"; className?: string }> = {
  pending: { variant: "outline", className: "text-amber-600 border-amber-300" },
  assigned: { variant: "secondary" },
  in_progress: { variant: "secondary", className: "bg-blue-100 text-blue-800" },
  completed: { variant: "secondary", className: "bg-green-100 text-green-800" },
  cancelled: { variant: "outline", className: "text-muted-foreground" },
};

interface GetMaintenanceColumnsArgs {
  tRequestNumber: string;
  tDeviceType: string;
  tTechnician: string;
  tUnassigned: string;
  tStatusLabels: Record<MaintenanceStatus, string>;
  onView: (req: MaintenanceRequest) => void;
}

export function getMaintenanceColumns({
  tRequestNumber,
  tDeviceType,
  tTechnician,
  tUnassigned,
  tStatusLabels,
  onView,
}: GetMaintenanceColumnsArgs): ColumnDef<MaintenanceRequest>[] {
  return [
    {
      id: "request_number",
      header: tRequestNumber,
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">#{row.original.request_number}</span>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{row.original.customer_name}</span>
          <span className="text-xs text-muted-foreground">{row.original.customer_phone}</span>
        </div>
      ),
    },
    {
      accessorKey: "device_type",
      header: tDeviceType,
      cell: ({ row }) => <span className="text-sm">{row.original.device_type}</span>,
    },
    {
      id: "technician",
      header: tTechnician,
      cell: ({ row }) =>
        row.original.technician ? (
          <span className="text-sm">
            {row.original.technician.first_name} {row.original.technician.last_name}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">{tUnassigned}</span>
        ),
    },
    {
      id: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.original.created_at)}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        const conf = STATUS_VARIANT[s];
        return (
          <Badge variant={conf.variant} className={conf.className}>
            {tStatusLabels[s]}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" className="size-7" onClick={() => onView(row.original)}>
            <IconEye className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}
