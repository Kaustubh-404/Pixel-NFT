"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NFTCard } from "@/components/nft-card"
import { useAccount } from "wagmi"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { useToast } from "@/components/ui/use-toast"
import { PixelHeading } from "@/components/pixel-heading"
import { PixelatedBackground } from "@/components/pixelated-background"
import { PixelLoading } from "@/components/pixel-loading"
import { ArrowUpDown, Filter } from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Rarity } from "@/lib/contracts/nft-contract"
import { ListNFTDialog } from "@/components/list-nft-dialog"

// For demo purposes, we'll simulate fetching user NFTs
// In a real implementation, this would come from the blockchain and IPFS
const fetchUserNFTs = async (address: string) => {
  // Add a little delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 800))
  
  return Array(6)
    .fill(null)
    .map((_, i) => ({
      id: `token_${i}`,
      name: `My Pixel NFT #${i + 1}`,
      image: `/placeholder.svg?height=300&width=300`,
      collection: i % 2 === 0 ? "Pixel Animals" : "Golden Creatures",
      collectionId: i % 2 === 0 ? "pixel-animals" : "golden-creatures",
      acquired: new Date().toISOString(),
      status: i % 3 === 0 ? "listed" : "owned",
      rarity: i % 3 === 0 ? Rarity.S_TIER : (i % 3 === 1 ? Rarity.A_TIER : Rarity.B_TIER),
      price: (0.1 + i * 0.05).toFixed(2),
      metadataUrl: `ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi_${i}`,
      isListed: i % 3 === 0,
      isOwned: true,
      listingId: i % 3 === 0 ? `listing_${i}` : undefined
    }))
}

