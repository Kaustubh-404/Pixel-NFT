import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PixelHeading } from "@/components/pixel-heading"
import { PixelatedBackground } from "@/components/pixelated-background"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 relative">
      <PixelatedBackground />

      <div className="relative z-10 text-center space-y-6">
        <div className="font-pixel text-9xl text-pixel-green animate-pixel-bounce">404</div>

        <PixelHeading
          text="Page Not Found"
          className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-pixel-green to-pixel-blue"
        />

        <p className="max-w-md mx-auto text-gray-400">
          The page you're looking for doesn't exist or has been moved to another dimension.
        </p>

        <Button
          asChild
          className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn mt-4"
        >
          <Link href="/">
            <span className="font-pixel text-xs">RETURN HOME</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
