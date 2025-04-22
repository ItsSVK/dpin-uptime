"use client"

import { useEffect, useRef } from "react"

export function BackgroundGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Create gradient
    const drawGradient = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Create a radial gradient
      const gradient = ctx.createRadialGradient(
        canvas.width * 0.3, // x0
        canvas.height * 0.3, // y0
        0, // r0
        canvas.width * 0.3, // x1
        canvas.height * 0.3, // y1
        canvas.width * 0.7, // r1
      )

      // Add color stops
      gradient.addColorStop(0, "rgba(16, 185, 129, 0.15)")
      gradient.addColorStop(0.5, "rgba(5, 150, 105, 0.05)")
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

      // Fill with gradient
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    drawGradient()
    window.addEventListener("resize", drawGradient)

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      window.removeEventListener("resize", drawGradient)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" style={{ width: "100%", height: "100%" }} />
}