export default function MyNFTsPage() {
  const { address, isConnected } = useAccount()
  const [userNFTs, setUserNFTs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [selectedNFT, setSelectedNFT] = useState<any>(null)
  const [showListDialog, setShowListDialog] = useState(false)
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

  // Filter NFTs based on the selected filter
  const filteredNFTs = userNFTs.filter(nft => {
    if (filter === "all") return true
    if (filter === "listed") return nft.isListed
    if (filter === "owned") return !nft.isListed
    if (filter === "stier") return nft.rarity === Rarity.S_TIER
    if (filter === "atier") return nft.rarity === Rarity.A_TIER
    if (filter === "btier") return nft.rarity === Rarity.B_TIER
    return true
  })

  // Sort NFTs based on the selected sort option
  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    if (sortBy === "price-low") return parseFloat(a.price) - parseFloat(b.price)
    if (sortBy === "price-high") return parseFloat(b.price) - parseFloat(a.price)
    if (sortBy === "rarity-high") return b.rarity - a.rarity
    if (sortBy === "rarity-low") return a.rarity - b.rarity
    // For "recent" (default), keep the original order which simulates most recent first
    return 0
  })
  
  const handleListNFT = (nft: any) => {
    setSelectedNFT(nft)
    setShowListDialog(true)
  }

  return (
    <div className="relative">
      <PixelatedBackground />
      
      <PixelHeading
        text="My NFTs"
        className="text-2xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pixel-green to-pixel-blue"
      />

      {!isConnected ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-900/80 rounded-none border border-gray-800 pixel-corners relative z-10">
          <p className="text-gray-400 mb-4 font-pixel text-xs">Connect your wallet to view your NFTs</p>
          <ConnectWalletButton />
        </div>
      ) : (
        <div className="relative z-10">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <TabsList className="bg-gray-900/80 border-gray-800 rounded-none pixel-corners">
                <TabsTrigger 
                  value="all" 
                  onClick={() => setFilter("all")}
                  className="data-[state=active]:bg-gray-800 rounded-none font-pixel text-xs"
                >
                  All NFTs
                </TabsTrigger>
                <TabsTrigger 
                  value="listed" 
                  onClick={() => setFilter("listed")}
                  className="data-[state=active]:bg-gray-800 rounded-none font-pixel text-xs"
                >
                  Listed
                </TabsTrigger>
                <TabsTrigger 
                  value="owned" 
                  onClick={() => setFilter("owned")}
                  className="data-[state=active]:bg-gray-800 rounded-none font-pixel text-xs"
                >
                  Not Listed
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-gray-900/80 border-gray-800 rounded-none pixel-corners">
                      <ArrowUpDown className="mr-1 h-3 w-3" />
                      <span className="font-pixel text-[10px]">SORT</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-900 border-gray-800 rounded-none pixel-corners">
                    <DropdownMenuLabel className="font-pixel text-xs">Sort By</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem 
                      className="font-pixel text-[10px]" 
                      onClick={() => setSortBy("recent")}
                    >
                      Most Recent
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="font-pixel text-[10px]" 
                      onClick={() => setSortBy("price-low")}
                    >
                      Price: Low to High
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="font-pixel text-[10px]" 
                      onClick={() => setSortBy("price-high")}
                    >
                      Price: High to Low
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="font-pixel text-[10px]" 
                      onClick={() => setSortBy("rarity-high")}
                    >
                      Rarity: High to Low
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="font-pixel text-[10px]" 
                      onClick={() => setSortBy("rarity-low")}
                    >
                      Rarity: Low to High
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-gray-900/80 border-gray-800 rounded-none pixel-corners"
                    >
                      <Filter className="mr-1 h-3 w-3" />
                      <span className="font-pixel text-[10px]">FILTER</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-900 border-gray-800 rounded-none pixel-corners">
                    <DropdownMenuLabel className="font-pixel text-xs">Rarity</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem 
                      className="font-pixel text-[10px]" 
                      onClick={() => setFilter("all")}
                    >
                      All Rarities
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="font-pixel text-[10px] gold-gradient text-black" 
                      onClick={() => setFilter("stier")}
                    >
                      S-Tier Only
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="font-pixel text-[10px] text-pixel-purple" 
                      onClick={() => setFilter("atier")}
                    >
                      A-Tier Only
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="font-pixel text-[10px] text-pixel-blue" 
                      onClick={() => setFilter("btier")}
                    >
                      B-Tier Only
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-gray-900/80 border-gray-800 rounded-none pixel-corners"
                  onClick={() => {
                    setFilter("all")
                    setSortBy("recent")
                  }}
                >
                  <span className="font-pixel text-[10px]">RESET</span>
                </Button>
              </div>
            </div>
            
            <TabsContent value="all" className="mt-0">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <PixelLoading />
                </div>
              ) : sortedNFTs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {sortedNFTs.map((nft) => (
                    <NFTCard
                      key={nft.id}
                      id={nft.id}
                      name={nft.name}
                      image={nft.image}
                      price={nft.price}
                      collectionId={nft.collectionId}
                      rarity={nft.rarity}
                      isListed={nft.isListed}
                      isOwned={true}
                      listingId={nft.listingId}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-gray-900/80 rounded-none border border-gray-800 pixel-corners">
                  <p className="text-gray-400 mb-4 font-pixel text-xs">No NFTs found with the current filter</p>
                  <Button
                    onClick={() => setFilter("all")}
                    className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
                  >
                    <span className="font-pixel text-xs">VIEW ALL NFTs</span>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="listed" className="mt-0">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <PixelLoading />
                </div>
              ) : sortedNFTs.some(nft => nft.isListed) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {sortedNFTs.filter(nft => nft.isListed).map((nft) => (
                    <NFTCard
                      key={nft.id}
                      id={nft.id}
                      name={nft.name}
                      image={nft.image}
                      price={nft.price}
                      collectionId={nft.collectionId}
                      rarity={nft.rarity}
                      isListed={true}
                      isOwned={true}
                      listingId={nft.listingId}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-gray-900/80 rounded-none border border-gray-800 pixel-corners">
                  <p className="text-gray-400 mb-4 font-pixel text-xs">You haven't listed any NFTs for sale</p>
                  <Button
                    asChild
                    className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
                  >
                    <Link href="/explore">
                      <span className="font-pixel text-xs">EXPLORE MARKETPLACE</span>
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="owned" className="mt-0">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <PixelLoading />
                </div>
              ) : sortedNFTs.some(nft => !nft.isListed) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {sortedNFTs.filter(nft => !nft.isListed).map((nft) => (
                    <NFTCard
                      key={nft.id}
                      id={nft.id}
                      name={nft.name}
                      image={nft.image}
                      price={nft.price}
                      collectionId={nft.collectionId}
                      rarity={nft.rarity}
                      isListed={false}
                      isOwned={true}
                      listingId={nft.listingId}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-gray-900/80 rounded-none border border-gray-800 pixel-corners">
                  <p className="text-gray-400 mb-4 font-pixel text-xs">All of your NFTs are currently listed for sale</p>
                  <Button
                    asChild
                    className="bg-pixel-blue hover:bg-pixel-blue/80 text-white font-pixel rounded-none pixel-corners pixel-btn"
                  >
                    <Link href="/create">
                      <span className="font-pixel text-xs">CREATE NEW NFTs</span>
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {/* NFT Listing Dialog */}
      {selectedNFT && (
        <ListNFTDialog 
          open={showListDialog} 
          onOpenChange={setShowListDialog}
          nft={selectedNFT}
        />
      )}
    </div>
  )
}


// "use client"

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { NFTCard } from "@/components/nft-card"
// import { useWallet } from "@/components/wallet-provider"
// import { fetchUserNFTs } from "@/lib/api"
// import { useToast } from "@/components/ui/use-toast"
// import { PixelHeading } from "@/components/pixel-heading"
// import { PixelatedBackground } from "@/components/pixelated-background"
// import { PixelLoading } from "@/components/pixel-loading"
// import { ArrowUpDown, Filter } from "lucide-react"
// import { 
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import Link from "next/link"

// export default function MyNFTsPage() {
//   const { address, isConnected, connect } = useWallet()
//   const [userNFTs, setUserNFTs] = useState<any[]>([])
//   const [loading, setLoading] = useState(false)
//   const [filter, setFilter] = useState("all")
//   const [sortBy, setSortBy] = useState("recent")
//   const { toast } = useToast()

//   useEffect(() => {
//     const loadUserData = async () => {
//       if (!isConnected || !address) return

//       setLoading(true)
//       try {
//         // Add a little delay to simulate API call
//         await new Promise(resolve => setTimeout(resolve, 800))
        
//         const nfts = await fetchUserNFTs(address)
        
//         // Add some variety to the NFTs for demonstration
//         const enhancedNFTs = nfts.map((nft, index) => ({
//           ...nft,
//           price: (0.1 + Math.random() * 0.5).toFixed(2),
//           isGold: index === 0 || index === 3, // Make some NFTs gold
//           status: index % 3 === 0 ? "listed" : "owned",
//           collection: index % 2 === 0 ? "Pixel Animals" : "Golden Creatures",
//           collectionId: index % 2 === 0 ? "pixel-animals" : "golden-creatures",
//         }))
        
//         setUserNFTs(enhancedNFTs)
//       } catch (error) {
//         toast({
//           title: "Error",
//           description: "Failed to load your NFTs",
//           variant: "destructive",
//         })
//       } finally {
//         setLoading(false)
//       }
//     }

//     loadUserData()
//   }, [address, isConnected, toast])

//   const handleConnect = async () => {
//     try {
//       await connect()
//     } catch (error) {
//       toast({
//         title: "Connection failed",
//         description: "Failed to connect wallet",
//         variant: "destructive",
//       })
//     }
//   }

//   // Filter NFTs based on the selected filter
//   const filteredNFTs = userNFTs.filter(nft => {
//     if (filter === "all") return true
//     if (filter === "listed") return nft.status === "listed"
//     if (filter === "owned") return nft.status === "owned"
//     if (filter === "gold") return nft.isGold
//     return true
//   })

//   // Sort NFTs based on the selected sort option
//   const sortedNFTs = [...filteredNFTs].sort((a, b) => {
//     if (sortBy === "price-low") return parseFloat(a.price) - parseFloat(b.price)
//     if (sortBy === "price-high") return parseFloat(b.price) - parseFloat(a.price)
//     // For "recent" (default), keep the original order which simulates most recent first
//     return 0
//   })

//   return (
//     <div className="relative">
//       <PixelatedBackground />
      
//       <PixelHeading
//         text="My NFTs"
//         className="text-2xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pixel-green to-pixel-blue"
//       />

//       {!isConnected ? (
//         <div className="flex flex-col items-center justify-center h-64 bg-gray-900/80 rounded-none border border-gray-800 pixel-corners relative z-10">
//           <p className="text-gray-400 mb-4 font-pixel text-xs">Connect your wallet to view your NFTs</p>
//           <Button
//             onClick={handleConnect}
//             className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
//           >
//             <span className="font-pixel text-xs">CONNECT WALLET</span>
//           </Button>
//         </div>
//       ) : (
//         <div className="relative z-10">
//           <Tabs defaultValue="owned" className="w-full">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//               <TabsList className="bg-gray-900/80 border-gray-800 rounded-none pixel-corners">
//                 <TabsTrigger 
//                   value="owned" 
//                   onClick={() => setFilter("all")}
//                   className="data-[state=active]:bg-gray-800 rounded-none font-pixel text-xs"
//                 >
//                   All NFTs
//                 </TabsTrigger>
//                 <TabsTrigger 
//                   value="listed" 
//                   onClick={() => setFilter("listed")}
//                   className="data-[state=active]:bg-gray-800 rounded-none font-pixel text-xs"
//                 >
//                   Listed
//                 </TabsTrigger>
//                 <TabsTrigger 
//                   value="gold" 
//                   onClick={() => setFilter("gold")}
//                   className="data-[state=active]:bg-gray-800 rounded-none font-pixel text-xs"
//                 >
//                   Gold NFTs
//                 </TabsTrigger>
//               </TabsList>
              
//               <div className="flex items-center gap-2">
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button variant="outline" size="sm" className="bg-gray-900/80 border-gray-800 rounded-none pixel-corners">
//                       <ArrowUpDown className="mr-1 h-3 w-3" />
//                       <span className="font-pixel text-[10px]">SORT</span>
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent className="bg-gray-900 border-gray-800 rounded-none pixel-corners">
//                     <DropdownMenuLabel className="font-pixel text-xs">Sort By</DropdownMenuLabel>
//                     <DropdownMenuSeparator className="bg-gray-800" />
//                     <DropdownMenuItem 
//                       className="font-pixel text-[10px]" 
//                       onClick={() => setSortBy("recent")}
//                     >
//                       Most Recent
//                     </DropdownMenuItem>
//                     <DropdownMenuItem 
//                       className="font-pixel text-[10px]" 
//                       onClick={() => setSortBy("price-low")}
//                     >
//                       Price: Low to High
//                     </DropdownMenuItem>
//                     <DropdownMenuItem 
//                       className="font-pixel text-[10px]" 
//                       onClick={() => setSortBy("price-high")}
//                     >
//                       Price: High to Low
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
                
//                 <Button 
//                   variant="outline" 
//                   size="sm" 
//                   className="bg-gray-900/80 border-gray-800 rounded-none pixel-corners"
//                   onClick={() => setFilter("all")} // Reset filter
//                 >
//                   <Filter className="mr-1 h-3 w-3" />
//                   <span className="font-pixel text-[10px]">RESET</span>
//                 </Button>
//               </div>
//             </div>
            
//             <TabsContent value="owned" className="mt-0">
//               {loading ? (
//                 <div className="flex items-center justify-center h-64">
//                   <PixelLoading />
//                 </div>
//               ) : sortedNFTs.length > 0 ? (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                   {sortedNFTs.map((nft) => (
//                     <NFTCard
//                       key={nft.id}
//                       id={nft.id}
//                       name={nft.name}
//                       image={nft.image}
//                       price={nft.price}
//                       collectionId={nft.collectionId}
//                       isGold={nft.isGold}
//                     />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="flex flex-col items-center justify-center h-64 bg-gray-900/80 rounded-none border border-gray-800 pixel-corners">
//                   <p className="text-gray-400 mb-4 font-pixel text-xs">No NFTs found with the current filter</p>
//                   <Button
//                     onClick={() => setFilter("all")}
//                     className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
//                   >
//                     <span className="font-pixel text-xs">VIEW ALL NFTs</span>
//                   </Button>
//                 </div>
//               )}
//             </TabsContent>
            
//             <TabsContent value="listed" className="mt-0">
//               {loading ? (
//                 <div className="flex items-center justify-center h-64">
//                   <PixelLoading />
//                 </div>
//               ) : sortedNFTs.some(nft => nft.status === "listed") ? (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                   {sortedNFTs.filter(nft => nft.status === "listed").map((nft) => (
//                     <NFTCard
//                       key={nft.id}
//                       id={nft.id}
//                       name={nft.name}
//                       image={nft.image}
//                       price={nft.price}
//                       collectionId={nft.collectionId}
//                       isGold={nft.isGold}
//                     />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="flex flex-col items-center justify-center h-64 bg-gray-900/80 rounded-none border border-gray-800 pixel-corners">
//                   <p className="text-gray-400 mb-4 font-pixel text-xs">You haven't listed any NFTs for sale</p>
//                   <Button
//                     asChild
//                     className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
//                   >
//                     <Link href="/explore">
//                       <span className="font-pixel text-xs">EXPLORE COLLECTIONS</span>
//                     </Link>
//                   </Button>
//                 </div>
//               )}
//             </TabsContent>
            
//             <TabsContent value="gold" className="mt-0">
//               {loading ? (
//                 <div className="flex items-center justify-center h-64">
//                   <PixelLoading />
//                 </div>
//               ) : sortedNFTs.some(nft => nft.isGold) ? (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                   {sortedNFTs.filter(nft => nft.isGold).map((nft) => (
//                     <NFTCard
//                       key={nft.id}
//                       id={nft.id}
//                       name={nft.name}
//                       image={nft.image}
//                       price={nft.price}
//                       collectionId={nft.collectionId}
//                       isGold={nft.isGold}
//                     />
//                   ))}
//                 </div>
//               ) : (
//                 <div className="flex flex-col items-center justify-center h-64 bg-gray-900/80 rounded-none border border-gray-800 pixel-corners">
//                   <p className="text-gray-400 mb-4 font-pixel text-xs">You don't own any gold rarity NFTs</p>
//                   <Button
//                     asChild
//                     className="gold-gradient hover:opacity-90 text-black font-pixel rounded-none pixel-corners pixel-btn"
//                   >
//                     <Link href="/explore">
//                       <span className="font-pixel text-xs">FIND GOLD NFTs</span>
//                     </Link>
//                   </Button>
//                 </div>
//               )}
//             </TabsContent>
//           </Tabs>
//         </div>
//       )}
//     </div>
//   )
// }