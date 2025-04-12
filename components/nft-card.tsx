"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface NFTCardProps {
  id: string | number
  name: string
  image: string
  price: string
  collectionId: string
  isGold?: boolean
}

export function NFTCard({ id, name, image, price, collectionId, isGold = false }: NFTCardProps) {
  const { toast } = useToast()

  const handleBuy = () => {
    toast({
      title: "Purchase initiated",
      description: "Connecting to your wallet...",
    })

    // This would connect to your smart contract
    setTimeout(() => {
      toast({
        title: "Success!",
        description: `You've purchased ${name}`,
      })
    }, 2000)
  }

  return (
    <div
      className={cn(
        "bg-gray-900/80 border border-gray-800 rounded-none overflow-hidden hover:border-pixel-green transition-colors pixel-corners relative",
        isGold && "gold-gradient",
      )}
    >
      <div className={`relative aspect-square ${isGold ? "bg-black/50" : ""}`}>
        <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover pixelated" />
      </div>

      <div className="p-3">
        <h3 className="font-pixel text-xs text-white mb-1">{name}</h3>

        <div className="flex justify-between items-center mt-2">
          <div className={isGold ? "text-gold-400 font-pixel text-xs" : "text-pixel-green font-pixel text-xs"}>
            {price} FIL
          </div>
          <Button
            size="sm"
            onClick={handleBuy}
            className="bg-pixel-green hover:bg-pixel-green/80 text-black text-xs font-pixel rounded-none pixel-corners pixel-btn"
          >
            BUY NOW
          </Button>
        </div>
      </div>
    </div>
  )
}
