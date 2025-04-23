"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ResponseTimeChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [timeRange, setTimeRange] = useState("Last 24 hours")

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Mock data for the response time chart
    const hours = 24
    const data = Array.from({ length: hours }, () => {
      // Generate random response time between 150ms and 250ms
      const baseResponseTime = 150 + Math.random() * 100

      // Occasionally add some spikes (about 10% of the time)
      if (Math.random() < 0.1) {
        return baseResponseTime + Math.random() * 300
      }

      return baseResponseTime
    })

    const labels = Array.from({ length: hours }, (_, i) => {
      return `${i}:00`
    })

    // Draw chart
    const drawChart = () => {
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Chart dimensions
      const chartWidth = canvas.width - 60
      const chartHeight = canvas.height - 60
      const maxValue = Math.max(...data) * 1.1
      const minValue = Math.min(...data) * 0.9

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

      // Draw line chart
      ctx.beginPath()
      ctx.strokeStyle = "#10b981" // emerald-500
      ctx.lineWidth = 2

      // Create gradient for area under the line
      const gradient = ctx.createLinearGradient(0, 20, 0, chartHeight + 20)
      gradient.addColorStop(0, "rgba(16, 185, 129, 0.2)") // emerald-500 with opacity
      gradient.addColorStop(1, "rgba(16, 185, 129, 0)") // transparent

      // Draw points and connect them
      data.forEach((value, index) => {
        const x = 40 + (chartWidth / (hours - 1)) * index
        const normalizedValue = ((value - minValue) / (maxValue - minValue)) * chartHeight
        const y = chartHeight + 20 - normalizedValue

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        // Draw point
        ctx.fillStyle = "#10b981" // emerald-500
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fill()
      })

      // Stroke the line
      ctx.stroke()

      // Fill area under the line
      ctx.lineTo(40 + chartWidth, chartHeight + 20)
      ctx.lineTo(40, chartHeight + 20)
      ctx.fillStyle = gradient
      ctx.fill()

      // Draw x-axis labels
      ctx.fillStyle = "#a1a1aa" // zinc-400
      ctx.font = "10px Inter, sans-serif"
      ctx.textAlign = "center"
      for (let i = 0; i < hours; i += 4) {
        const x = 40 + (chartWidth / (hours - 1)) * i
        ctx.fillText(labels[i], x, chartHeight + 35)
      }

      // Draw y-axis labels
      ctx.fillStyle = "#a1a1aa" // zinc-400
      ctx.font = "10px Inter, sans-serif"
      ctx.textAlign = "right"
      for (let i = 0; i <= 5; i++) {
        const value = minValue + ((maxValue - minValue) / 5) * (5 - i)
        const y = 20 + (chartHeight / 5) * i
        ctx.fillText(`${Math.round(value)}ms`, 35, y + 3)
      }

      // Draw average line
      const avgResponseTime = data.reduce((sum, value) => sum + value, 0) / data.length
      const avgY = chartHeight + 20 - ((avgResponseTime - minValue) / (maxValue - minValue)) * chartHeight

      ctx.beginPath()
      ctx.strokeStyle = "#f59e0b" // amber-500
      ctx.setLineDash([4, 4])
      ctx.moveTo(40, avgY)
      ctx.lineTo(chartWidth + 40, avgY)
      ctx.stroke()
      ctx.setLineDash([])

      // Label for average
      ctx.fillStyle = "#f59e0b" // amber-500
      ctx.font = "10px Inter, sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`Avg: ${Math.round(avgResponseTime)}ms`, 45, avgY - 5)
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
          <CardTitle>Response Time</CardTitle>
          <CardDescription>Response time measurements over time</CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-2">
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
      </CardContent>
    </Card>
  )
}
