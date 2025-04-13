"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { useWallet } from "@/components/wallet-provider"
import { ConnectWallet } from "@/components/connect-wallet"
import { Loader2 } from "lucide-react"
import { useState } from "react"

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
  const { isConnected } = useWallet()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleBuy = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to purchase this NFT",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    toast({
      title: "Purchase initiated",
      description: "Preparing transaction on Filecoin Calibration network...",
    })

    // This would connect to your smart contract on Filecoin Calibration network
    try {
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Success!",
        description: `You've purchased ${name} for ${price} tFIL`,
      })
    } catch (error) {
      toast({
        title: "Transaction failed",
        description: "Failed to complete the purchase. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Format price to show tFIL instead of FIL
  const formattedPrice = price.replace("FIL", "tFIL")

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
            {formattedPrice}
          </div>
          
          {/* Using the consistent wallet connection approach */}
          {!isConnected ? (
            <div className="scale-75 origin-right">
              <ConnectWallet />
            </div>
          ) : (
            <Button
              size="sm"
              onClick={handleBuy}
              disabled={isProcessing}
              className="bg-pixel-green hover:bg-pixel-green/80 text-black text-xs font-pixel rounded-none pixel-corners pixel-btn"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  <span>BUYING</span>
                </>
              ) : (
                "BUY NOW"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}


// "use client"

// import Image from "next/image"
// import { Button } from "@/components/ui/button"
// import { useToast } from "@/components/ui/use-toast"
// import { cn } from "@/lib/utils"
// import { useWallet } from "@/components/wallet-provider"
// import { Loader2 } from "lucide-react"
// import { useState } from "react"

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
//   const { isConnected } = useWallet()
//   const [isProcessing, setIsProcessing] = useState(false)

//   const handleBuy = async () => {
//     if (!isConnected) {
//       toast({
//         title: "Wallet not connected",
//         description: "Please connect your wallet to purchase this NFT",
//         variant: "destructive",
//       })
//       return
//     }

//     setIsProcessing(true)
//     toast({
//       title: "Purchase initiated",
//       description: "Preparing transaction on Filecoin Calibration network...",
//     })

//     // This would connect to your smart contract on Filecoin Calibration network
//     try {
//       // Simulate transaction processing
//       await new Promise(resolve => setTimeout(resolve, 2000))
      
//       toast({
//         title: "Success!",
//         description: `You've purchased ${name} for ${price} tFIL`,
//       })
//     } catch (error) {
//       toast({
//         title: "Transaction failed",
//         description: "Failed to complete the purchase. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsProcessing(false)
//     }
//   }

//   // Format price to show tFIL instead of FIL
//   const formattedPrice = price.replace("FIL", "tFIL")

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
//             {formattedPrice}
//           </div>
//           <Button
//             size="sm"
//             onClick={handleBuy}
//             disabled={isProcessing}
//             className="bg-pixel-green hover:bg-pixel-green/80 text-black text-xs font-pixel rounded-none pixel-corners pixel-btn"
//           >
//             {isProcessing ? (
//               <>
//                 <Loader2 className="h-3 w-3 mr-1 animate-spin" />
//                 <span>BUYING</span>
//               </>
//             ) : (
//               "BUY NOW"
//             )}
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }

// // "use client"

// // import Image from "next/image"
// // import { Button } from "@/components/ui/button"
// // import { useToast } from "@/components/ui/use-toast"
// // import { cn } from "@/lib/utils"

// // interface NFTCardProps {
// //   id: string | number
// //   name: string
// //   image: string
// //   price: string
// //   collectionId: string
// //   isGold?: boolean
// // }

// // export function NFTCard({ id, name, image, price, collectionId, isGold = false }: NFTCardProps) {
// //   const { toast } = useToast()

// //   const handleBuy = () => {
// //     toast({
// //       title: "Purchase initiated",
// //       description: "Connecting to your wallet...",
// //     })

// //     // This would connect to your smart contract
// //     setTimeout(() => {
// //       toast({
// //         title: "Success!",
// //         description: `You've purchased ${name}`,
// //       })
// //     }, 2000)
// //   }

// //   return (
// //     <div
// //       className={cn(
// //         "bg-gray-900/80 border border-gray-800 rounded-none overflow-hidden hover:border-pixel-green transition-colors pixel-corners relative",
// //         isGold && "gold-gradient",
// //       )}
// //     >
// //       <div className={`relative aspect-square ${isGold ? "bg-black/50" : ""}`}>
// //         <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover pixelated" />
// //       </div>

// //       <div className="p-3">
// //         <h3 className="font-pixel text-xs text-white mb-1">{name}</h3>

// //         <div className="flex justify-between items-center mt-2">
// //           <div className={isGold ? "text-gold-400 font-pixel text-xs" : "text-pixel-green font-pixel text-xs"}>
// //             {price} FIL
// //           </div>
// //           <Button
// //             size="sm"
// //             onClick={handleBuy}
// //             className="bg-pixel-green hover:bg-pixel-green/80 text-black text-xs font-pixel rounded-none pixel-corners pixel-btn"
// //           >
// //             BUY NOW
// //           </Button>
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }
