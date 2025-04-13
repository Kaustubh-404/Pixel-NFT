"use client"

import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { Rarity } from "@/lib/contracts/nft-contract"
import { getRarityLabel, getRarityClassNames } from "@/lib/nft/rarity-analyzer"
import { buyNFT } from "@/lib/marketplace-service"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader } from "lucide-react"

interface NFTCardProps {
  id: string | number
  name: string
  image: string
  price: string
  collectionId: string
  rarity: Rarity
  isListed?: boolean
  isOwned?: boolean
  listingId?: string
}

export function NFTCard({ 
  id, 
  name, 
  image, 
  price, 
  collectionId, 
  rarity,
  isListed = true,
  isOwned = false,
  listingId
}: NFTCardProps) {
  const { toast } = useToast()
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [showBuyDialog, setShowBuyDialog] = useState(false)
  const [showListDialog, setShowListDialog] = useState(false)
  
  const rarityInfo = getRarityClassNames(rarity)
  const rarityLabel = getRarityLabel(rarity)

  const handleCardClick = () => {
    router.push(`/nft/${collectionId}/${id}`)
  }

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to purchase NFTs",
        variant: "destructive",
      })
      return
    }
    
    setShowBuyDialog(true)
  }
  
  const handleListClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowListDialog(true)
  }

  const confirmPurchase = async () => {
    if (!isConnected || !address || !listingId) {
      toast({
        title: "Error",
        description: "Wallet not connected or listing information missing",
        variant: "destructive",
      })
      return
    }
    
    setIsPurchasing(true)
    
    try {
      const result = await buyNFT(listingId, address)
      
      toast({
        title: "Success!",
        description: `You've purchased ${name}`,
      })
      
      // Close dialog and refresh data
      setShowBuyDialog(false)
      router.refresh()
    } catch (error) {
      console.error("Purchase error:", error)
      toast({
        title: "Purchase failed",
        description: "There was an error processing your purchase",
        variant: "destructive",
      })
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <>
      <div
        className={cn(
          "bg-gray-900/80 border-2 rounded-none overflow-hidden hover:border-pixel-green transition-colors pixel-corners relative cursor-pointer",
          rarityInfo.border
        )}
        onClick={handleCardClick}
      >
        <div className="relative aspect-square">
          <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover pixelated" />
          <div className={cn(
            "absolute bottom-0 left-0 right-0 text-center text-xs py-1", 
            rarityInfo.badge
          )}>
            {rarityLabel}
          </div>
        </div>

        <div className="p-3">
          <h3 className="font-pixel text-xs text-white mb-1 truncate">{name}</h3>

          <div className="flex justify-between items-center mt-2">
            {isListed ? (
              <>
                <div className="text-pixel-green font-pixel text-xs">
                  {price} tFIL
                </div>
                <Button
                  size="sm"
                  onClick={handleBuyClick}
                  className="bg-pixel-green hover:bg-pixel-green/80 text-black text-xs font-pixel rounded-none pixel-corners pixel-btn"
                >
                  BUY NOW
                </Button>
              </>
            ) : isOwned ? (
              <>
                <div className="text-gray-400 font-pixel text-xs">
                  Owned by you
                </div>
                <Button
                  size="sm"
                  onClick={handleListClick}
                  className="bg-pixel-blue hover:bg-pixel-blue/80 text-white text-xs font-pixel rounded-none pixel-corners pixel-btn"
                >
                  LIST
                </Button>
              </>
            ) : (
              <div className="text-gray-400 font-pixel text-xs">
                Not for sale
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Purchase confirmation dialog */}
      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent className="bg-gray-900/90 border-gray-800 rounded-none pixel-corners">
          <DialogHeader>
            <DialogTitle className="font-pixel text-pixel-green">
              Confirm Purchase
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="flex gap-4 items-center">
              <div className={`w-20 h-20 relative rounded-none pixel-corners overflow-hidden border-2 ${rarityInfo.border}`}>
                <Image src={image} alt={name} fill className="object-cover pixelated" />
              </div>
              <div>
                <h3 className="font-medium">{name}</h3>
                <div className={`text-xs px-2 py-0.5 rounded-sm inline-block mt-1 ${rarityInfo.badge}`}>
                  {rarityLabel}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-4 rounded-none pixel-corners">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Price:</span>
                <span className="text-xl font-pixel text-pixel-green">{price} tFIL</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-400">
              This transaction will require a small network fee in addition to the purchase price.
            </p>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBuyDialog(false)}
              className="rounded-none pixel-corners"
              disabled={isPurchasing}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmPurchase}
              className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
              disabled={isPurchasing}
            >
              {isPurchasing ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span className="font-pixel text-xs">CONFIRM PURCHASE</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// "use client"

// import Image from "next/image"
// import { Button } from "@/components/ui/button"
// import { useToast } from "@/components/ui/use-toast"
// import { cn } from "@/lib/utils"

// interface NFTCardProps {
//   id: string | number
//   name: string
//   image: string
//   price: string
//   collectionId: string
//   isGold?: boolean
// }

// export function NFTCard({ id, name, image, price, collectionId, isGold = false }: NFTCardProps) {
//   const { toast } = useToast()

//   const handleBuy = () => {
//     toast({
//       title: "Purchase initiated",
//       description: "Connecting to your wallet...",
//     })

//     // This would connect to your smart contract
//     setTimeout(() => {
//       toast({
//         title: "Success!",
//         description: `You've purchased ${name}`,
//       })
//     }, 2000)
//   }

//   return (
//     <div
//       className={cn(
//         "bg-gray-900/80 border border-gray-800 rounded-none overflow-hidden hover:border-pixel-green transition-colors pixel-corners relative",
//         isGold && "gold-gradient",
//       )}
//     >
//       <div className={`relative aspect-square ${isGold ? "bg-black/50" : ""}`}>
//         <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover pixelated" />
//       </div>

//       <div className="p-3">
//         <h3 className="font-pixel text-xs text-white mb-1">{name}</h3>

//         <div className="flex justify-between items-center mt-2">
//           <div className={isGold ? "text-gold-400 font-pixel text-xs" : "text-pixel-green font-pixel text-xs"}>
//             {price} FIL
//           </div>
//           <Button
//             size="sm"
//             onClick={handleBuy}
//             className="bg-pixel-green hover:bg-pixel-green/80 text-black text-xs font-pixel rounded-none pixel-corners pixel-btn"
//           >
//             BUY NOW
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }
