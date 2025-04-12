import { cn } from "@/lib/utils"

interface PixelHeadingProps {
  text: string
  className?: string
}

export function PixelHeading({ text, className }: PixelHeadingProps) {
  return (
    <h1 className={cn("font-pixel relative", className)}>
      <span className="relative z-10">{text}</span>
      <span className="absolute -bottom-1 -right-1 text-black opacity-50 z-0">{text}</span>
    </h1>
  )
}
