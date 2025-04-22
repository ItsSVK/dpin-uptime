import { AlertTriangle, Clock, Globe, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface WebsiteListStatsProps {
  websites: {
    id: string
    name: string
    url: string
    status: string
    uptime: number
    responseTime: number
    lastChecked: string
    tags: string[]
    monitoringSince: string
    checkFrequency: string
  }[]
}

export function WebsiteListStats({ websites }: WebsiteListStatsProps) {
  // Calculate statistics
  const totalWebsites = websites.length
  const onlineWebsites = websites.filter((website) => website.status === "online").length
  const offlineWebsites = websites.filter((website) => website.status === "offline").length
  const degradedWebsites = websites.filter((website) => website.status === "degraded").length

  const avgUptime = websites.reduce((sum, website) => sum + website.uptime, 0) / totalWebsites
  const avgResponseTime =
    websites.filter((website) => website.status === "online").reduce((sum, website) => sum + website.responseTime, 0) /
    onlineWebsites

  // Stats cards data
  const stats = [
    {
      title: "Total Websites",
      value: totalWebsites.toString(),
      icon: Globe,
      color: "text-zinc-400",
      bgColor: "bg-zinc-500/10",
    },
    {
      title: "Online",
      value: onlineWebsites.toString(),
      icon: Globe,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Issues",
      value: (offlineWebsites + degradedWebsites).toString(),
      icon: AlertTriangle,
      color: offlineWebsites > 0 ? "text-red-500" : degradedWebsites > 0 ? "text-amber-500" : "text-zinc-400",
      bgColor: offlineWebsites > 0 ? "bg-red-500/10" : degradedWebsites > 0 ? "bg-amber-500/10" : "bg-zinc-500/10",
    },
    {
      title: "Avg. Uptime",
      value: `${avgUptime.toFixed(2)}%`,
      icon: Clock,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Avg. Response",
      value: `${Math.round(avgResponseTime)}ms`,
      icon: Zap,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat, index) => (
        <Card key={index} className="border-zinc-800 bg-zinc-950">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-zinc-400">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            <div className={`${stat.bgColor} rounded-full p-2`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
