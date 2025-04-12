import { PixelLoading } from "@/components/pixel-loading"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <PixelLoading />
        <p className="mt-4 font-pixel text-xs text-pixel-green">Loading PixelNFT...</p>
      </div>
    </div>
  )
}
