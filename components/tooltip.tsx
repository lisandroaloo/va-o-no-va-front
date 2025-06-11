"use client"

import type React from "react"

import { useState } from "react"

interface TooltipProps {
  content: string
  children: React.ReactNode
  position?: "top" | "bottom" | "left" | "right"
  maxWidth?: string
}

export function Tooltip({ content, children, position = "top", maxWidth = "max-w-xs" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-3",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-3",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-3",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-3",
  }

  const arrowClasses = {
    top: "top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800 border-4",
    bottom:
      "bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800 border-4",
    left: "left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800 border-4",
    right:
      "right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800 border-4",
  }

  return (
    <div className="relative inline-block">
      <div onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)} className="cursor-help">
        {children}
      </div>
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]}`}>
          <div className={`bg-gray-800 text-white text-sm rounded-lg p-3 ${maxWidth} shadow-xl border border-gray-700`}>
            <div className="leading-relaxed">{content}</div>
            <div className={`absolute w-0 h-0 ${arrowClasses[position]}`}></div>
          </div>
        </div>
      )}
    </div>
  )
}
