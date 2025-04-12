"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import Image from "next/image"
import { fetchTrendingCollections } from "@/lib/api"
import { Search } from "lucide-react"
import { PixelHeading } from "@/components/pixel-heading"
import { PixelatedBackground } from "@/components/pixelated-background"
import { PixelLoading } from "@/components/pixel-loading"

export default function ExplorePage() {
  const [collections, setCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("trending")

  useEffect(() => {
    const loadCollections = async () => {
      setLoading(true)
      try {
        // This would be replaced with an actual API call with filters
        const data = await fetchTrendingCollections()

        // Add more mock collections for the explore page
        const moreCollections = [
          {
            id: "pixel-monsters",
            name: "Pixel Monsters",
            creator: "0x5678...9012",
            image: "/placeholder.svg?height=100&width=100",
            items: 85,
            floorPrice: "0.12 FIL",
          },
          {
            id: "crypto-punks-pixel",
            name: "Crypto Punks Pixel",
            creator: "0x3456...7890",
            image: "/placeholder.svg?height=100&width=100",
            items: 150,
            floorPrice: "0.3 FIL",
            isGold: true,
          },
          {
            id: "pixel-landscapes",
            name: "Pixel Landscapes",
            creator: "0x7890...1234",
            image: "/placeholder.svg?height=100&width=100",
            items: 60,
            floorPrice: "0.08 FIL",
          },
          {
            id: "retro-arcade",
            name: "Retro Arcade",
            creator: "0x2345...6789",
            image: "/placeholder.svg?height=100&width=100",
            items: 110,
            floorPrice: "0.18 FIL",
          },
          {
            id: "pixel-heroes",
            name: "Pixel Heroes",
            creator: "0x8901...2345",
            image: "/placeholder.svg?height=100&width=100",
            items: 95,
            floorPrice: "0.22 FIL",
            isGold: true,
          },
          {
            id: "8bit-cities",
            name: "8-Bit Cities",
            creator: "0x4567...8901",
            image: "/placeholder.svg?height=100&width=100",
            items: 70,
            floorPrice: "0.15 FIL",
          },
        ]

        setCollections([...data, ...moreCollections])
      } catch (error) {
        console.error("Failed to load collections:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCollections()
  }, [])

  const filteredCollections = collections.filter((collection) =>
    collection.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const sortedCollections = [...filteredCollections].sort((a, b) => {
    if (sortBy === "price-low") {
      return Number.parseFloat(a.floorPrice) - Number.parseFloat(b.floorPrice)
    } else if (sortBy === "price-high") {
      return Number.parseFloat(b.floorPrice) - Number.parseFloat(a.floorPrice)
    } else if (sortBy === "items") {
      return b.items - a.items
    }
    // Default: trending
    return 0
  })

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <Sidebar />
      <main className="flex-1 p-6 relative">
        <PixelatedBackground />

        <PixelHeading
          text="Explore Collections"
          className="text-2xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pixel-green to-pixel-blue"
        />

        <div className="flex flex-col md:flex-row gap-4 mb-8 relative z-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search collections..."
              className="pl-10 bg-gray-900/80 border-gray-800 rounded-none pixel-corners"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[180px] bg-gray-900/80 border-gray-800 rounded-none pixel-corners">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800 rounded-none pixel-corners">
              <SelectItem value="trending" className="font-pixel text-xs">
                Trending
              </SelectItem>
              <SelectItem value="price-low" className="font-pixel text-xs">
                Price: Low to High
              </SelectItem>
              <SelectItem value="price-high" className="font-pixel text-xs">
                Price: High to Low
              </SelectItem>
              <SelectItem value="items" className="font-pixel text-xs">
                Most Items
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <PixelLoading />
          </div>
        ) : sortedCollections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
            {sortedCollections.map((collection) => (
              <Link key={collection.id} href={`/collection/${collection.id}`}>
                <div
                  className={`bg-gray-900/80 border border-gray-800 rounded-none overflow-hidden hover:border-pixel-green transition-colors h-full flex flex-col pixel-corners relative ${collection.isGold ? "gold-gradient" : ""}`}
                >
                  <div className={`relative aspect-video ${collection.isGold ? "bg-black/50" : ""}`}>
                    <Image
                      src={collection.image || "/placeholder.svg"}
                      alt={collection.name}
                      fill
                      className="object-cover pixelated"
                    />
                  </div>
                  <div className="p-4 flex-1">
                    <h3 className="font-pixel text-xs mb-1">{collection.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">by {collection.creator}</p>
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="text-gray-400 font-pixel text-[10px]">Items</p>
                        <p className="font-medium">{collection.items}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 font-pixel text-[10px]">Floor</p>
                        <p className={collection.isGold ? "text-gold-400 font-medium" : "text-pixel-green font-medium"}>
                          {collection.floorPrice}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-900/80 rounded-none border border-gray-800 pixel-corners relative z-10">
            <p className="text-gray-400 mb-4 font-pixel text-xs">No collections found</p>
            <Button
              onClick={() => setSearchQuery("")}
              className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
            >
              <span className="font-pixel text-xs">CLEAR SEARCH</span>
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
