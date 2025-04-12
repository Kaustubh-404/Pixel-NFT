"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PixelHeading } from "@/components/pixel-heading"
import { PixelIcon } from "@/components/pixel-icon"

interface Collection {
  id: string
  name: string
  creator: string
  image: string
  items: number
  floorPrice: string
  isGold?: boolean
}

export function TrendingCollections() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const collectionsPerPage = 4

  useEffect(() => {
    // This would be replaced with an actual API call
    const demoCollections: Collection[] = [
      {
        id: "pixel-animals",
        name: "Pixel Animals",
        creator: "0x1234...5678",
        image: "/placeholder.svg?height=100&width=100",
        items: 100,
        floorPrice: "0.1 FIL",
      },
      {
        id: "golden-creatures",
        name: "Golden Creatures",
        creator: "0xabcd...efgh",
        image: "/placeholder.svg?height=100&width=100",
        items: 50,
        floorPrice: "0.2 FIL",
        isGold: true,
      },
      {
        id: "space-explorers",
        name: "Space Explorers",
        creator: "0x9876...5432",
        image: "/placeholder.svg?height=100&width=100",
        items: 75,
        floorPrice: "0.15 FIL",
      },
      {
        id: "pixel-legends",
        name: "Pixel Legends",
        creator: "0xijkl...mnop",
        image: "/placeholder.svg?height=100&width=100",
        items: 120,
        floorPrice: "0.25 FIL",
      },
      {
        id: "crypto-heroes",
        name: "Crypto Heroes",
        creator: "0x2345...6789",
        image: "/placeholder.svg?height=100&width=100",
        items: 85,
        floorPrice: "0.18 FIL",
      },
      {
        id: "retro-worlds",
        name: "Retro Worlds",
        creator: "0x3456...7890",
        image: "/placeholder.svg?height=100&width=100",
        items: 60,
        floorPrice: "0.12 FIL",
      },
      {
        id: "golden-artifacts",
        name: "Golden Artifacts",
        creator: "0x4567...8901",
        image: "/placeholder.svg?height=100&width=100",
        items: 40,
        floorPrice: "0.3 FIL",
        isGold: true,
      },
      {
        id: "8bit-monsters",
        name: "8-Bit Monsters",
        creator: "0x5678...9012",
        image: "/placeholder.svg?height=100&width=100",
        items: 95,
        floorPrice: "0.22 FIL",
      },
    ]

    setCollections(demoCollections)
  }, [])

  const totalPages = Math.ceil(collections.length / collectionsPerPage)

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }

  const displayedCollections = collections.slice(
    currentPage * collectionsPerPage,
    (currentPage + 1) * collectionsPerPage,
  )

  return (
    <div className="my-8 relative z-10">
      <div className="flex items-center justify-between mb-6">
        <PixelHeading text="Now Trending" className="text-xl text-white" />
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-none pixel-corners border-gray-700 bg-gray-800/50"
            onClick={prevPage}
          >
            <PixelIcon icon={ChevronLeft} className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-none pixel-corners border-gray-700 bg-gray-800/50"
            onClick={nextPage}
          >
            <PixelIcon icon={ChevronRight} className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayedCollections.map((collection) => (
          <Link key={collection.id} href={`/collection/${collection.id}`}>
            <div
              className={`bg-gray-900/80 border border-gray-800 rounded-none pixel-corners overflow-hidden hover:border-pixel-green transition-colors relative ${collection.isGold ? "gold-gradient" : ""}`}
            >
              <div className={`p-3 ${collection.isGold ? "bg-black/50" : ""}`}>
                <div className="flex items-center space-x-3">
                  <div className="relative h-12 w-12 rounded-none pixel-corners overflow-hidden">
                    <Image
                      src={collection.image || "/placeholder.svg"}
                      alt={collection.name}
                      fill
                      className="object-cover pixelated"
                    />
                  </div>
                  <div>
                    <h3 className="font-pixel text-xs text-white">{collection.name}</h3>
                    <p className="text-xs text-gray-400">by {collection.creator}</p>
                  </div>
                </div>
              </div>
              <div className="px-3 py-2 bg-gray-800/80 flex justify-between text-xs">
                <div>
                  <p className="text-gray-400 font-pixel text-[10px]">Items</p>
                  <p className="text-white">{collection.items}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-pixel text-[10px]">Floor</p>
                  <p className={collection.isGold ? "text-gold-400" : "text-pixel-green"}>{collection.floorPrice}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
