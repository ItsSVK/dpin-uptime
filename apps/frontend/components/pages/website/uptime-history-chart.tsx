"use client"

import { useEffect, useRef, useState } from "react"
import { Calendar, ChevronDown, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function UptimeHistoryChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [timeRange, setTimeRange] = useState("Last 7 days")

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Mock data for the uptime chart
    const days = 30
    const data = Array.from({ length: days }, () => {
      // Generate random uptime between 99.5 and 100
      const baseUptime = 99.5 + Math.random() * 0.5

      // Occasionally add some downtime (about 10% of the time)
      if (Math.random() < 0.1) {
        return Math.max(98, baseUptime - Math.random() * 2)
      }

      return baseUptime
    })

    const labels = Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1) + i)
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    })

    // Draw chart
    const drawChart = () => {
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Chart dimensions
      const chartWidth = canvas.width - 60
      const chartHeight = canvas.height - 60
      const barWidth = Math.max(1, chartWidth / days - 1)
      const barSpacing = 1
      const maxValue = 100
      const minValue = Math.min(...data) - 0.5

      // Draw axes
      ctx.beginPath()
      ctx.strokeStyle = "#3f3f46" // zinc-700
      ctx.moveTo(40, 20)
      ctx.lineTo(40, chartHeight + 20)
      ctx.lineTo(chartWidth + 40, chartHeight + 20)
      ctx.stroke()

      // Draw horizontal grid lines
      ctx.beginPath()
      ctx.strokeStyle = "#27272a" // zinc-800
      ctx.setLineDash([2, 2])
      for (let i = 0; i <= 5; i++) {
        const y = 20 + (chartHeight / 5) * i
        ctx.moveTo(40, y)
        ctx.lineTo(chartWidth + 40, y)
      }
      ctx.stroke()
      ctx.setLineDash([])

      // Draw bars
      data.forEach((value, index) => {
        const x = 40 + index * (barWidth + barSpacing)
        const normalizedValue = ((value - minValue) / (maxValue - minValue)) * chartHeight
        const barHeight = normalizedValue
        const y = chartHeight + 20 - barHeight

        // Determine color based on uptime value
        let color
        if (value >= 99.9) {
          color = "#10b981" // emerald-500
        } else if (value >= 99.5) {
          color = "#f59e0b" // amber-500
        } else {
          color = "#ef4444" // red-500
        }

        // Draw bar
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0])
        ctx.fill()

        // Draw label (only every few bars to avoid crowding)
        if (index % Math.ceil(days / 10) === 0) {
          ctx.fillStyle = "#a1a1aa" // zinc-400
          ctx.font = "10px Inter, sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(labels[index], x + barWidth / 2, chartHeight + 35)
        }
      })

      // Draw y-axis labels
      ctx.fillStyle = "#a1a1aa" // zinc-400
      ctx.font = "10px Inter, sans-serif"
      ctx.textAlign = "right"
      for (let i = 0; i <= 5; i++) {
        const value = minValue + ((maxValue - minValue) / 5) * (5 - i)
        const y = 20 + (chartHeight / 5) * i
        ctx.fillText(`${value.toFixed(1)}%`, 35, y + 3)
      }

      // Draw incidents markers
      const incidents = [
        { day: 5, duration: "4m" },
        { day: 12, duration: "2m" },
        { day: 23, duration: "8m" },
      ]

      incidents.forEach((incident) => {
        const x = 40 + incident.day * (barWidth + barSpacing) + barWidth / 2

        // Draw marker
        ctx.fillStyle = "#ef4444" // red-500
        ctx.beginPath()
        ctx.arc(x, 15, 4, 0, Math.PI * 2)
        ctx.fill()

        // Draw line to bar
        ctx.beginPath()
        ctx.strokeStyle = "#ef4444" // red-500
        ctx.setLineDash([2, 2])
        ctx.moveTo(x, 15)
        ctx.lineTo(x, chartHeight + 20 - ((data[incident.day] - minValue) / (maxValue - minValue)) * chartHeight)
        ctx.stroke()
        ctx.setLineDash([])
      })
    }

    drawChart()

    // Redraw on window resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      drawChart()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [timeRange])

  return (
    <Card className="border-zinc-800 bg-zinc-950">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-1">
          <CardTitle>Uptime History</CardTitle>
          <CardDescription>Historical uptime percentage for this website</CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1 border-zinc-800 bg-zinc-950 text-xs">
            <Calendar className="h-3.5 w-3.5" />
            <span>Apr 1 - Apr 30</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1 border-zinc-800 bg-zinc-950 text-xs">
                {timeRange}
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-950">
              <DropdownMenuItem onClick={() => setTimeRange("Last 24 hours")}>Last 24 hours</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("Last 7 days")}>Last 7 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("Last 30 days")}>Last 30 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("Last 90 days")}>Last 90 days</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon" className="h-8 w-8 border-zinc-800 bg-zinc-950">
            <Download className="h-3.5 w-3.5" />
            <span className="sr-only">Download data</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <canvas ref={canvasRef} className="h-full w-full" />
        </div>
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-emerald-500"></div>
            <span className="text-xs text-zinc-400">99.9% - 100%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-amber-500"></div>
            <span className="text-xs text-zinc-400">99.5% - 99.9%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-red-500"></div>
            <span className="text-xs text-zinc-400">&lt; 99.5%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-3 w-3 items-center justify-center rounded-full bg-red-500"></div>
            <span className="text-xs text-zinc-400">Incident</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
