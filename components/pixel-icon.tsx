import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface PixelIconProps {
  icon: LucideIcon
  className?: string
}

export function PixelIcon({ icon: Icon, className }: PixelIconProps) {
  return (
    <div className="relative">
      <Icon className={cn("relative z-10", className)} />
      <Icon className={cn("absolute top-0.5 left-0.5 text-black opacity-30 z-0", className)} />
    </div>
  )
}
