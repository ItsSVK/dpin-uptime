import { Check, X } from "lucide-react"

interface TrackedSiteProps {
  name: string
  status: "up" | "down"
  uptimePercentage: number
  responseTime: number
  downtime?: string
}

export function TrackedSite({ name, status, uptimePercentage, responseTime, downtime }: TrackedSiteProps) {
  return (
    <div className="group relative rounded-lg border border-zinc-800 bg-zinc-950 p-4 transition-all hover:bg-zinc-900/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {status === "up" ? (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            </div>
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20">
              <X className="h-3.5 w-3.5 text-red-500" />
            </div>
          )}
          <h3 className="font-medium">{name}</h3>
        </div>
        <span className="text-xs text-zinc-500">{uptimePercentage}%</span>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${status === "up" ? "bg-emerald-500" : "bg-red-500"}`}></div>
          <span className={status === "up" ? "text-emerald-500" : "text-red-500"}>
            {status === "up" ? "Online" : "Offline"}
          </span>
        </div>
        {status === "up" ? (
          <span className="text-zinc-400">{responseTime}ms</span>
        ) : (
          <span className="text-zinc-400">Down {downtime}</span>
        )}
      </div>
    </div>
  )
}
