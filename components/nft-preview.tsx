"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { PixelIcon } from "@/components/pixel-icon"
import { Rarity } from "@/lib/contracts/nft-contract"
import { getRarityClassNames } from "@/lib/nft/rarity-analyzer"

interface NFTPreviewProps {
  imageUrl: string
  isSelected: boolean
  onClick: () => void
  rarity: Rarity
  rarityLabel: string
}

export function NFTPreview({ imageUrl, isSelected, onClick, rarity, rarityLabel }: NFTPreviewProps) {
  const { badge, border } = getRarityClassNames(rarity)
  
  return (
    <div
      className={cn(
        "relative rounded-none overflow-hidden cursor-pointer transition-all border-2 pixel-corners",
        isSelected
          ? "border-pixel-green shadow-lg shadow-pixel-green/20"
          : border,
        rarity === Rarity.S_TIER && !isSelected && "gold-gradient p-[2px]"
      )}
      onClick={onClick}
    >
      <div className="aspect-square relative bg-gray-900">
        <Image
          src={imageUrl || "/placeholder.svg?height=300&width=300"}
          alt="NFT Preview"
          fill
          className="object-cover pixelated"
        />
        
        {/* Rarity badge */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 text-center text-xs py-1", 
          badge
        )}>
          {rarityLabel}
        </div>
      </div>

      {isSelected && (
        <div className="absolute top-2 right-2 bg-pixel-green rounded-none pixel-corners p-1">
          <PixelIcon icon={Check} className="h-4 w-4 text-black" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end">
        <div className="p-2 w-full">
          <p className="text-xs text-white font-pixel truncate">
            {isSelected ? "Selected for minting" : "Click to select"}
          </p>
        </div>
      </div>
    </div>
  )
}

// "use client"

// import Image from "next/image"
// import { cn } from "@/lib/utils"
// import { Check } from "lucide-react"
// import { PixelIcon } from "@/components/pixel-icon"

// interface NFTPreviewProps {
//   imageUrl: string
//   isSelected: boolean
//   onClick: () => void
//   isGold?: boolean
// }

// export function NFTPreview({ imageUrl, isSelected, onClick, isGold = false }: NFTPreviewProps) {
//   return (
//     <div
//       className={cn(
//         "relative rounded-none overflow-hidden cursor-pointer transition-all border-2 pixel-corners",
//         isSelected
//           ? "border-pixel-green shadow-lg shadow-pixel-green/20"
//           : isGold
//             ? "border-gold-400"
//             : "border-gray-800",
//         isGold && "gold-gradient",
//       )}
//       onClick={onClick}
//     >
//       <div className={`aspect-square relative ${isGold ? "bg-black/50" : ""}`}>
//         <Image
//           src={imageUrl || "/placeholder.svg?height=300&width=300"}
//           alt="NFT Preview"
//           fill
//           className="object-cover pixelated"
//         />
//       </div>

//       {isSelected && (
//         <div className="absolute top-2 right-2 bg-pixel-green rounded-none pixel-corners p-1">
//           <PixelIcon icon={Check} className="h-4 w-4 text-black" />
//         </div>
//       )}

//       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end">
//         <div className="p-2 w-full">
//           <p className="text-xs text-white font-pixel truncate">
//             {isSelected ? "Selected for minting" : "Click to select"}
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }
