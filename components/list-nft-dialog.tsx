"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Rarity } from "@/lib/contracts/nft-contract"
import { getRarityLabel, getRarityClassNames } from "@/lib/nft/rarity-analyzer"
import { listNFTForSale } from "@/lib/marketplace-service"
import { useAccount } from "wagmi"
import { Loader } from "lucide-react"
import { useRouter } from "next/navigation"

interface ListNFTDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nft: {
    id: string | number
    name: string
    image: string
    rarity: Rarity
    metadataUrl: string
    isBundle?: boolean
    tokenIds?: string[]
  }
}

export function ListNFTDialog({ open, onOpenChange, nft }: ListNFTDialogProps) {
  const [price, setPrice] = useState("")
  const [isListing, setIsListing] = useState(false)
  const { toast } = useToast()
  const { address } = useAccount()
  const router = useRouter()
  
  const rarityInfo = getRarityClassNames(nft.rarity)
  const rarityLabel = getRarityLabel(nft.rarity)
  
  const handleListNFT = async () => {
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid price greater than 0",
        variant: "destructive",
      })
      return
    }
    
    if (!address) {
      toast({
        title: "Error",
        description: "Wallet not connected",
        variant: "destructive",
      })
      return
    }
    
    setIsListing(true)
    
    try {
      // Handle both single NFTs and bundles
      const tokenId = nft.isBundle && nft.tokenIds ? nft.tokenIds : nft.id.toString()
      
      const result = await listNFTForSale(
        tokenId,
        price,
        nft.isBundle || false,
        nft.metadataUrl,
        address
      )
      
      toast({
        title: "Success!",
        description: "Your NFT has been listed for sale",
      })
      
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error("Listing error:", error)
      toast({
        title: "Listing failed",
        description: "There was an error listing your NFT",
        variant: "destructive",
      })
    } finally {
      setIsListing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900/90 border-gray-800 rounded-none pixel-corners">
        <DialogHeader>
          <DialogTitle className="font-pixel text-pixel-green">
            List NFT for Sale
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex gap-4 items-center">
            <div className={`w-20 h-20 relative rounded-none pixel-corners overflow-hidden border-2 ${rarityInfo.border}`}>
              <Image src={nft.image} alt={nft.name} fill className="object-cover pixelated" />
            </div>
            <div>
              <h3 className="font-medium">{nft.name}</h3>
              <div className={`text-xs px-2 py-0.5 rounded-sm inline-block mt-1 ${rarityInfo.badge}`}>
                {rarityLabel}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium font-pixel text-xs">Listing Price (tFIL)</label>
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              type="number"
              step="0.01"
              min="0.01"
              className="bg-gray-800/80 border-gray-700 rounded-none pixel-corners"
            />
          </div>
          
          <div className="bg-gray-800/50 p-4 rounded-none pixel-corners">
            <p className="text-sm text-gray-400">
              When your NFT sells, you'll receive the full amount minus a 2.5% marketplace fee.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-none pixel-corners"
            disabled={isListing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleListNFT}
            className="bg-pixel-blue hover:bg-pixel-blue/80 text-white font-pixel rounded-none pixel-corners pixel-btn"
            disabled={isListing}
          >
            {isListing ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span className="font-pixel text-xs">LIST FOR SALE</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}