"use client"

import type { FC, SVGProps } from "react"

export const PulseAnimation: FC<SVGProps<SVGSVGElement>> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      <animate attributeName="opacity" values="1;0.8;1" dur="2s" repeatCount="indefinite" />
    </svg>
  )
}
