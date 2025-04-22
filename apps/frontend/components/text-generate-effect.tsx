"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface TextGenerateEffectProps {
  words: string
  className?: string
}

export const TextGenerateEffect: React.FC<TextGenerateEffectProps> = ({ words, className = "" }) => {
  const [displayedContent, setDisplayedContent] = useState("")
  const [index, setIndex] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    // Start typing effect
    if (index < words.length) {
      const timeout = setTimeout(() => {
        setDisplayedContent(words.substring(0, index + 1))
        setIndex(index + 1)
      }, 30) // Adjust speed as needed

      return () => clearTimeout(timeout)
    } else {
      // Typing finished
      const cursorTimeout = setTimeout(() => {
        setShowCursor(false)
      }, 1000)

      return () => clearTimeout(cursorTimeout)
    }
  }, [index, words])

  return (
    <div className={className}>
      <div className="relative text-left">
        <span>{displayedContent}</span>
        {showCursor && <span className="animate-blink absolute">|</span>}
      </div>
    </div>
  )
}
