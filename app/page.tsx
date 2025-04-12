import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TrendingCollections } from "@/components/trending-collections"
import { HowItWorks } from "@/components/how-it-works"
import { Sidebar } from "@/components/sidebar"
import { ConnectWallet } from "@/components/connect-wallet"
import { PixelatedBackground } from "@/components/pixelated-background"
import { PixelHeading } from "@/components/pixel-heading"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <Sidebar />
      <main className="flex-1 p-6 relative overflow-hidden">
        <PixelatedBackground />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="relative w-full max-w-2xl">
            <Input
              type="text"
              placeholder="Search for collections..."
              className="w-full bg-gray-900/80 border-gray-800 rounded-none pixel-corners h-10 text-sm"
            />
          </div>
          <div className="flex gap-2 ml-4">
            <ConnectWallet />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center my-12 space-y-8 relative z-10">
          <PixelHeading
            text="[start a new NFT]"
            className="text-3xl text-center text-transparent bg-clip-text bg-gradient-to-r from-pixel-green to-pixel-blue animate-pixel-bounce"
          />

          <div className="w-full max-w-xl mx-auto relative">
            <div className="absolute inset-0 gold-gradient opacity-20 blur-sm -m-1 rounded-lg"></div>
            <div className="flex w-full gap-0 relative">
              <Input
                type="text"
                placeholder="Enter theme/idea for your NFT..."
                className="bg-gray-900/90 border-gray-800 rounded-none rounded-l-sm h-12 border-r-0 pixel-corners"
              />
              <Link href="/create">
                <Button className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel px-6 rounded-none rounded-r-sm h-12 pixel-btn">
                  CREATE
                </Button>
              </Link>
            </div>
          </div>

          <div className="text-center text-sm text-gray-400 max-w-md">
            <p>Generate unique pixel art NFTs using AI and mint them on Filecoin</p>
          </div>
        </div>

        <TrendingCollections />
        <HowItWorks />
      </main>
    </div>
  )
}
