import { ArrowDown, ArrowUp, Clock, Globe, Shield, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface WebsiteOverviewProps {
  website: {
    name: string
    url: string
    status: string
    uptime: {
      day: number
      week: number
      month: number
      year: number
    }
    responseTime: {
      current: number
      average: {
        day: number
        week: number
        month: number
      }
    }
    lastChecked: string
    monitoringSince: string
    checkFrequency: string
  }
}

export function WebsiteOverview({ website }: WebsiteOverviewProps) {
  // Mock data for the overview metrics
  const metrics = [
    {
      title: "Current Status",
      value: website.status === "online" ? "Online" : "Offline",
      icon: Globe,
      color: website.status === "online" ? "text-emerald-500" : "text-red-500",
      bgColor: website.status === "online" ? "bg-emerald-500/10" : "bg-red-500/10",
    },
    {
      title: "Response Time",
      value: `${website.responseTime.current}ms`,
      description: `Avg: ${website.responseTime.average.day}ms today`,
      icon: Zap,
      trend: website.responseTime.current < website.responseTime.average.day ? "down" : "up",
      trendValue:
        Math.abs(
          Math.round(
            ((website.responseTime.current - website.responseTime.average.day) / website.responseTime.average.day) *
              100,
          ),
        ) + "%",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Uptime (30 days)",
      value: `${website.uptime.month}%`,
      description: `${(30 * 24 * 60 * (100 - website.uptime.month)) / 100} minutes downtime`,
      icon: ArrowUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "SSL Certificate",
      value: "Valid",
      description: "Expires in 45 days",
      icon: Shield,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Last Downtime",
      value: "3 days ago",
      description: "Duration: 4 minutes",
      icon: Clock,
      color: "text-zinc-400",
      bgColor: "bg-zinc-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
      {metrics.map((metric, index) => (
        <Card key={index} className="border-zinc-800 bg-zinc-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-400">{metric.title}</span>
              <div className={`${metric.bgColor} rounded-full p-1`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold">{metric.value}</div>
            {metric.description && <p className="mt-1 text-xs text-zinc-500">{metric.description}</p>}
            {metric.trend && (
              <div className="mt-2 flex items-center gap-1 text-xs">
                {metric.trend === "down" ? (
                  <ArrowDown className="h-3 w-3 text-emerald-500" />
                ) : (
                  <ArrowUp className="h-3 w-3 text-red-500" />
                )}
                <span className={metric.trend === "down" ? "text-emerald-500" : "text-red-500"}>
                  {metric.trendValue}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
