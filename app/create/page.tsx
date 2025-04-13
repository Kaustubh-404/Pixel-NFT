"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { NFTPreview } from "@/components/nft-preview"
import { generatePrompts, generateImages } from "@/lib/lilypad"
import { uploadToIPFS, mintNFT } from "@/lib/nft-service"
import { useToast } from "@/components/ui/use-toast"
import { RefreshCw, Check, Plus, Minus, Info } from "lucide-react"
import { PixelHeading } from "@/components/pixel-heading"
import { PixelIcon } from "@/components/pixel-icon"
import { PixelatedBackground } from "@/components/pixelated-background"
import { useAccount } from "wagmi"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { Rarity, RARITY_INFO } from "@/lib/contracts/nft-contract"
import { getRarityLabel, getRarityClassNames } from "@/lib/nft/rarity-analyzer"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"
import { motion } from "framer-motion"

// Define interfaces for generated image result
interface GeneratedImagesResult {
  images: string[];
  rarities: Rarity[];
}

// Define interfaces for NFT upload result
interface NFTUploadResult {
  metadataUrl: string;
  imageCid: string;
}

// Define interfaces for mint NFT result
interface MintNFTResult {
  tokenId: string | string[];
}

export default function CreatePage() {
  const [theme, setTheme] = useState<string>("")
  const [prompts, setPrompts] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const [rarities, setRarities] = useState<Rarity[]>([])
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState<boolean>(false)
  const [isGeneratingImages, setIsGeneratingImages] = useState<boolean>(false)
  const [isMinting, setIsMinting] = useState<boolean>(false)
  const [showMintDialog, setShowMintDialog] = useState<boolean>(false)
  const [collectionName, setCollectionName] = useState<string>("")
  const [collectionDescription, setCollectionDescription] = useState<string>("")
  const [mintSuccess, setMintSuccess] = useState<boolean>(false)
  const [tokenIds, setTokenIds] = useState<string[]>([])
  const [nftCount, setNftCount] = useState<number>(1)
  const [totalPrice, setTotalPrice] = useState<string>("0.01")
  
  const { toast } = useToast()
  const { address, isConnected } = useAccount()

  // Calculate the total price based on selected NFTs and their rarities
  useEffect(() => {
    if (selectedIndices.length === 0) {
      setTotalPrice("0.00")
      return
    }

    let price = 0
    selectedIndices.forEach(index => {
      if (rarities[index] !== undefined) {
        const rarity = rarities[index]
        price += RARITY_INFO[rarity].priceMultiplier * 0.01
      } else {
        price += 0.01 // Default price
      }
    })

    setTotalPrice(price.toFixed(2))
  }, [selectedIndices, rarities])

  const handleGeneratePrompts = async () => {
    if (!theme.trim()) {
      toast({
        title: "Error",
        description: "Please enter a theme for your NFT collection",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingPrompts(true)
    try {
      const generatedPrompts = await generatePrompts(theme, nftCount)
      setPrompts(generatedPrompts)
      toast({
        title: "Success",
        description: "Prompts generated successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate prompts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingPrompts(false)
    }
  }

  const handleGenerateImages = async () => {
    if (prompts.length === 0) {
      toast({
        title: "Error",
        description: "Please generate prompts first",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingImages(true)
    try {
      const result: GeneratedImagesResult = await generateImages(prompts)
      setImages(result.images)
      setRarities(result.rarities)
      toast({
        title: "Success",
        description: "Images generated successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingImages(false)
    }
  }

  const toggleImageSelection = (index: number) => {
    setSelectedIndices(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index)
      } else {
        return [...prev, index]
      }
    })
  }

  const handleMintCollection = async () => {
    if (!isConnected) {
      toast({
        title: "Connection required",
        description: "Please connect your wallet to mint NFTs",
        variant: "destructive",
      })
      return
    }
    
    if (selectedIndices.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one image to mint",
        variant: "destructive",
      })
      return
    }
    
    setShowMintDialog(true)
  }
  
  const handleConfirmMint = async () => {
    if (!collectionName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your collection",
        variant: "destructive",
      })
      return
    }
    
    setIsMinting(true)
    
    try {
      // Step 1: Upload selected images to IPFS
      const uploadPromises = selectedIndices.map(index => 
        uploadToIPFS(images[index], {
          name: `${collectionName} #${index + 1}`,
          description: collectionDescription,
          rarity: rarities[index]
        })
      )
      
      const uploadResults: NFTUploadResult[] = await Promise.all(uploadPromises)
      
      // Step 2: Mint the NFTs with the metadata URLs
      const mintResult: MintNFTResult = await mintNFT({
        metadataUrls: uploadResults.map(r => r.metadataUrl),
        rarities: selectedIndices.map(index => rarities[index]),
        bundleName: collectionName,
        bundleDescription: collectionDescription,
        bundlePreviewImageCid: uploadResults[0].imageCid, // Use first image as preview
        walletAddress: address
      })
      
      // Step 3: Show success state
      setTokenIds(Array.isArray(mintResult.tokenId) ? mintResult.tokenId : [mintResult.tokenId])
      setMintSuccess(true)
      
      toast({
        title: "Success!",
        description: "Your NFT collection has been minted successfully!",
      })
    } catch (error) {
      console.error("Minting error:", error)
      toast({
        title: "Error",
        description: "Failed to mint your NFT collection. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsMinting(false)
    }
  }
  
  const resetForm = () => {
    setTheme("")
    setPrompts([])
    setImages([])
    setRarities([])
    setSelectedIndices([])
    setCollectionName("")
    setCollectionDescription("")
    setMintSuccess(false)
    setTokenIds([])
    setShowMintDialog(false)
    setNftCount(1)
  }

  const incrementNftCount = () => {
    setNftCount(prev => Math.min(prev + 1, 8))
  }

  const decrementNftCount = () => {
    setNftCount(prev => Math.max(prev - 1, 1))
  }

  return (
    <div className="relative">
      <PixelatedBackground />

      <PixelHeading
        text="Create Pixel NFT Collection"
        className="text-2xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pixel-green to-pixel-blue"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium font-pixel text-xs">Collection Theme</label>
            <div className="flex gap-0">
              <Input
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g., Pixel Animals, Space Adventure"
                className="bg-gray-900/80 border-gray-800 rounded-none rounded-l-sm border-r-0 pixel-corners"
              />
              <Button
                onClick={handleGeneratePrompts}
                disabled={isGeneratingPrompts}
                className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none rounded-r-sm pixel-btn"
              >
                {isGeneratingPrompts ? <div className="pixel-loader mr-2 h-4 w-4"></div> : "GENERATE"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium font-pixel text-xs">Number of NFTs</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementNftCount}
                  disabled={nftCount <= 1}
                  className="h-8 w-8 rounded-none pixel-corners"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-pixel text-xs">{nftCount}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementNftCount}
                  disabled={nftCount >= 8}
                  className="h-8 w-8 rounded-none pixel-corners"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="bg-gray-900/80 p-3 border border-gray-800 rounded-none pixel-corners">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-pixel text-[10px]">B-Tier (Common)</span>
                <span className="text-sm font-pixel text-[10px]">S-Tier (Legendary)</span>
              </div>
              <Slider 
                defaultValue={[60]} 
                max={100} 
                step={1}
                disabled
              />
              <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
                <span>Frequency: High</span>
                <span>Frequency: Low</span>
              </div>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-xs text-gray-400 cursor-help">
                    <Info className="h-3 w-3" />
                    <span>About NFT rarity tiers</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="w-80 p-3">
                  <p className="font-medium mb-2">Rarity Tiers:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="bg-pixel-blue/20 text-pixel-blue px-2 py-0.5 rounded-sm text-xs">B-Tier</span>
                      <span className="text-sm">Common pixel art (Base price: 0.01 tFIL)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="bg-pixel-purple/20 text-pixel-purple px-2 py-0.5 rounded-sm text-xs">A-Tier</span>
                      <span className="text-sm">Rare pixel art (Price: 0.02 tFIL)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="bg-pixel-green/20 text-pixel-green px-2 py-0.5 rounded-sm text-xs">S-Tier</span>
                      <span className="text-sm">Legendary pixel art (Price: 0.05 tFIL)</span>
                    </li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {prompts.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium font-pixel text-xs">Generated Prompts</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePrompts}
                  disabled={isGeneratingPrompts}
                  className="h-7 rounded-none pixel-corners"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  <span className="text-xs">Regenerate</span>
                </Button>
              </div>
              <div className="bg-gray-900/80 p-3 border border-gray-800 rounded-none pixel-corners max-h-40 overflow-y-auto">
                <ul className="space-y-2 text-xs">
                  {prompts.map((prompt, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="bg-gray-800 px-1.5 py-0.5 rounded-sm">#{index + 1}</span>
                      <span>{prompt}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button
                onClick={handleGenerateImages}
                disabled={isGeneratingImages}
                className="w-full bg-pixel-purple hover:bg-pixel-purple/80 text-white font-pixel rounded-none pixel-corners pixel-btn mt-2"
              >
                {isGeneratingImages ? (
                  <>
                    <div className="pixel-loader mr-2 h-4 w-4"></div>
                    <span>GENERATING IMAGES...</span>
                  </>
                ) : (
                  <span>GENERATE PIXEL ART</span>
                )}
              </Button>
            </div>
          )}
          
          {!isConnected && (
            <div className="flex justify-center mt-4">
              <ConnectWalletButton />
            </div>
          )}
        </motion.div>
        
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {images.length > 0 ? (
            <>
              <div className="flex justify-between items-center">
                <h3 className="font-medium font-pixel text-xs">Generated Pixel Art</h3>
                <div className="text-xs">
                  <span className="text-pixel-green font-medium">{selectedIndices.length}</span>
                  <span className="text-gray-400"> selected</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <NFTPreview
                    key={index}
                    image={image}
                    rarity={rarities[index]}
                    name={`#${index + 1}`}
                    isSelected={selectedIndices.includes(index)}
                    onClick={() => toggleImageSelection(index)}
                  />
                ))}
              </div>
              
              {selectedIndices.length > 0 && (
                <div className="flex justify-between mt-4">
                  <div>
                    <p className="text-xs text-gray-400">Total Price:</p>
                    <p className="font-medium text-lg">{totalPrice} tFIL</p>
                  </div>
                  <Button
                    onClick={handleMintCollection}
                    className="bg-pixel-blue hover:bg-pixel-blue/80 text-white font-pixel rounded-none pixel-corners pixel-btn"
                    disabled={!isConnected}
                  >
                    <span>MINT COLLECTION</span>
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-gray-900/50 border border-gray-800 rounded-none pixel-corners p-8">
              <PixelIcon name="image" className="text-gray-600 mb-4 h-12 w-12" />
              <p className="text-gray-400 text-center mb-2">Your pixel art will appear here</p>
              <p className="text-xs text-gray-500 text-center">
                Enter a theme, generate prompts, and create pixel art
              </p>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Mint Collection Dialog */}
      <Dialog open={showMintDialog} onOpenChange={setShowMintDialog}>
        <DialogContent className="bg-gray-900/90 border-gray-800 rounded-none pixel-corners">
          <DialogHeader>
            <DialogTitle className="font-pixel text-pixel-green">
              {mintSuccess ? "Collection Minted!" : "Mint NFT Collection"}
            </DialogTitle>
            {!mintSuccess && (
              <DialogDescription>
                Enter details for your pixel art collection
              </DialogDescription>
            )}
          </DialogHeader>
          
          {!mintSuccess ? (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium font-pixel text-xs">Collection Name</label>
                <Input
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  placeholder="e.g., Pixel Adventurers"
                  className="bg-gray-800/80 border-gray-700 rounded-none pixel-corners"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium font-pixel text-xs">Description (Optional)</label>
                <Textarea
                  value={collectionDescription}
                  onChange={(e) => setCollectionDescription(e.target.value)}
                  placeholder="Describe your collection..."
                  className="bg-gray-800/80 border-gray-700 rounded-none pixel-corners h-20"
                />
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-none pixel-corners">
                <div className="flex justify-between">
                  <p className="text-sm">Selected Items:</p>
                  <p className="text-sm font-medium">{selectedIndices.length}</p>
                </div>
                <div className="flex justify-between mt-1">
                  <p className="text-sm">Total Price:</p>
                  <p className="text-sm font-medium">{totalPrice} tFIL</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 space-y-6">
              <div className="flex items-center justify-center">
                <div className="bg-pixel-green/20 text-pixel-green p-3 rounded-full">
                  <Check className="h-8 w-8" />
                </div>
              </div>
              
              <div className="text-center space-y-1">
                <h3 className="font-medium">{collectionName}</h3>
                <p className="text-sm text-gray-400">
                  {selectedIndices.length} NFTs successfully minted to your wallet
                </p>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-none pixel-corners">
                <p className="text-sm text-gray-400 mb-2">Token IDs:</p>
                <div className="flex flex-wrap gap-2">
                  {tokenIds.map((id, index) => (
                    <div key={index} className="bg-gray-800 px-2 py-1 rounded-sm text-xs">
                      #{id}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            {!mintSuccess ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowMintDialog(false)}
                  className="rounded-none pixel-corners"
                  disabled={isMinting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmMint}
                  className="bg-pixel-blue hover:bg-pixel-blue/80 text-white font-pixel rounded-none pixel-corners pixel-btn"
                  disabled={isMinting}
                >
                  {isMinting ? (
                    <>
                      <div className="pixel-loader mr-2 h-4 w-4"></div>
                      <span>MINTING...</span>
                    </>
                  ) : (
                    <span>MINT NOW</span>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="rounded-none pixel-corners"
                >
                  Create Another
                </Button>
                <Button
                  onClick={() => {
                    setShowMintDialog(false)
                    // You can add navigation to a profile or collection page here
                  }}
                  className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
                >
                  <span>VIEW MY NFTS</span>
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


// "use client"

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { NFTPreview } from "@/components/nft-preview"
// import { generatePrompts, generateImages } from "@/lib/lilypad"
// import { uploadToIPFS, mintNFT } from "@/lib/nft-service"
// import { useToast } from "@/components/ui/use-toast"
// import { RefreshCw, Check, Plus, Minus, Info } from "lucide-react"
// import { PixelHeading } from "@/components/pixel-heading"
// import { PixelIcon } from "@/components/pixel-icon"
// import { PixelatedBackground } from "@/components/pixelated-background"
// import { useAccount } from "wagmi"
// import { ConnectWalletButton } from "@/components/connect-wallet-button"
// import { Rarity, RARITY_INFO } from "@/lib/contracts/nft-contract"
// import { getRarityLabel, getRarityClassNames } from "@/lib/nft/rarity-analyzer"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog"
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip"
// import { Slider } from "@/components/ui/slider"
// import { motion } from "framer-motion"

// export default function CreatePage() {
//   const [theme, setTheme] = useState("")
//   const [prompts, setPrompts] = useState<string[]>([])
//   const [images, setImages] = useState<string[]>([])
//   const [rarities, setRarities] = useState<Rarity[]>([])
//   const [selectedIndices, setSelectedIndices] = useState<number[]>([])
//   const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false)
//   const [isGeneratingImages, setIsGeneratingImages] = useState(false)
//   const [isMinting, setIsMinting] = useState(false)
//   const [showMintDialog, setShowMintDialog] = useState(false)
//   const [collectionName, setCollectionName] = useState("")
//   const [collectionDescription, setCollectionDescription] = useState("")
//   const [mintSuccess, setMintSuccess] = useState(false)
//   const [tokenIds, setTokenIds] = useState<string[]>([])
//   const [nftCount, setNftCount] = useState(1)
//   const [totalPrice, setTotalPrice] = useState("0.01")
  
//   const { toast } = useToast()
//   const { address, isConnected } = useAccount()

//   // Calculate the total price based on selected NFTs and their rarities
//   useEffect(() => {
//     if (selectedIndices.length === 0) {
//       setTotalPrice("0.00")
//       return
//     }

//     let price = 0
//     selectedIndices.forEach(index => {
//       if (rarities[index] !== undefined) {
//         const rarity = rarities[index]
//         price += RARITY_INFO[rarity].priceMultiplier * 0.01
//       } else {
//         price += 0.01 // Default price
//       }
//     })

//     setTotalPrice(price.toFixed(2))
//   }, [selectedIndices, rarities])

//   const handleGeneratePrompts = async () => {
//     if (!theme.trim()) {
//       toast({
//         title: "Error",
//         description: "Please enter a theme for your NFT collection",
//         variant: "destructive",
//       })
//       return
//     }

//     setIsGeneratingPrompts(true)
//     try {
//       const generatedPrompts = await generatePrompts(theme, nftCount)
//       setPrompts(generatedPrompts)
//       toast({
//         title: "Success",
//         description: "Prompts generated successfully!",
//       })
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to generate prompts. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsGeneratingPrompts(false)
//     }
//   }

//   const handleGenerateImages = async () => {
//     if (prompts.length === 0) {
//       toast({
//         title: "Error",
//         description: "Please generate prompts first",
//         variant: "destructive",
//       })
//       return
//     }

//     setIsGeneratingImages(true)
//     try {
//       const result = await generateImages(prompts)
//       setImages(result.images)
//       setRarities(result.rarities)
//       toast({
//         title: "Success",
//         description: "Images generated successfully!",
//       })
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to generate images. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsGeneratingImages(false)
//     }
//   }

//   const toggleImageSelection = (index: number) => {
//     setSelectedIndices(prev => {
//       if (prev.includes(index)) {
//         return prev.filter(i => i !== index)
//       } else {
//         return [...prev, index]
//       }
//     })
//   }

//   const handleMintCollection = async () => {
//     if (!isConnected) {
//       toast({
//         title: "Connection required",
//         description: "Please connect your wallet to mint NFTs",
//         variant: "destructive",
//       })
//       return
//     }
    
//     if (selectedIndices.length === 0) {
//       toast({
//         title: "Error",
//         description: "Please select at least one image to mint",
//         variant: "destructive",
//       })
//       return
//     }
    
//     setShowMintDialog(true)
//   }
  
//   const handleConfirmMint = async () => {
//     if (!collectionName.trim()) {
//       toast({
//         title: "Error",
//         description: "Please enter a name for your collection",
//         variant: "destructive",
//       })
//       return
//     }
    
//     setIsMinting(true)
    
//     try {
//       // Step 1: Upload selected images to IPFS
//       const uploadPromises = selectedIndices.map(index => 
//         uploadToIPFS(images[index], {
//           name: `${collectionName} #${index + 1}`,
//           description: collectionDescription,
//           rarity: rarities[index]
//         })
//       )
      
//       const uploadResults = await Promise.all(uploadPromises)
      
//       // Step 2: Mint the NFTs with the metadata URLs
//       const mintResult = await mintNFT({
//         metadataUrls: uploadResults.map(r => r.metadataUrl),
//         rarities: selectedIndices.map(index => rarities[index]),
//         bundleName: collectionName,
//         bundleDescription: collectionDescription,
//         bundlePreviewImageCid: uploadResults[0].imageCid, // Use first image as preview
//         walletAddress: address
//       })
      
//       // Step 3: Show success state
//       setTokenIds(Array.isArray(mintResult.tokenId) ? mintResult.tokenId : [mintResult.tokenId])
//       setMintSuccess(true)
      
//       toast({
//         title: "Success!",
//         description: "Your NFT collection has been minted successfully!",
//       })
//     } catch (error) {
//       console.error("Minting error:", error)
//       toast({
//         title: "Error",
//         description: "Failed to mint your NFT collection. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsMinting(false)
//     }
//   }
  
//   const resetForm = () => {
//     setTheme("")
//     setPrompts([])
//     setImages([])
//     setRarities([])
//     setSelectedIndices([])
//     setCollectionName("")
//     setCollectionDescription("")
//     setMintSuccess(false)
//     setTokenIds([])
//     setShowMintDialog(false)
//     setNftCount(1)
//   }

//   const incrementNftCount = () => {
//     setNftCount(prev => Math.min(prev + 1, 8))
//   }

//   const decrementNftCount = () => {
//     setNftCount(prev => Math.max(prev - 1, 1))
//   }

//   return (
//     <div className="relative">
//       <PixelatedBackground />

//       <PixelHeading
//         text="Create Pixel NFT Collection"
//         className="text-2xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pixel-green to-pixel-blue"
//       />

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
//         <motion.div 
//           className="space-y-6"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4 }}
//         >
//           <div className="space-y-2">
//             <label className="text-sm font-medium font-pixel text-xs">Collection Theme</label>
//             <div className="flex gap-0">
//               <Input
//                 value={theme}
//                 onChange={(e) => setTheme(e.target.value)}
//                 placeholder="e.g., Pixel Animals, Space Adventure"
//                 className="bg-gray-900/80 border-gray-800 rounded-none rounded-l-sm border-r-0 pixel-corners"
//               />
//               <Button
//                 onClick={handleGeneratePrompts}
//                 disabled={isGeneratingPrompts}
//                 className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none rounded-r-sm pixel-btn"
//               >
//                 {isGeneratingPrompts ? <div className="pixel-loader mr-2 h-4 w-4"></div> : "GENERATE"}
//               </Button>
//             </div>
//           </div>

//           <div className="space-y-2">
//             <div className="flex justify-between items-center">
//               <label className="text-sm font-medium font-pixel text-xs">Number of NFTs</label>
//               <div className="flex items-center gap-2">
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   onClick={decrementNftCount}
//                   disabled={nftCount <= 1}
//                   className="h-8 w-8 rounded-none pixel-corners"
//                 >
//                   <Minus className="h-4 w-4" />
//                 </Button>
//                 <span className="w-8 text-center font-pixel text-xs">{nftCount}</span>
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   onClick={incrementNftCount}
//                   disabled={nftCount >= 8}
//                   className="h-8 w-8 rounded-none pixel-corners"
//                 >
//                   <Plus className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>
            
//             <div className="bg-gray-900/80 p-3 border border-gray-800 rounded-none pixel-corners">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm font-pixel text-[10px]">B-Tier (Common)</span>
//                 <span className="text-sm font-pixel text-[10px]">S-Tier (Legendary)</span>
//               </div>
//               <Slider 
//                 defaultValue={[60]} 
//                 max={100} 
//                 step={1}
//                 disabled
//               />
//               <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
//                 <span>Frequency: High</span>
//                 <span>Frequency: Low</span>
//               </div>
//             </div>
            
//             <TooltipProvider>
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <div className="flex items-center gap-1 text-xs text-gray-400 cursor-help">
//                     <Info className="h-3 w-3" />
//                     <span>About NFT rarity tiers</span>
//                   </div>
//                 </TooltipTrigger>
//                 <TooltipContent className="w-80 p-3">
//                   <p className="font-medium mb-2">Rarity Tiers:</p>
//                   <ul className="space-y-2">
//                     <li className="flex items-center gap-2">
//                       <span className="bg-pixel-blue/20 text-pixel-blue px-2 py-0.5 rounded-sm text-xs">B-Tier</span>
//                       <span className="text-sm">Common pixel art (Base price: 0.01 tFIL)</span>
//                     </li>
//                     <li className="flex items-center gap-2">
//                       <span className="bg-pixel-purple/20 text-pixel-purple px-2 py-0.5 rounded-sm text-xs">A-Tier</span>
//                       <span className="text-sm">Rare pixel art (Price: 0.02 tFIL)</span>
//                     </li>
//                     <li className="flex items-center gap-2">
//                       <span className="bg-pixel-green/20 text-pixel-green px-2 py-0.5 rounded-sm text-xs">S-Tier</span>
//                       <span className="text-sm">Legendary pixel art (Price: 0.05 tFIL)</span>
//                     </li>
//                   </ul>
//                 </TooltipContent>
//               </Tooltip>
//             </TooltipProvider>
//           </div>

//           {prompts.length > 0 && (
//             <div className="space-y-2">
//               <div className="flex justify-between items-center">
//                 <label className="text-sm font-medium font-pixel text-xs">Generated Prompts</label>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={handleGeneratePrompts}
//                   disabled={isGeneratingPrompts}
//                   className="h-7 rounded-none pixel-corners"
//                 >
//                   <RefreshCw className="h-3 w-3 mr-1" />
//                   <span className="text-xs">Regenerate</span>
//                 </Button>
//               </div>
//               <div className="bg-gray-900/80 p-3 border border-gray-800 rounded-none pixel-corners max-h-40 overflow-y-auto">
//                 <ul className="space-y-2 text-xs">
//                   {prompts.map((prompt, index) => (
//                     <li key={index} className="flex items-start gap-2">
//                       <span className="bg-gray-800 px-1.5 py-0.5 rounded-sm">#{index + 1}</span>
//                       <span>{prompt}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
              
//               <Button
//                 onClick={handleGenerateImages}
//                 disabled={isGeneratingImages}
//                 className="w-full bg-pixel-purple hover:bg-pixel-purple/80 text-white font-pixel rounded-none pixel-corners pixel-btn mt-2"
//               >
//                 {isGeneratingImages ? (
//                   <>
//                     <div className="pixel-loader mr-2 h-4 w-4"></div>
//                     <span>GENERATING IMAGES...</span>
//                   </>
//                 ) : (
//                   <span>GENERATE PIXEL ART</span>
//                 )}
//               </Button>
//             </div>
//           )}
          
//           {!isConnected && (
//             <div className="flex justify-center mt-4">
//               <ConnectWalletButton />
//             </div>
//           )}
//         </motion.div>
        
//         <motion.div 
//           className="space-y-6"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4, delay: 0.1 }}
//         >
//           {images.length > 0 ? (
//             <>
//               <div className="flex justify-between items-center">
//                 <h3 className="font-medium font-pixel text-xs">Generated Pixel Art</h3>
//                 <div className="text-xs">
//                   <span className="text-pixel-green font-medium">{selectedIndices.length}</span>
//                   <span className="text-gray-400"> selected</span>
//                 </div>
//               </div>
              
//               <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
//                 {images.map((image, index) => (
//                   <NFTPreview
//                     key={index}
//                     image={image}
//                     rarity={rarities[index]}
//                     name={`#${index + 1}`}
//                     isSelected={selectedIndices.includes(index)}
//                     onClick={() => toggleImageSelection(index)}
//                   />
//                 ))}
//               </div>
              
//               {selectedIndices.length > 0 && (
//                 <div className="flex justify-between mt-4">
//                   <div>
//                     <p className="text-xs text-gray-400">Total Price:</p>
//                     <p className="font-medium text-lg">{totalPrice} tFIL</p>
//                   </div>
//                   <Button
//                     onClick={handleMintCollection}
//                     className="bg-pixel-blue hover:bg-pixel-blue/80 text-white font-pixel rounded-none pixel-corners pixel-btn"
//                     disabled={!isConnected}
//                   >
//                     <span>MINT COLLECTION</span>
//                   </Button>
//                 </div>
//               )}
//             </>
//           ) : (
//             <div className="flex flex-col items-center justify-center h-full bg-gray-900/50 border border-gray-800 rounded-none pixel-corners p-8">
//               <PixelIcon name="image" className="text-gray-600 mb-4 h-12 w-12" />
//               <p className="text-gray-400 text-center mb-2">Your pixel art will appear here</p>
//               <p className="text-xs text-gray-500 text-center">
//                 Enter a theme, generate prompts, and create pixel art
//               </p>
//             </div>
//           )}
//         </motion.div>
//       </div>
      
//       {/* Mint Collection Dialog */}
//       <Dialog open={showMintDialog} onOpenChange={setShowMintDialog}>
//         <DialogContent className="bg-gray-900/90 border-gray-800 rounded-none pixel-corners">
//           <DialogHeader>
//             <DialogTitle className="font-pixel text-pixel-green">
//               {mintSuccess ? "Collection Minted!" : "Mint NFT Collection"}
//             </DialogTitle>
//             {!mintSuccess && (
//               <DialogDescription>
//                 Enter details for your pixel art collection
//               </DialogDescription>
//             )}
//           </DialogHeader>
          
//           {!mintSuccess ? (
//             <div className="py-4 space-y-4">
//               <div className="space-y-2">
//                 <label className="text-sm font-medium font-pixel text-xs">Collection Name</label>
//                 <Input
//                   value={collectionName}
//                   onChange={(e) => setCollectionName(e.target.value)}
//                   placeholder="e.g., Pixel Adventurers"
//                   className="bg-gray-800/80 border-gray-700 rounded-none pixel-corners"
//                 />
//               </div>
              
//               <div className="space-y-2">
//                 <label className="text-sm font-medium font-pixel text-xs">Description (Optional)</label>
//                 <Textarea
//                   value={collectionDescription}
//                   onChange={(e) => setCollectionDescription(e.target.value)}
//                   placeholder="Describe your collection..."
//                   className="bg-gray-800/80 border-gray-700 rounded-none pixel-corners h-20"
//                 />
//               </div>
              
//               <div className="bg-gray-800/50 p-4 rounded-none pixel-corners">
//                 <div className="flex justify-between">
//                   <p className="text-sm">Selected Items:</p>
//                   <p className="text-sm font-medium">{selectedIndices.length}</p>
//                 </div>
//                 <div className="flex justify-between mt-1">
//                   <p className="text-sm">Total Price:</p>
//                   <p className="text-sm font-medium">{totalPrice} tFIL</p>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="py-6 space-y-6">
//               <div className="flex items-center justify-center">
//                 <div className="bg-pixel-green/20 text-pixel-green p-3 rounded-full">
//                   <Check className="h-8 w-8" />
//                 </div>
//               </div>
              
//               <div className="text-center space-y-1">
//                 <h3 className="font-medium">{collectionName}</h3>
//                 <p className="text-sm text-gray-400">
//                   {selectedIndices.length} NFTs successfully minted to your wallet
//                 </p>
//               </div>
              
//               <div className="bg-gray-800/50 p-4 rounded-none pixel-corners">
//                 <p className="text-sm text-gray-400 mb-2">Token IDs:</p>
//                 <div className="flex flex-wrap gap-2">
//                   {tokenIds.map((id, index) => (
//                     <div key={index} className="bg-gray-800 px-2 py-1 rounded-sm text-xs">
//                       #{id}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
          
//           <DialogFooter>
//             {!mintSuccess ? (
//               <>
//                 <Button
//                   variant="outline"
//                   onClick={() => setShowMintDialog(false)}
//                   className="rounded-none pixel-corners"
//                   disabled={isMinting}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={handleConfirmMint}
//                   className="bg-pixel-blue hover:bg-pixel-blue/80 text-white font-pixel rounded-none pixel-corners pixel-btn"
//                   disabled={isMinting}
//                 >
//                   {isMinting ? (
//                     <>
//                       <div className="pixel-loader mr-2 h-4 w-4"></div>
//                       <span>MINTING...</span>
//                     </>
//                   ) : (
//                     <span>MINT NOW</span>
//                   )}
//                 </Button>
//               </>
//             ) : (
//               <>
//                 <Button
//                   variant="outline"
//                   onClick={resetForm}
//                   className="rounded-none pixel-corners"
//                 >
//                   Create Another
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     setShowMintDialog(false)
//                     // You can add navigation to a profile or collection page here
//                   }}
//                   className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
//                 >
//                   <span>VIEW MY NFTS</span>
//                 </Button>
//               </>
//             )}
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }

// // "use client"

// // import { useState } from "react"
// // import { Button } from "@/components/ui/button"
// // import { Input } from "@/components/ui/input"
// // import { Textarea } from "@/components/ui/textarea"
// // import { NFTPreview } from "@/components/nft-preview"
// // import { generatePrompts, generateImages, uploadToIPFS, mintNFT } from "@/lib/lilypad"
// // import { useToast } from "@/components/ui/use-toast"
// // import { RefreshCw, Check } from "lucide-react"
// // import { PixelHeading } from "@/components/pixel-heading"
// // import { PixelIcon } from "@/components/pixel-icon"
// // import { PixelatedBackground } from "@/components/pixelated-background"
// // import { useWallet } from "@/components/wallet-provider"
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogDescription,
// //   DialogHeader,
// //   DialogTitle,
// //   DialogFooter,
// // } from "@/components/ui/dialog"
// // import { motion } from "framer-motion"

// // export default function CreatePage() {
// //   const [theme, setTheme] = useState("")
// //   const [prompts, setPrompts] = useState<string[]>([])
// //   const [images, setImages] = useState<string[]>([])
// //   const [selectedImages, setSelectedImages] = useState<string[]>([])
// //   const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false)
// //   const [isGeneratingImages, setIsGeneratingImages] = useState(false)
// //   const [isMinting, setIsMinting] = useState(false)
// //   const [showMintDialog, setShowMintDialog] = useState(false)
// //   const [collectionName, setCollectionName] = useState("")
// //   const [collectionDescription, setCollectionDescription] = useState("")
// //   const [mintSuccess, setMintSuccess] = useState(false)
// //   const [tokenId, setTokenId] = useState("")
  
// //   const { toast } = useToast()
// //   const { isConnected, connect } = useWallet()

// //   const handleGeneratePrompts = async () => {
// //     if (!theme.trim()) {
// //       toast({
// //         title: "Error",
// //         description: "Please enter a theme for your NFT collection",
// //         variant: "destructive",
// //       })
// //       return
// //     }

// //     setIsGeneratingPrompts(true)
// //     try {
// //       const generatedPrompts = await generatePrompts(theme)
// //       setPrompts(generatedPrompts)
// //       toast({
// //         title: "Success",
// //         description: "Prompts generated successfully!",
// //       })
// //     } catch (error) {
// //       toast({
// //         title: "Error",
// //         description: "Failed to generate prompts. Please try again.",
// //         variant: "destructive",
// //       })
// //     } finally {
// //       setIsGeneratingPrompts(false)
// //     }
// //   }

// //   const handleGenerateImages = async () => {
// //     if (prompts.length === 0) {
// //       toast({
// //         title: "Error",
// //         description: "Please generate prompts first",
// //         variant: "destructive",
// //       })
// //       return
// //     }

// //     setIsGeneratingImages(true)
// //     try {
// //       const generatedImages = await generateImages(prompts)
// //       setImages(generatedImages)
// //       toast({
// //         title: "Success",
// //         description: "Images generated successfully!",
// //       })
// //     } catch (error) {
// //       toast({
// //         title: "Error",
// //         description: "Failed to generate images. Please try again.",
// //         variant: "destructive",
// //       })
// //     } finally {
// //       setIsGeneratingImages(false)
// //     }
// //   }

// //   const toggleImageSelection = (imageUrl: string) => {
// //     if (selectedImages.includes(imageUrl)) {
// //       setSelectedImages(selectedImages.filter((url) => url !== imageUrl))
// //     } else {
// //       setSelectedImages([...selectedImages, imageUrl])
// //     }
// //   }

// //   const handleMintCollection = async () => {
// //     if (!isConnected) {
// //       try {
// //         await connect()
// //       } catch (error) {
// //         toast({
// //           title: "Connection failed",
// //           description: "Please connect your wallet to mint NFTs",
// //           variant: "destructive",
// //         })
// //         return
// //       }
// //     }
    
// //     if (selectedImages.length === 0) {
// //       toast({
// //         title: "Error",
// //         description: "Please select at least one image to mint",
// //         variant: "destructive",
// //       })
// //       return
// //     }
    
// //     setShowMintDialog(true)
// //   }
  
// //   const handleConfirmMint = async () => {
// //     if (!collectionName.trim()) {
// //       toast({
// //         title: "Error",
// //         description: "Please enter a name for your collection",
// //         variant: "destructive",
// //       })
// //       return
// //     }
    
// //     setIsMinting(true)
    
// //     try {
// //       // Step 1: Upload images to IPFS (in a real app)
// //       // Here we're just simulating with a delay
// //       await uploadToIPFS("imagedata")
      
// //       // Step 2: Create metadata
// //       const metadata = {
// //         name: collectionName,
// //         description: collectionDescription,
// //         images: selectedImages,
// //         creator: "currentUserAddress", // In a real app, this would be the connected wallet
// //         createdAt: new Date().toISOString(),
// //       }
      
// //       // Step 3: Mint the NFT collection
// //       const newTokenId = await mintNFT(metadata)
      
// //       // Step 4: Show success state
// //       setTokenId(newTokenId)
// //       setMintSuccess(true)
      
// //       toast({
// //         title: "Success!",
// //         description: "Your NFT collection has been minted successfully!",
// //       })
// //     } catch (error) {
// //       toast({
// //         title: "Error",
// //         description: "Failed to mint your NFT collection. Please try again.",
// //         variant: "destructive",
// //       })
// //     } finally {
// //       setIsMinting(false)
// //     }
// //   }
  
// //   const resetForm = () => {
// //     setTheme("")
// //     setPrompts([])
// //     setImages([])
// //     setSelectedImages([])
// //     setCollectionName("")
// //     setCollectionDescription("")
// //     setMintSuccess(false)
// //     setTokenId("")
// //     setShowMintDialog(false)
// //   }

// //   return (
// //     <div className="relative">
// //       <PixelatedBackground />

// //       <PixelHeading
// //         text="Create Pixel NFT Collection"
// //         className="text-2xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pixel-green to-pixel-blue"
// //       />

// //       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
// //         <motion.div 
// //           className="space-y-6"
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ duration: 0.4 }}
// //         >
// //           <div className="space-y-2">
// //             <label className="text-sm font-medium font-pixel text-xs">Collection Theme</label>
// //             <div className="flex gap-0">
// //               <Input
// //                 value={theme}
// //                 onChange={(e) => setTheme(e.target.value)}
// //                 placeholder="e.g., Pixel Animals, Space Adventure"
// //                 className="bg-gray-900/80 border-gray-800 rounded-none rounded-l-sm border-r-0 pixel-corners"
// //               />
// //               <Button
// //                 onClick={handleGeneratePrompts}
// //                 disabled={isGeneratingPrompts}
// //                 className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none rounded-r-sm pixel-btn"
// //               >
// //                 {isGeneratingPrompts ? <div className="pixel-loader mr-2 h-4 w-4"></div> : "GENERATE"}
// //               </Button>
// //             </div>
// //           </div>

// //           {prompts.length > 0 && (
// //             <motion.div 
// //               className="space-y-2"
// //               initial={{ opacity: 0, height: 0 }}
// //               animate={{ opacity: 1, height: "auto" }}
// //               transition={{ duration: 0.3 }}
// //             >
// //               <div className="flex justify-between items-center">
// //                 <label className="text-sm font-medium font-pixel text-xs">Generated Prompts</label>
// //                 <Button
// //                   variant="outline"
// //                   size="sm"
// //                   onClick={handleGeneratePrompts}
// //                   className="text-xs rounded-none pixel-corners"
// //                 >
// //                   <PixelIcon icon={RefreshCw} className="h-3 w-3 mr-1" />
// //                   <span className="font-pixel text-[10px]">REGENERATE</span>
// //                 </Button>
// //               </div>
// //               <Textarea
// //                 value={prompts.join("\n")}
// //                 readOnly
// //                 className="h-32 bg-gray-900/80 border-gray-800 font-mono text-xs rounded-none pixel-corners"
// //               />
// //               <Button
// //                 onClick={handleGenerateImages}
// //                 disabled={isGeneratingImages}
// //                 className="w-full bg-pixel-blue hover:bg-pixel-blue/80 font-pixel rounded-none pixel-corners pixel-btn"
// //               >
// //                 {isGeneratingImages ? (
// //                   <>
// //                     <div className="pixel-loader mr-2 h-4 w-4"></div>
// //                     <span className="font-pixel text-xs">GENERATING...</span>
// //                   </>
// //                 ) : (
// //                   <span className="font-pixel text-xs">GENERATE IMAGES</span>
// //                 )}
// //               </Button>
// //             </motion.div>
// //           )}

// //           {selectedImages.length > 0 && (
// //             <motion.div 
// //               className="space-y-2 pt-4 border-t border-gray-800"
// //               initial={{ opacity: 0, y: 10 }}
// //               animate={{ opacity: 1, y: 0 }}
// //               transition={{ duration: 0.3 }}
// //             >
// //               <label className="text-sm font-medium font-pixel text-xs">
// //                 Selected Images ({selectedImages.length})
// //               </label>
// //               <Button
// //                 onClick={handleMintCollection}
// //                 className="w-full gold-gradient hover:opacity-90 text-black font-pixel rounded-none pixel-corners pixel-btn"
// //               >
// //                 <span className="font-pixel text-xs">MINT NFT COLLECTION</span>
// //               </Button>
// //             </motion.div>
// //           )}
// //         </motion.div>

// //         <motion.div 
// //           className="space-y-4"
// //           initial={{ opacity: 0, y: 20 }}
// //           animate={{ opacity: 1, y: 0 }}
// //           transition={{ duration: 0.4, delay: 0.1 }}
// //         >
// //           <h2 className="text-lg font-pixel text-xs">Preview</h2>
// //           {images.length > 0 ? (
// //             <div className="grid grid-cols-2 gap-4">
// //               {images.map((imageUrl, index) => (
// //                 <NFTPreview
// //                   key={index}
// //                   imageUrl={imageUrl}
// //                   isSelected={selectedImages.includes(imageUrl)}
// //                   onClick={() => toggleImageSelection(imageUrl)}
// //                   isGold={index === 0 || prompts[index].includes('gold')} // Make some gold based on prompts
// //                 />
// //               ))}
// //             </div>
// //           ) : (
// //             <div className="h-64 bg-gray-900/80 rounded-none flex items-center justify-center border border-dashed border-gray-800 pixel-corners">
// //               <p className="text-gray-500 text-sm font-pixel text-xs animate-pixel-fade">
// //                 Generated images will appear here
// //               </p>
// //             </div>
// //           )}
// //         </motion.div>
// //       </div>
      
// //       {/* Mint Collection Dialog */}
// //       <Dialog open={showMintDialog} onOpenChange={setShowMintDialog}>
// //         <DialogContent className="bg-gray-900/90 border-gray-800 rounded-none pixel-corners">
// //           <DialogHeader>
// //             <DialogTitle className="font-pixel text-pixel-green">
// //               {mintSuccess ? "Collection Minted!" : "Mint NFT Collection"}
// //             </DialogTitle>
// //             <DialogDescription>
// //               {mintSuccess 
// //                 ? "Your NFT collection has been successfully minted on Filecoin." 
// //                 : "Provide details for your NFT collection"}
// //             </DialogDescription>
// //           </DialogHeader>
          
// //           {!mintSuccess ? (
// //             <div className="space-y-4 py-4">
// //               <div className="space-y-2">
// //                 <label className="text-sm font-medium font-pixel text-xs">Collection Name</label>
// //                 <Input 
// //                   value={collectionName}
// //                   onChange={(e) => setCollectionName(e.target.value)}
// //                   placeholder="Enter collection name"
// //                   className="bg-gray-800/80 border-gray-700 rounded-none pixel-corners"
// //                 />
// //               </div>
              
// //               <div className="space-y-2">
// //                 <label className="text-sm font-medium font-pixel text-xs">Description</label>
// //                 <Textarea
// //                   value={collectionDescription}
// //                   onChange={(e) => setCollectionDescription(e.target.value)}
// //                   placeholder="Describe your collection..."
// //                   className="h-24 bg-gray-800/80 border-gray-700 rounded-none pixel-corners"
// //                 />
// //               </div>
              
// //               <div className="grid grid-cols-4 gap-2">
// //                 {selectedImages.map((img, i) => (
// //                   <div key={i} className="aspect-square rounded-none pixel-corners overflow-hidden border border-gray-800">
// //                     <img src={img} alt={`Selected ${i}`} className="w-full h-full object-cover pixelated" />
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           ) : (
// //             <div className="py-6 flex flex-col items-center justify-center">
// //               <div className="h-16 w-16 bg-pixel-green/20 rounded-full flex items-center justify-center mb-4">
// //                 <Check className="h-8 w-8 text-pixel-green" />
// //               </div>
              
// //               <div className="text-center mb-4">
// //                 <p className="text-white mb-2">Token ID:</p>
// //                 <code className="bg-gray-800 px-3 py-1 rounded-sm text-sm">{tokenId}</code>
// //               </div>
              
// //               <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
// //                 {selectedImages.slice(0, 4).map((img, i) => (
// //                   <div key={i} className="aspect-square rounded-none pixel-corners overflow-hidden border border-gray-800">
// //                     <img src={img} alt={`Minted ${i}`} className="w-full h-full object-cover pixelated" />
// //                   </div>
// //                 ))}
// //               </div>
// //             </div>
// //           )}
          
// //           <DialogFooter className="flex flex-col sm:flex-row gap-2">
// //             {!mintSuccess ? (
// //               <>
// //                 <Button 
// //                   variant="outline" 
// //                   onClick={() => setShowMintDialog(false)}
// //                   className="w-full sm:w-auto bg-gray-800 border-gray-700 hover:bg-gray-700 rounded-none pixel-corners"
// //                 >
// //                   Cancel
// //                 </Button>
// //                 <Button 
// //                   onClick={handleConfirmMint}
// //                   disabled={isMinting}
// //                   className="w-full sm:w-auto bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
// //                 >
// //                   {isMinting ? (
// //                     <>
// //                       <div className="pixel-loader mr-2 h-4 w-4"></div>
// //                       <span className="font-pixel text-xs">MINTING...</span>
// //                     </>
// //                   ) : (
// //                     <span className="font-pixel text-xs">CONFIRM & MINT</span>
// //                   )}
// //                 </Button>
// //               </>
// //             ) : (
// //               <Button 
// //                 onClick={resetForm}
// //                 className="w-full bg-pixel-blue hover:bg-pixel-blue/80 font-pixel rounded-none pixel-corners pixel-btn"
// //               >
// //                 <span className="font-pixel text-xs">CREATE NEW COLLECTION</span>
// //               </Button>
// //             )}
// //           </DialogFooter>
// //         </DialogContent>
// //       </Dialog>
// //     </div>
// //   )
// // }