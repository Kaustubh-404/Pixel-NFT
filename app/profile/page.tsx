"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NFTCard } from "@/components/nft-card"
import { useWallet } from "@/components/wallet-provider"
import { fetchUserNFTs } from "@/lib/api"
import { Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { PixelHeading } from "@/components/pixel-heading"
import { PixelIcon } from "@/components/pixel-icon"
import { PixelatedBackground } from "@/components/pixelated-background"
import { PixelLoading } from "@/components/pixel-loading"

export default function ProfilePage() {
  const { address, isConnected, connect } = useWallet()
  const [userNFTs, setUserNFTs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadUserData = async () => {
      if (!isConnected || !address) return

      setLoading(true)
      try {
        const nfts = await fetchUserNFTs(address)
        setUserNFTs(nfts)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load your NFTs",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [address, isConnected, toast])

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const handleConnect = async () => {
    try {
      await connect()
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect wallet",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <Sidebar />
      <main className="flex-1 p-6 relative">
        <PixelatedBackground />

        <PixelHeading
          text="My Profile"
          className="text-2xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pixel-green to-pixel-blue"
        />

        {!isConnected ? (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-900/80 rounded-none border border-gray-800 pixel-corners relative z-10">
            <p className="text-gray-400 mb-4 font-pixel text-xs">Connect your wallet to view your profile</p>
            <Button
              onClick={handleConnect}
              className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
            >
              <span className="font-pixel text-xs">CONNECT WALLET</span>
            </Button>
          </div>
        ) : (
          <>
            <Card className="bg-gray-900/80 border-gray-800 mb-8 rounded-none pixel-corners relative z-10">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-pixel text-xs mb-2">Wallet</h2>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-800/80 px-3 py-1 rounded-none pixel-corners text-sm">{address}</code>
                      <Button variant="ghost" size="icon" onClick={copyAddress} className="rounded-none">
                        <PixelIcon icon={Copy} className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" asChild className="rounded-none">
                        <a href={`https://filfox.info/en/address/${address}`} target="_blank" rel="noopener noreferrer">
                          <PixelIcon icon={ExternalLink} className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                  <Button className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn">
                    <span className="font-pixel text-xs">EDIT PROFILE</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="my-nfts" className="relative z-10">
              <TabsList className="bg-gray-900/80 border-gray-800 rounded-none pixel-corners">
                <TabsTrigger
                  value="my-nfts"
                  className="data-[state=active]:bg-gray-800 rounded-none font-pixel text-xs"
                >
                  My NFTs
                </TabsTrigger>
                <TabsTrigger
                  value="created"
                  className="data-[state=active]:bg-gray-800 rounded-none font-pixel text-xs"
                >
                  Created Collections
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="data-[state=active]:bg-gray-800 rounded-none font-pixel text-xs"
                >
                  Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="my-nfts" className="mt-4">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <PixelLoading />
                  </div>
                ) : userNFTs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {userNFTs.map((nft) => (
                      <NFTCard
                        key={nft.id}
                        id={nft.id}
                        name={nft.name}
                        image={nft.image}
                        price={nft.price || "Not for sale"}
                        collectionId={nft.collection}
                        isGold={nft.id % 3 === 0} // Make some NFTs gold for demo
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 bg-gray-900/80 rounded-none border border-gray-800 pixel-corners">
                    <p className="text-gray-400 mb-4 font-pixel text-xs">You don't own any NFTs yet</p>
                    <Button
                      asChild
                      className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
                    >
                      <a href="/explore">
                        <span className="font-pixel text-xs">BROWSE COLLECTIONS</span>
                      </a>
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="created" className="mt-4">
                <div className="flex flex-col items-center justify-center h-64 bg-gray-900/80 rounded-none border border-gray-800 pixel-corners">
                  <p className="text-gray-400 mb-4 font-pixel text-xs">You haven't created any collections yet</p>
                  <Button
                    asChild
                    className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
                  >
                    <a href="/create">
                      <span className="font-pixel text-xs">CREATE COLLECTION</span>
                    </a>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="mt-4">
                <div className="bg-gray-900/80 rounded-none border border-gray-800 p-4 pixel-corners">
                  <div className="flex justify-between items-center p-3 border-b border-gray-800">
                    <div className="text-sm text-gray-400 font-pixel text-xs">Type</div>
                    <div className="text-sm text-gray-400 font-pixel text-xs">Item</div>
                    <div className="text-sm text-gray-400 font-pixel text-xs">Price</div>
                    <div className="text-sm text-gray-400 font-pixel text-xs">Time</div>
                  </div>
                  <div className="flex items-center justify-center h-32">
                    <p className="text-gray-400 font-pixel text-xs animate-pixel-fade">No activity yet</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  )
}
