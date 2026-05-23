"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Skeleton } from "@/components/ui/skeleton"
import { getDailyRevenue } from "@/lib/api/reports.api"

const chartConfig = {
  revenue: {
    label: "Revenue (USD)",
    color: "var(--primary)",
  },
} satisfies ChartConfig

function getRange(days: number) {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - days)
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  }
}

export function ChartAreaInteractive() {
  const t = useTranslations("reports")
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d")
  }, [isMobile])

  const days = timeRange === "90d" ? 90 : timeRange === "7d" ? 7 : 30
  const { from, to } = getRange(days)

  const { data: rawData, isLoading } = useQuery({
    queryKey: ["daily-revenue", from, to],
    queryFn: () => getDailyRevenue(from, to),
  })

  const chartData = (rawData ?? []).map((d) => ({
    date: d.date,
    revenue: parseFloat(d.revenue),
    orders: d.orderCount,
  }))

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{t("daily_revenue_chart")}</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            {timeRange === "90d" ? "Last 3 months" : timeRange === "30d" ? "Last 30 days" : "Last 7 days"}
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">Last 3 months</SelectItem>
              <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
              <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <Skeleton className="aspect-auto h-62.5 w-full" />
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-62.5 w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
              />
              <YAxis hide />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="revenue"
                type="natural"
                fill="url(#fillRevenue)"
                stroke="var(--color-revenue)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
