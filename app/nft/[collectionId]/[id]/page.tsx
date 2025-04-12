"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useWallet } from "@/components/wallet-provider"
import Image from "next/image"
import Link from "next/link"
import { Share2 } from "lucide-react"
import { PixelHeading } from "@/components/pixel-heading"
import { PixelIcon } from "@/components/pixel-icon"
import { PixelatedBackground } from "@/components/pixelated-background"
import { PixelLoading } from "@/components/pixel-loading"

interface NFTPageProps {
  params: {
    collectionId: string
    id: string
  }
}

export default function NFTPage({ params }: NFTPageProps) {
  const [nft, setNft] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { isConnected, connect } = useWallet()

  useEffect(() => {
    const fetchNFT = async () => {
      setLoading(true)
      try {
        // This would be replaced with an actual API call
        // For now, using mock data
        setTimeout(() => {
          const isGold = Math.random() > 0.7 // Randomly make some NFTs gold

          setNft({
            id: params.id,
            name: `${params.collectionId
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")} #${params.id}`,
            description: "A unique pixel art NFT minted on the Filecoin blockchain using AI generation.",
            image: `/placeholder.svg?height=500&width=500`,
            collection: {
              id: params.collectionId,
              name: params.collectionId
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" "),
            },
            owner: "0x1234...5678",
            creator: "0xabcd...efgh",
            price: "0.25 FIL",
            isGold,
            attributes: [
              { trait_type: "Background", value: "Blue" },
              { trait_type: "Rarity", value: isGold ? "Rare" : "Common" },
              { trait_type: "Generation", value: "1" },
              { trait_type: "Pixel Density", value: "64x64" },
              { trait_type: "Gold", value: isGold ? "Yes" : "No" },
            ],
            history: [
              { event: "Minted", from: "0xabcd...efgh", to: "0x1234...5678", price: "0.1 FIL", date: "2023-04-10" },
              { event: "Listed", from: "0x1234...5678", price: "0.25 FIL", date: "2023-04-12" },
            ],
          })
          setLoading(false)
        }, 1000)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load NFT details",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    fetchNFT()
  }, [params.collectionId, params.id, toast])

  const handleBuy = async () => {
    if (!isConnected) {
      try {
        await connect()
      } catch (error) {
        toast({
          title: "Connection failed",
          description: "Please connect your wallet to purchase this NFT",
          variant: "destructive",
        })
        return
      }
    }

    toast({
      title: "Purchase initiated",
      description: "Processing your transaction...",
    })

    // This would connect to your smart contract
    setTimeout(() => {
      toast({
        title: "Success!",
        description: `You've purchased ${nft?.name}`,
      })
    }, 2000)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: "Link copied",
      description: "NFT link copied to clipboard",
    })
  }

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

  if (!nft) {
    return (
      <div className="flex min-h-screen bg-gray-950 text-white">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-400 mb-4 font-pixel text-xs">NFT not found</p>
            <Button
              asChild
              className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
            >
              <Link href="/explore">
                <span className="font-pixel text-xs">BROWSE COLLECTIONS</span>
              </Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <Sidebar />
      <main className="flex-1 p-6 relative">
        <PixelatedBackground />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-4">
            <div
              className={`relative aspect-square rounded-none overflow-hidden border border-gray-800 pixel-corners ${nft.isGold ? "gold-gradient" : ""}`}
            >
              <div className={`w-full h-full ${nft.isGold ? "bg-black/50" : ""}`}>
                <Image src={nft.image || "/placeholder.svg"} alt={nft.name} fill className="object-cover pixelated" />
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={handleShare} className="rounded-none pixel-corners">
                <PixelIcon icon={Share2} className="h-4 w-4 mr-2" />
                <span className="font-pixel text-xs">SHARE</span>
              </Button>
              <Button variant="outline" size="sm" asChild className="rounded-none pixel-corners">
                <a href={`https://filfox.info/en/address/${nft.owner}`} target="_blank" rel="noopener noreferrer">
                  <span className="font-pixel text-xs">VIEW ON FILFOX</span>
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Link
                href={`/collection/${nft.collection.id}`}
                className="text-sm text-pixel-green hover:text-pixel-green/80 font-pixel text-xs"
              >
                {nft.collection.name}
              </Link>
              <PixelHeading
                text={nft.name}
                className={`text-2xl mt-2 ${nft.isGold ? "text-transparent bg-clip-text gold-gradient" : "text-white"}`}
              />
              <div className="flex items-center gap-2 mt-2">
                <p className="text-sm text-gray-400 font-pixel text-xs">
                  Owned by <span className="text-white">{nft.owner}</span>
                </p>
              </div>
            </div>

            <p className="text-gray-300">{nft.description}</p>

            <Card
              className={`bg-gray-900/80 border-gray-800 rounded-none pixel-corners ${nft.isGold ? "gold-gradient" : ""}`}
            >
              <CardContent className={`p-4 ${nft.isGold ? "bg-black/50" : ""}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-400 font-pixel text-xs">Current Price</p>
                    <p className={`text-xl font-pixel ${nft.isGold ? "text-gold-400" : "text-pixel-green"}`}>
                      {nft.price}
                    </p>
                  </div>
                  <Button
                    onClick={handleBuy}
                    className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
                  >
                    <span className="font-pixel text-xs">BUY NOW</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="attributes">
              <TabsList className="bg-gray-900/80 border-gray-800 w-full rounded-none pixel-corners">
                <TabsTrigger
                  value="attributes"
                  className="flex-1 data-[state=active]:bg-gray-800 rounded-none font-pixel text-xs"
                >
                  Attributes
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex-1 data-[state=active]:bg-gray-800 rounded-none font-pixel text-xs"
                >
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="attributes" className="mt-4">
                <div className="grid grid-cols-2 gap-2">
                  {nft.attributes.map((attr: any, index: number) => (
                    <div
                      key={index}
                      className={`bg-gray-800/80 p-3 rounded-none pixel-corners ${
                        attr.trait_type === "Rarity" && attr.value === "Rare" ? "gold-gradient" : ""
                      }`}
                    >
                      <p className="text-xs text-gray-400 font-pixel text-[10px]">{attr.trait_type}</p>
                      <p
                        className={`font-medium ${
                          (attr.trait_type === "Rarity" && attr.value === "Rare") ||
                          (attr.trait_type === "Gold" && attr.value === "Yes")
                            ? "text-gold-400"
                            : ""
                        }`}
                      >
                        {attr.value}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <div className="space-y-2">
                  {nft.history.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="bg-gray-800/80 p-3 rounded-none pixel-corners flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium font-pixel text-xs">{item.event}</p>
                        <p className="text-xs text-gray-400">
                          {item.from && `From: ${item.from}`}
                          {item.to && ` To: ${item.to}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={nft.isGold ? "text-gold-400" : "text-pixel-green"}>{item.price}</p>
                        <p className="text-xs text-gray-400">{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
