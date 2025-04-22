"use client"

import { useEffect, useState } from "react"

export function AnimatedPing() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Start visible
    setVisible(true)

    // Set up ping intervals
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => setVisible(true), 200)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative flex h-4 w-4 items-center justify-center">
      <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></div>
      <div
        className={`h-3 w-3 rounded-full bg-emerald-500 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      ></div>
    </div>
  )
}
