"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Dialog as SheetPrimitive } from "radix-ui";
import { IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDirection } from "@/hooks/use-direction";

// ─── Size variants ────────────────────────────────────────────────────────────

const sheetSizeVariants = cva(
  "fixed inset-y-0 z-50 flex flex-col bg-background shadow-xl transition-transform duration-300 ease-in-out",
  {
    variants: {
      size: {
        sm: "w-full sm:max-w-sm",
        md: "w-full sm:max-w-md",
        lg: "w-full sm:max-w-lg",
        xl: "w-full sm:max-w-xl",
        "2xl": "w-full sm:max-w-2xl",
        "3xl": "w-full sm:max-w-3xl",
      },
    },
    defaultVariants: { size: "md" },
  },
);

// ─── Sub-components ───────────────────────────────────────────────────────────

function AppSheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function AppSheet({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root {...props} />;
}

export function AppSheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger {...props} />;
}

export function AppSheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close {...props} />;
}

// ─── Content ──────────────────────────────────────────────────────────────────

interface AppSheetContentProps
  extends
    React.ComponentProps<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetSizeVariants> {}

export function AppSheetContent({
  className,
  size,
  children,
  ...props
}: AppSheetContentProps) {
  const { isRTL } = useDirection();

  const sideClasses = isRTL
    ? "end-0 border-e data-open:animate-in data-open:slide-in-from-left data-closed:animate-out data-closed:slide-out-to-left"
    : "end-0 border-s data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right";

  return (
    <SheetPrimitive.Portal>
      <AppSheetOverlay />
      <SheetPrimitive.Content
        className={cn(sheetSizeVariants({ size }), sideClasses, className)}
        {...props}
      >
        {children}
        <SheetPrimitive.Close asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 end-3 z-10 size-8 rounded-full"
            aria-label="Close"
          >
            <IconX className="size-4" />
          </Button>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

// ─── Layout sections ──────────────────────────────────────────────────────────

export function AppSheetHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "shrink-0 flex flex-col gap-1 border-b bg-muted/40 px-5 py-4 pe-12",
        className,
      )}
      {...props}
    />
  );
}

export function AppSheetBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex-1 overflow-y-auto px-5 py-4", className)}
      {...props}
    />
  );
}

export function AppSheetFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "shrink-0 flex items-center justify-end gap-2 border-t bg-muted/40 px-5 py-3",
        className,
      )}
      {...props}
    />
  );
}

// ─── Title / Description ──────────────────────────────────────────────────────

export function AppSheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      className={cn("text-base font-semibold leading-none", className)}
      {...props}
    />
  );
}

export function AppSheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
