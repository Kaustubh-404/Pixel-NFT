"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { NFTCard } from "@/components/nft-card"
import { useToast } from "@/components/ui/use-toast"
import { fetchCollection } from "@/lib/api"
import { PixelHeading } from "@/components/pixel-heading"
import { PixelatedBackground } from "@/components/pixelated-background"
import { PixelLoading } from "@/components/pixel-loading"

interface CollectionPageProps {
  params: {
    id: string
  }
}

export default function CollectionPage({ params }: CollectionPageProps) {
  const [collection, setCollection] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const getCollection = async () => {
      try {
        // This would be replaced with actual API call
        const data = await fetchCollection(params.id)
        setCollection(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load collection",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    getCollection()
  }, [params.id, toast])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-950 text-white">
        <Sidebar />
        <main className="flex-1 p-6 flex items-center justify-center">
          <PixelLoading />
        </main>
      </div>
    )
  }

  // Fallback for demo purposes
  const demoCollection = {
    id: params.id,
    name: params.id
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    creator: "0x1234...5678",
    description: `A collection of pixel art NFTs featuring ${params.id.replace(/-/g, " ")} minted on Filecoin`,
    items: Array(8)
      .fill(null)
      .map((_, i) => ({
        id: i,
        name: `${params.id
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")} #${i + 1}`,
        image: `/placeholder.svg?height=300&width=300`,
        price: (0.1 + i * 0.05).toFixed(2),
        isGold: i === 0 || i === 3, // Make some NFTs gold for demo
      })),
    isGold: params.id.includes("gold") || params.id.includes("golden"),
  }

  const collectionData = collection || demoCollection

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <Sidebar />
      <main className="flex-1 p-6 relative">
        <PixelatedBackground />

        <div className="mb-8 relative z-10">
          <PixelHeading
            text={collectionData.name}
            className={`text-2xl mb-2 ${
              collectionData.isGold
                ? "text-transparent bg-clip-text gold-gradient"
                : "text-transparent bg-clip-text bg-gradient-to-r from-pixel-green to-pixel-blue"
            }`}
          />
          <div className="flex items-center gap-4 mb-4">
            <div className="text-sm text-gray-400">
              Created by <span className="text-pixel-green">{collectionData.creator}</span>
            </div>
            <div className="text-sm px-2 py-1 bg-gray-800/80 rounded-none pixel-corners font-pixel text-[10px]">
              {collectionData.items.length} items
            </div>
          </div>
          <p className="text-gray-300 max-w-2xl">{collectionData.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
          {collectionData.items.map((item: any) => (
            <NFTCard
              key={item.id}
              id={item.id}
              name={item.name}
              image={item.image}
              price={item.price}
              collectionId={collectionData.id}
              isGold={item.isGold}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
