"use client"

import { useEffect, useRef } from "react"

export function PixelatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Grid settings
    const gridSize = 20
    const colors = [
      "rgba(46, 213, 115, 0.05)",
      "rgba(30, 144, 255, 0.05)",
      "rgba(0, 0, 0, 0)",
      "rgba(0, 0, 0, 0)",
      "rgba(0, 0, 0, 0)",
      "rgba(0, 0, 0, 0)",
    ]

    // Animation
    let frame = 0
    const animate = () => {
      frame++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw grid
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          // Random color based on position and time
          const colorIndex =
            Math.floor(
              ((Math.sin(x * 0.01 + frame * 0.01) + Math.cos(y * 0.01 + frame * 0.005) + 2) / 4) * colors.length,
            ) % colors.length

          ctx.fillStyle = colors[colorIndex]
          ctx.fillRect(x, y, gridSize, gridSize)
        }
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  )
}
