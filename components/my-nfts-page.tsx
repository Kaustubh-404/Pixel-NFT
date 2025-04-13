"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NFTCard } from "@/components/nft-card"
import { useWallet } from "@/components/wallet-provider"
import { fetchUserNFTs } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { PixelHeading } from "@/components/pixel-heading"
import { PixelatedBackground } from "@/components/pixelated-background"
import { PixelLoading } from "@/components/pixel-loading"
import { ArrowUpDown, Filter, Landmark, FolderOpen, RefreshCw } from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ConnectWallet } from "./connect-wallet"

export default function MyNFTsPage() {
  const router = useRouter()
  const { address, isConnected, connect } = useWallet()
  const [userNFTs, setUserNFTs] = useState<any[]>([])
  const [userCollections, setUserCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const { toast } = useToast()

  // Function to load user data with retries
  const loadUserData = async (retryCount = 0) => {
    if (!isConnected || !address) return

    setLoading(true)
    setError(null)
    
    try {
      // Add a little delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const nfts = await fetchUserNFTs(address)
      
      // Add some variety to the NFTs for demonstration
      const enhancedNFTs = nfts.map((nft, index) => ({
        ...nft,
        price: (0.1 + Math.random() * 0.5).toFixed(2),
        isGold: index === 0 || index === 3, // Make some NFTs gold
        status: index % 3 === 0 ? "listed" : "owned",
        collection: index % 2 === 0 ? "Pixel Animals" : "Golden Creatures",
        collectionId: index % 2 === 0 ? "pixel-animals" : "golden-creatures",
      }))
      
      setUserNFTs(enhancedNFTs)
      
      // Extract unique collections from the user's NFTs
      const collections = Array.from(
        new Set(enhancedNFTs.map(nft => nft.collectionId))
      ).map(collectionId => {
        const nft = enhancedNFTs.find(nft => nft.collectionId === collectionId);
        return {
          id: collectionId,
          name: nft?.collection || "",
          count: enhancedNFTs.filter(n => n.collectionId === collectionId).length,
          isGold: nft?.collectionId.includes('golden')
        };
      });
      
      setUserCollections(collections);
    } catch (error: any) {
      console.error("Failed to load NFTs:", error);
      setError(error.message || "Failed to load your NFTs");
      
      // Retry logic - max 3 retries with exponential backoff
      if (retryCount < 3) {
        const retryDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        toast({
          title: "Connection issue",
          description: `Retrying in ${retryDelay/1000} seconds...`,
        });
        
        setTimeout(() => {
          loadUserData(retryCount + 1);
        }, retryDelay);
      } else {
        toast({
          title: "Error",
          description: "Failed to load your NFTs after multiple attempts",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isConnected && address) {
      loadUserData();
    }
  }, [address, isConnected]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    loadUserData();
  };

  // Filter NFTs based on the selected filter
  const filteredNFTs = userNFTs.filter(nft => {
    if (filter === "all") return true
    if (filter === "listed") return nft.status === "listed"
    if (filter === "owned") return nft.status === "owned"
    if (filter === "gold") return nft.isGold
    return true
  })

  // Sort NFTs based on the selected sort option
  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    if (sortBy === "price-low") return parseFloat(a.price) - parseFloat(b.price)
    if (sortBy === "price-high") return parseFloat(b.price) - parseFloat(a.price)
    // For "recent" (default), keep the original order which simulates most recent first
    return 0
  })

  // Function to navigate to a collection
  const navigateToCollection = (collectionId: string) => {
    router.push(`/collection/${collectionId}`)
  }

  // Error display component
  const ErrorDisplay = () => (
    <div className="flex flex-col items-center justify-center h-64 bg-gray-900/90 rounded-none border border-gray-700 pixel-corners">
      <p className="text-red-300 mb-4 font-pixel text-xs">
        {error || "Connection error. Please try again."}
      </p>
      <Button
        onClick={handleRetry}
        className="bg-pixel-blue hover:bg-pixel-blue/80 text-white font-pixel rounded-none pixel-corners pixel-btn"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        <span className="font-pixel text-xs">RETRY</span>
      </Button>
    </div>
  );

  return (
    <div className="relative px-4 md:px-6 lg:px-8 max-w-screen-2xl mx-auto">
      <PixelatedBackground />
      
      <PixelHeading
        text="My NFTs"
        className="text-3xl mb-6 text-white bg-clip-text bg-gradient-to-r from-pixel-green to-pixel-blue"
      />

      {!isConnected ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-900/90 rounded-none border border-gray-700 pixel-corners relative z-10">
          <p className="text-gray-300 mb-4 font-pixel text-sm">Connect your wallet to view your NFTs</p>
          <ConnectWallet />
        </div>
      ) : (
        <div className="relative z-10">
          {/* Show error state if there's an error */}
          {error && !loading && <ErrorDisplay />}

          {/* New Collection Navigation Card */}
          {!error && userCollections.length > 0 && (
            <div className="mb-8">
              <Card className="bg-gray-900/90 border-gray-700 rounded-none pixel-corners shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="font-pixel text-md text-pixel-green">My Collections</CardTitle>
                  <CardDescription className="text-gray-300">Quick access to collections you own NFTs from</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {userCollections.map((collection) => (
                      <Button
                        key={collection.id}
                        onClick={() => navigateToCollection(collection.id)}
                        className={`justify-start ${collection.isGold ? "gold-gradient text-black" : "bg-gray-800 hover:bg-gray-700 text-white"} rounded-none pixel-corners h-auto py-3 border border-gray-700`}
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        <div className="flex flex-col items-start">
                          <span className="font-pixel text-xs">{collection.name}</span>
                          <span className="text-xs opacity-80">{collection.count} NFTs</span>
                        </div>
                      </Button>
                    ))}
                    <Button
                      onClick={() => router.push('/explore')}
                      className="justify-start bg-gray-800/70 hover:bg-gray-700/70 border border-dashed border-gray-600 rounded-none pixel-corners h-auto py-3 text-gray-300"
                    >
                      <Landmark className="h-4 w-4 mr-2" />
                      <span className="font-pixel text-xs">Explore More</span>
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    onClick={() => router.push('/create')}
                    className="w-full bg-pixel-green hover:bg-pixel-green/90 text-black font-pixel rounded-none pixel-corners pixel-btn"
                  >
                    <span className="font-pixel text-xs">CREATE NEW COLLECTION</span>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          {!error && (
            <Tabs defaultValue="owned" className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <TabsList className="bg-gray-900/90 border-gray-700 rounded-none pixel-corners">
                  <TabsTrigger 
                    value="owned" 
                    onClick={() => setFilter("all")}
                    className="data-[state=active]:bg-gray-800 rounded-none font-pixel text-xs text-white"
                  >
                    All NFTs
                  </TabsTrigger>
                  <TabsTrigger 
                    value="listed" 
                    onClick={() => setFilter("listed")}
                    className="data-[state=active]:bg-gray-800 rounded-none font-pixel text-xs text-white"
                  >
                    Listed
                  </TabsTrigger>
                  <TabsTrigger 
                    value="gold" 
                    onClick={() => setFilter("gold")}
                    className="data-[state=active]:bg-gray-800 rounded-none font-pixel text-xs text-white"
                  >
                    Gold NFTs
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="bg-gray-900/90 border-gray-700 rounded-none pixel-corners text-white">
                        <ArrowUpDown className="mr-1 h-3 w-3" />
                        <span className="font-pixel text-[10px]">SORT</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-900 border-gray-700 rounded-none pixel-corners">
                      <DropdownMenuLabel className="font-pixel text-xs text-gray-300">Sort By</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem 
                        className="font-pixel text-[10px] text-white" 
                        onClick={() => setSortBy("recent")}
                      >
                        Most Recent
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="font-pixel text-[10px] text-white" 
                        onClick={() => setSortBy("price-low")}
                      >
                        Price: Low to High
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="font-pixel text-[10px] text-white" 
                        onClick={() => setSortBy("price-high")}
                      >
                        Price: High to Low
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-gray-900/90 border-gray-700 rounded-none pixel-corners text-white"
                    onClick={() => setFilter("all")} // Reset filter
                  >
                    <Filter className="mr-1 h-3 w-3" />
                    <span className="font-pixel text-[10px]">RESET</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-gray-900/90 border-gray-700 rounded-none pixel-corners text-white"
                    onClick={handleRetry}
                    disabled={loading}
                  >
                    <RefreshCw className={`mr-1 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                    <span className="font-pixel text-[10px]">REFRESH</span>
                  </Button>
                </div>
              </div>
              
              <TabsContent value="owned" className="mt-0">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <PixelLoading />
                  </div>
                ) : sortedNFTs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {sortedNFTs.map((nft) => (
                      <NFTCard
                        key={nft.id}
                        id={nft.id}
                        name={nft.name}
                        image={nft.image}
                        price={nft.price}
                        collectionId={nft.collectionId}
                        isGold={nft.isGold}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 bg-gray-900/90 rounded-none border border-gray-700 pixel-corners">
                    <p className="text-gray-300 mb-4 font-pixel text-xs">No NFTs found with the current filter</p>
                    <Button
                      onClick={() => setFilter("all")}
                      className="bg-pixel-green hover:bg-pixel-green/90 text-black font-pixel rounded-none pixel-corners pixel-btn"
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
              ) : sortedNFTs.some(nft => nft.status === "listed") ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {sortedNFTs.filter(nft => nft.status === "listed").map((nft) => (
                    <NFTCard
                      key={nft.id}
                      id={nft.id}
                      name={nft.name}
                      image={nft.image}
                      price={nft.price}
                      collectionId={nft.collectionId}
                      isGold={nft.isGold}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-gray-900/90 rounded-none border border-gray-700 pixel-corners">
                  <p className="text-gray-300 mb-4 font-pixel text-xs">You haven't listed any NFTs for sale</p>
                  <Button
                    asChild
                    className="bg-pixel-green hover:bg-pixel-green/90 text-black font-pixel rounded-none pixel-corners pixel-btn"
                  >
                    <Link href="/explore">
                      <span className="font-pixel text-xs">EXPLORE COLLECTIONS</span>
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="gold" className="mt-0">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <PixelLoading />
                </div>
              ) : sortedNFTs.some(nft => nft.isGold) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {sortedNFTs.filter(nft => nft.isGold).map((nft) => (
                    <NFTCard
                      key={nft.id}
                      id={nft.id}
                      name={nft.name}
                      image={nft.image}
                      price={nft.price}
                      collectionId={nft.collectionId}
                      isGold={nft.isGold}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-gray-900/90 rounded-none border border-gray-700 pixel-corners">
                  <p className="text-gray-300 mb-4 font-pixel text-xs">You don't own any gold rarity NFTs</p>
                  <Button
                    asChild
                    className="gold-gradient hover:opacity-90 text-black font-pixel rounded-none pixel-corners pixel-btn"
                  >
                    <Link href="/explore">
                      <span className="font-pixel text-xs">FIND GOLD NFTs</span>
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            </Tabs>
          )}
        </div>
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
// import { ArrowUpDown, Filter, Landmark, FolderOpen, RefreshCw } from "lucide-react"
// import { 
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { ConnectWallet } from "./connect-wallet"

// export default function MyNFTsPage() {
//   const router = useRouter()
//   const { address, isConnected, connect } = useWallet()
//   const [userNFTs, setUserNFTs] = useState<any[]>([])
//   const [userCollections, setUserCollections] = useState<any[]>([])
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [filter, setFilter] = useState("all")
//   const [sortBy, setSortBy] = useState("recent")
//   const { toast } = useToast()

//   // Function to load user data with retries
//   const loadUserData = async (retryCount = 0) => {
//     if (!isConnected || !address) return

//     setLoading(true)
//     setError(null)
    
//     try {
//       // Add a little delay to simulate API call
//       await new Promise(resolve => setTimeout(resolve, 800))
      
//       const nfts = await fetchUserNFTs(address)
      
//       // Add some variety to the NFTs for demonstration
//       const enhancedNFTs = nfts.map((nft, index) => ({
//         ...nft,
//         price: (0.1 + Math.random() * 0.5).toFixed(2),
//         isGold: index === 0 || index === 3, // Make some NFTs gold
//         status: index % 3 === 0 ? "listed" : "owned",
//         collection: index % 2 === 0 ? "Pixel Animals" : "Golden Creatures",
//         collectionId: index % 2 === 0 ? "pixel-animals" : "golden-creatures",
//       }))
      
//       setUserNFTs(enhancedNFTs)
      
//       // Extract unique collections from the user's NFTs
//       const collections = Array.from(
//         new Set(enhancedNFTs.map(nft => nft.collectionId))
//       ).map(collectionId => {
//         const nft = enhancedNFTs.find(nft => nft.collectionId === collectionId);
//         return {
//           id: collectionId,
//           name: nft?.collection || "",
//           count: enhancedNFTs.filter(n => n.collectionId === collectionId).length,
//           isGold: nft?.collectionId.includes('golden')
//         };
//       });
      
//       setUserCollections(collections);
//     } catch (error: any) {
//       console.error("Failed to load NFTs:", error);
//       setError(error.message || "Failed to load your NFTs");
      
//       // Retry logic - max 3 retries with exponential backoff
//       if (retryCount < 3) {
//         const retryDelay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
//         toast({
//           title: "Connection issue",
//           description: `Retrying in ${retryDelay/1000} seconds...`,
//         });
        
//         setTimeout(() => {
//           loadUserData(retryCount + 1);
//         }, retryDelay);
//       } else {
//         toast({
//           title: "Error",
//           description: "Failed to load your NFTs after multiple attempts",
//           variant: "destructive",
//         });
//       }
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     if (isConnected && address) {
//       loadUserData();
//     }
//   }, [address, isConnected]);

//   const handleConnect = async () => {
//     try {
//       await connect();
//     } catch (error: any) {
//       toast({
//         title: "Connection failed",
//         description: "Failed to connect wallet",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleRetry = () => {
//     loadUserData();
//   };

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

//   // Function to navigate to a collection
//   const navigateToCollection = (collectionId: string) => {
//     router.push(`/collection/${collectionId}`)
//   }

//   // Error display component
//   const ErrorDisplay = () => (
//     <div className="flex flex-col items-center justify-center h-64 bg-gray-900/80 rounded-none border border-gray-800 pixel-corners">
//       <p className="text-gray-400 mb-4 font-pixel text-xs">
//         {error || "Connection error. Please try again."}
//       </p>
//       <Button
//         onClick={handleRetry}
//         className="bg-pixel-blue hover:bg-pixel-blue/80 text-white font-pixel rounded-none pixel-corners pixel-btn"
//       >
//         <RefreshCw className="h-4 w-4 mr-2" />
//         <span className="font-pixel text-xs">RETRY</span>
//       </Button>
//     </div>
//   );

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
//           <ConnectWallet />
//         </div>
//       ) : (
//         <div className="relative z-10">
//           {/* Show error state if there's an error */}
//           {error && !loading && <ErrorDisplay />}

//           {/* New Collection Navigation Card */}
//           {!error && userCollections.length > 0 && (
//             <div className="mb-6">
//               <Card className="bg-gray-900/80 border-gray-800 rounded-none pixel-corners">
//                 <CardHeader className="pb-2">
//                   <CardTitle className="font-pixel text-sm text-pixel-green">My Collections</CardTitle>
//                   <CardDescription>Quick access to collections you own NFTs from</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
//                     {userCollections.map((collection) => (
//                       <Button
//                         key={collection.id}
//                         onClick={() => navigateToCollection(collection.id)}
//                         className={`justify-start ${collection.isGold ? "gold-gradient text-black" : "bg-gray-800 hover:bg-gray-700"} rounded-none pixel-corners h-auto py-3`}
//                       >
//                         <FolderOpen className="h-4 w-4 mr-2" />
//                         <div className="flex flex-col items-start">
//                           <span className="font-pixel text-xs">{collection.name}</span>
//                           <span className="text-xs opacity-80">{collection.count} NFTs</span>
//                         </div>
//                       </Button>
//                     ))}
//                     <Button
//                       onClick={() => router.push('/explore')}
//                       className="justify-start bg-gray-800/50 hover:bg-gray-700/50 border border-dashed border-gray-700 rounded-none pixel-corners h-auto py-3"
//                     >
//                       <Landmark className="h-4 w-4 mr-2" />
//                       <span className="font-pixel text-xs">Explore More</span>
//                     </Button>
//                   </div>
//                 </CardContent>
//                 <CardFooter className="pt-0">
//                   <Button
//                     onClick={() => router.push('/create')}
//                     className="w-full bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
//                   >
//                     <span className="font-pixel text-xs">CREATE NEW COLLECTION</span>
//                   </Button>
//                 </CardFooter>
//               </Card>
//             </div>
//           )}

//           {!error && (
//             <Tabs defaultValue="owned" className="w-full">
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//                 <TabsList className="bg-gray-900/80 border-gray-800 rounded-none pixel-corners">
//                   <TabsTrigger 
//                     value="owned" 
//                     onClick={() => setFilter("all")}
//                     className="data-[state=active]:bg-gray-800 rounded-none font-pixel text-xs"
//                   >
//                     All NFTs
//                   </TabsTrigger>
//                   <TabsTrigger 
//                     value="listed" 
//                     onClick={() => setFilter("listed")}
//                     className="data-[state=active]:bg-gray-800 rounded-none font-pixel text-xs"
//                   >
//                     Listed
//                   </TabsTrigger>
//                   <TabsTrigger 
//                     value="gold" 
//                     onClick={() => setFilter("gold")}
//                     className="data-[state=active]:bg-gray-800 rounded-none font-pixel text-xs"
//                   >
//                     Gold NFTs
//                   </TabsTrigger>
//                 </TabsList>
                
//                 <div className="flex items-center gap-2">
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button variant="outline" size="sm" className="bg-gray-900/80 border-gray-800 rounded-none pixel-corners">
//                         <ArrowUpDown className="mr-1 h-3 w-3" />
//                         <span className="font-pixel text-[10px]">SORT</span>
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent className="bg-gray-900 border-gray-800 rounded-none pixel-corners">
//                       <DropdownMenuLabel className="font-pixel text-xs">Sort By</DropdownMenuLabel>
//                       <DropdownMenuSeparator className="bg-gray-800" />
//                       <DropdownMenuItem 
//                         className="font-pixel text-[10px]" 
//                         onClick={() => setSortBy("recent")}
//                       >
//                         Most Recent
//                       </DropdownMenuItem>
//                       <DropdownMenuItem 
//                         className="font-pixel text-[10px]" 
//                         onClick={() => setSortBy("price-low")}
//                       >
//                         Price: Low to High
//                       </DropdownMenuItem>
//                       <DropdownMenuItem 
//                         className="font-pixel text-[10px]" 
//                         onClick={() => setSortBy("price-high")}
//                       >
//                         Price: High to Low
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
                  
//                   <Button 
//                     variant="outline" 
//                     size="sm" 
//                     className="bg-gray-900/80 border-gray-800 rounded-none pixel-corners"
//                     onClick={() => setFilter("all")} // Reset filter
//                   >
//                     <Filter className="mr-1 h-3 w-3" />
//                     <span className="font-pixel text-[10px]">RESET</span>
//                   </Button>
                  
//                   <Button 
//                     variant="outline" 
//                     size="sm" 
//                     className="bg-gray-900/80 border-gray-800 rounded-none pixel-corners"
//                     onClick={handleRetry}
//                     disabled={loading}
//                   >
//                     <RefreshCw className={`mr-1 h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
//                     <span className="font-pixel text-[10px]">REFRESH</span>
//                   </Button>
//                 </div>
//               </div>
              
//               <TabsContent value="owned" className="mt-0">
//                 {loading ? (
//                   <div className="flex items-center justify-center h-64">
//                     <PixelLoading />
//                   </div>
//                 ) : sortedNFTs.length > 0 ? (
//                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                     {sortedNFTs.map((nft) => (
//                       <NFTCard
//                         key={nft.id}
//                         id={nft.id}
//                         name={nft.name}
//                         image={nft.image}
//                         price={nft.price}
//                         collectionId={nft.collectionId}
//                         isGold={nft.isGold}
//                       />
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="flex flex-col items-center justify-center h-64 bg-gray-900/80 rounded-none border border-gray-800 pixel-corners">
//                     <p className="text-gray-400 mb-4 font-pixel text-xs">No NFTs found with the current filter</p>
//                     <Button
//                       onClick={() => setFilter("all")}
//                       className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
//                     >
//                       <span className="font-pixel text-xs">VIEW ALL NFTs</span>
//                     </Button>
//                   </div>
//                 )}
//               </TabsContent>
//               <TabsContent value="listed" className="mt-0">
//              {loading ? (
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
//             </Tabs>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }



