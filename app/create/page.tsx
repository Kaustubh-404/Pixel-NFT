"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { NFTPreview } from "@/components/nft-preview"
import { useToast } from "@/components/ui/use-toast"
import { RefreshCw, Check, AlertTriangle, Loader2 } from "lucide-react"
import { PixelHeading } from "@/components/pixel-heading"
import { PixelIcon } from "@/components/pixel-icon"
import { PixelatedBackground } from "@/components/pixelated-background"
import { useWallet } from "@/components/wallet-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ConnectWallet } from "@/components/connect-wallet"

export default function CreatePage() {
  const router = useRouter()
  const [theme, setTheme] = useState("")
  const [prompts, setPrompts] = useState<string[]>([])
  const [images, setImages] = useState<{base64: string, filepath: string}[]>([])
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false)
  const [isGeneratingImages, setIsGeneratingImages] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showMintDialog, setShowMintDialog] = useState(false)
  const [collectionName, setCollectionName] = useState("")
  const [collectionDescription, setCollectionDescription] = useState("")
  const [mintSuccess, setMintSuccess] = useState(false)
  const [tokenId, setTokenId] = useState("")
  const [collectionId, setCollectionId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [generatedThemeDirectory, setGeneratedThemeDirectory] = useState<string | null>(null)
  const [transactionDetails, setTransactionDetails] = useState<any>(null)
  
  const { toast } = useToast()
  const { isConnected, connect, isConnecting, address } = useWallet()

  // When the theme changes, clear any previous prompts and images
  useEffect(() => {
    setPrompts([])
    setImages([])
    setSelectedImages([])
    setError(null)
  }, [theme])

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
    setError(null)
    
    try {
      // Call the generate-prompts API
      const response = await fetch("/api/generate-prompts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme, numPrompts: 5 }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate prompts")
      }

      const data = await response.json()
      setPrompts(data.prompts)
      
      toast({
        title: "Success",
        description: "Prompts generated successfully!",
      })
    } catch (error: any) {
      setError(error.message || "Failed to generate prompts. Please try again.")
      toast({
        title: "Error",
        description: error.message || "Failed to generate prompts. Please try again.",
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
    setError(null)
    setImages([])
    setSelectedImages([])
    
    try {
      // Call the generate-images API
      const response = await fetch("/api/generate-images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompts, 
          theme: theme.trim() // Pass the theme for directory naming
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate images")
      }

      const data = await response.json()
      
      // Save the generated images
      if (data.images && data.images.length > 0) {
        setImages(data.images)
        setGeneratedThemeDirectory(data.themeDirectory)
        
        toast({
          title: "Success",
          description: `Generated ${data.images.length} images successfully!`,
        })
      } else {
        throw new Error("No images were generated")
      }
    } catch (error: any) {
      setError(error.message || "Failed to generate images. Please try again.")
      toast({
        title: "Error",
        description: error.message || "Failed to generate images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingImages(false)
    }
  }

  const toggleImageSelection = (imageUrl: string) => {
    if (selectedImages.includes(imageUrl)) {
      setSelectedImages(selectedImages.filter((url) => url !== imageUrl))
    } else {
      setSelectedImages([...selectedImages, imageUrl])
    }
  }

  const handleMintCollection = async () => {
    if (!isConnected) {
      try {
        // With RainbowKit, we show a toast suggesting to use the connect button
        toast({
          title: "Not connected",
          description: "Please connect your wallet using the connect button to mint NFTs",
        })
        return
      } catch (error: any) {
        toast({
          title: "Connection failed",
          description: error.message || "Please connect your wallet to mint NFTs",
          variant: "destructive",
        })
        return
      }
    }
    
    if (selectedImages.length === 0) {
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
    if (!address) {
      toast({
        title: "Error",
        description: "Wallet address not available. Please reconnect your wallet.",
        variant: "destructive",
      })
      return
    }
    
    if (!collectionName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your collection",
        variant: "destructive",
      })
      return
    }
    
    setIsMinting(true)
    setError(null)
    
    try {
      setIsUploading(true)
      
      // Step 1: Upload selected images to IPFS
      const selectedImageDetails = images.filter(img => 
        selectedImages.includes(img.base64)
      )
      
      const uploadPromises = selectedImageDetails.map(async (img) => {
        try {
          // Extract the imageData and fileName
          const response = await fetch("/api/upload-to-ipfs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              imageData: img.base64,
              fileName: img.filepath.split('/').pop() || "nft-image.png",
            }),
          })
    
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to upload image to IPFS")
          }
    
          return await response.json()
        } catch (error: any) {
          console.error("Error uploading image:", error)
          return null
        }
      })
    
      const uploadResults = await Promise.all(uploadPromises)
      const successfulUploads = uploadResults.filter(result => result && result.success)
      
      if (successfulUploads.length === 0) {
        throw new Error("Failed to upload any images to IPFS")
      }
      
      setIsUploading(false)
      
      // Step 2: Create metadata
      const metadata = {
        name: collectionName,
        description: collectionDescription,
        images: successfulUploads.map(upload => ({
          cid: upload.cid,
          url: upload.url,
        })),
        creator: address, // Use the actual connected wallet address
        createdAt: new Date().toISOString(),
        theme: theme,
      }
      
      // Step 3: Mint the NFT collection on Filecoin Calibration Network
      const mintResponse = await fetch("/api/mint-nft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          metadata,
          walletAddress: address 
        }),
      })
      
      if (!mintResponse.ok) {
        const errorData = await mintResponse.json()
        throw new Error(errorData.error || "Failed to mint NFT collection")
      }
      
      const mintData = await mintResponse.json()
      
      // Save transaction details
      setTransactionDetails({
        network: mintData.network || "Filecoin Calibration", 
        currency: mintData.currency || "tFIL",
        fee: mintData.fee || "0.01 tFIL"
      })
      
      // Step 4: Show success state
      setTokenId(mintData.tokenId)
      setCollectionId(theme.toLowerCase().replace(/\s+/g, '-'))
      setMintSuccess(true)
      
      toast({
        title: "Success!",
        description: "Your NFT collection has been minted successfully on Filecoin Calibration Network!",
      })
    } catch (error: any) {
      setError(error.message || "Failed to mint your NFT collection. Please try again.")
      toast({
        title: "Error",
        description: error.message || "Failed to mint your NFT collection. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsMinting(false)
      setIsUploading(false)
    }
  }
  
  const viewCollection = () => {
    // Navigate to the collection page
    router.push(`/collection/${collectionId}`);
    setShowMintDialog(false);
  };
  
  const resetForm = () => {
    setTheme("")
    setPrompts([])
    setImages([])
    setSelectedImages([])
    setCollectionName("")
    setCollectionDescription("")
    setMintSuccess(false)
    setTokenId("")
    setCollectionId("")
    setShowMintDialog(false)
    setError(null)
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
                disabled={isGeneratingPrompts || isGeneratingImages}
              />
              <Button
                onClick={handleGeneratePrompts}
                disabled={isGeneratingPrompts || isGeneratingImages || !theme.trim()}
                className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none rounded-r-sm pixel-btn"
              >
                {isGeneratingPrompts ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="font-pixel text-xs">GENERATING...</span>
                  </div>
                ) : (
                  <span className="font-pixel text-xs">GENERATE</span>
                )}
              </Button>
            </div>
          </div>

          {prompts.length > 0 && (
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium font-pixel text-xs">Generated Prompts</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePrompts}
                  disabled={isGeneratingPrompts || isGeneratingImages}
                  className="text-xs rounded-none pixel-corners"
                >
                  <PixelIcon icon={RefreshCw} className="h-3 w-3 mr-1" />
                  <span className="font-pixel text-[10px]">REGENERATE</span>
                </Button>
              </div>
              <Textarea
                value={prompts.join("\n")}
                readOnly
                className="h-32 bg-gray-900/80 border-gray-800 font-mono text-xs rounded-none pixel-corners"
              />
              <Button
                onClick={handleGenerateImages}
                disabled={isGeneratingImages || isGeneratingPrompts}
                className="w-full bg-pixel-blue hover:bg-pixel-blue/80 font-pixel rounded-none pixel-corners pixel-btn"
              >
                {isGeneratingImages ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="font-pixel text-xs">GENERATING IMAGES...</span>
                  </div>
                ) : (
                  <span className="font-pixel text-xs">GENERATE IMAGES</span>
                )}
              </Button>
            </motion.div>
          )}

          {selectedImages.length > 0 && (
            <motion.div 
              className="space-y-2 pt-4 border-t border-gray-800"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label className="text-sm font-medium font-pixel text-xs">
                Selected Images ({selectedImages.length})
              </label>
              
              {/* Wallet connection status and minting button */}
              <div className="flex flex-col gap-3">
                {!isConnected && (
                  <div className="bg-gray-800/50 p-3 rounded-none pixel-corners">
                    <p className="text-gray-300 text-sm mb-2">Connect your wallet to mint NFTs on Filecoin Calibration Network</p>
                    <div className="flex justify-center">
                      <ConnectWallet />
                    </div>
                  </div>
                )}
                
                <Button
                  onClick={handleMintCollection}
                  disabled={isMinting || isConnecting || !isConnected}
                  className="w-full gold-gradient hover:opacity-90 text-black font-pixel rounded-none pixel-corners pixel-btn"
                >
                  {isConnecting ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="font-pixel text-xs">CONNECTING WALLET...</span>
                    </div>
                  ) : (
                    <span className="font-pixel text-xs">MINT NFT COLLECTION</span>
                  )}
                </Button>
                <p className="text-xs text-center text-gray-400">
                  Minting cost: ~0.01 tFIL on Filecoin Calibration Network
                </p>
              </div>
            </motion.div>
          )}
          
          {error && (
            <motion.div
              className="bg-red-900/20 border border-red-900/50 rounded-none pixel-corners p-4 flex items-start gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-pixel text-xs text-red-500 mb-1">Error Occurred</p>
                <p className="text-sm text-gray-300">{error}</p>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h2 className="text-lg font-pixel text-xs">Preview</h2>
          {images.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {images.map((image, index) => (
                <NFTPreview
                  key={index}
                  imageUrl={image.base64}
                  isSelected={selectedImages.includes(image.base64)}
                  onClick={() => toggleImageSelection(image.base64)}
                  isGold={index === 0 || prompts[index]?.includes('gold')} // Make some gold based on prompts
                />
              ))}
            </div>
          ) : (
            <div className="h-64 bg-gray-900/80 rounded-none flex items-center justify-center border border-dashed border-gray-800 pixel-corners">
              <p className="text-gray-500 text-sm font-pixel text-xs animate-pixel-fade">
                Generated images will appear here
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
            <DialogDescription>
              {mintSuccess 
                ? "Your NFT collection has been successfully minted on Filecoin Calibration Network." 
                : "Provide details for your NFT collection"}
            </DialogDescription>
          </DialogHeader>
          
          {!mintSuccess ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium font-pixel text-xs">Collection Name</label>
                <Input 
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  placeholder="Enter collection name"
                  className="bg-gray-800/80 border-gray-700 rounded-none pixel-corners"
                  disabled={isMinting}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium font-pixel text-xs">Description</label>
                <Textarea
                  value={collectionDescription}
                  onChange={(e) => setCollectionDescription(e.target.value)}
                  placeholder="Describe your collection..."
                  className="h-24 bg-gray-800/80 border-gray-700 rounded-none pixel-corners"
                  disabled={isMinting}
                />
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {selectedImages.map((img, i) => (
                  <div key={i} className="aspect-square rounded-none pixel-corners overflow-hidden border border-gray-800">
                    <img src={img} alt={`Selected ${i}`} className="w-full h-full object-cover pixelated" />
                  </div>
                ))}
              </div>
              
              <div className="bg-gray-800/50 p-3 rounded-none pixel-corners">
                <p className="text-xs text-center text-gray-300 mb-1">
                  Network: <span className="text-pixel-blue">Filecoin Calibration</span>
                </p>
                <p className="text-xs text-center text-gray-300">
                  Estimated cost: <span className="text-pixel-green">0.01 tFIL</span>
                </p>
              </div>
              
              {error && (
                <div className="bg-red-900/20 border border-red-900/50 rounded-none pixel-corners p-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="h-16 w-16 bg-pixel-green/20 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-pixel-green" />
              </div>
              
              <div className="text-center mb-4">
                <p className="text-white mb-2">Token ID:</p>
                <code className="bg-gray-800 px-3 py-1 rounded-sm text-sm">{tokenId}</code>
              </div>
              
              <div className="grid grid-cols-4 gap-2 max-w-md mx-auto mb-4">
                {selectedImages.slice(0, 4).map((img, i) => (
                  <div key={i} className="aspect-square rounded-none pixel-corners overflow-hidden border border-gray-800">
                    <img src={img} alt={`Minted ${i}`} className="w-full h-full object-cover pixelated" />
                  </div>
                ))}
              </div>
              
              {transactionDetails && (
                <div className="bg-gray-800/50 p-3 w-full rounded-none pixel-corners mb-4">
                  <p className="text-xs text-center text-gray-300 mb-1">
                    Network: <span className="text-pixel-blue">{transactionDetails.network}</span>
                  </p>
                  <p className="text-xs text-center text-gray-300">
                    Fee paid: <span className="text-pixel-green">{transactionDetails.fee}</span>
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {!mintSuccess ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setShowMintDialog(false)}
                  disabled={isMinting}
                  className="w-full sm:w-auto bg-gray-800 border-gray-700 hover:bg-gray-700 rounded-none pixel-corners"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmMint}
                  disabled={isMinting || !collectionName.trim() || !isConnected}
                  className="w-full sm:w-auto bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
                >
                  {isMinting ? (
                    <div className="flex items-center">
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span className="font-pixel text-xs">UPLOADING TO IPFS...</span>
                        </>
                      ) : (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span className="font-pixel text-xs">MINTING NFT...</span>
                        </>
                      )}
                    </div>
                  ) : (
                    <span className="font-pixel text-xs">CONFIRM & MINT</span>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={viewCollection}
                  className="w-full sm:w-auto gold-gradient hover:opacity-90 text-black font-pixel rounded-none pixel-corners pixel-btn"
                >
                  <span className="font-pixel text-xs">VIEW COLLECTION</span>
                </Button>
                <Button 
                  onClick={resetForm}
                  className="w-full sm:w-auto bg-pixel-blue hover:bg-pixel-blue/80 font-pixel rounded-none pixel-corners pixel-btn"
                >
                  <span className="font-pixel text-xs">CREATE NEW COLLECTION</span>
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
// import { useToast } from "@/components/ui/use-toast"
// import { RefreshCw, Check, AlertTriangle, Loader2 } from "lucide-react"
// import { PixelHeading } from "@/components/pixel-heading"
// import { PixelIcon } from "@/components/pixel-icon"
// import { PixelatedBackground } from "@/components/pixelated-background"
// import { useWallet } from "@/components/wallet-provider"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog"
// import { motion } from "framer-motion"
// import { useRouter } from "next/navigation"

// export default function CreatePage() {
//   const router = useRouter()
//   const [theme, setTheme] = useState("")
//   const [prompts, setPrompts] = useState<string[]>([])
//   const [images, setImages] = useState<{base64: string, filepath: string}[]>([])
//   const [selectedImages, setSelectedImages] = useState<string[]>([])
//   const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false)
//   const [isGeneratingImages, setIsGeneratingImages] = useState(false)
//   const [isMinting, setIsMinting] = useState(false)
//   const [isUploading, setIsUploading] = useState(false)
//   const [showMintDialog, setShowMintDialog] = useState(false)
//   const [collectionName, setCollectionName] = useState("")
//   const [collectionDescription, setCollectionDescription] = useState("")
//   const [mintSuccess, setMintSuccess] = useState(false)
//   const [tokenId, setTokenId] = useState("")
//   const [collectionId, setCollectionId] = useState("")
//   const [error, setError] = useState<string | null>(null)
//   const [generatedThemeDirectory, setGeneratedThemeDirectory] = useState<string | null>(null)
  
//   const { toast } = useToast()
//   const { isConnected, connect, isConnecting } = useWallet()

//   // When the theme changes, clear any previous prompts and images
//   useEffect(() => {
//     setPrompts([])
//     setImages([])
//     setSelectedImages([])
//     setError(null)
//   }, [theme])

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
//     setError(null)
    
//     try {
//       // Call the generate-prompts API
//       const response = await fetch("/api/generate-prompts", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ theme, numPrompts: 5 }),
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || "Failed to generate prompts")
//       }

//       const data = await response.json()
//       setPrompts(data.prompts)
      
//       toast({
//         title: "Success",
//         description: "Prompts generated successfully!",
//       })
//     } catch (error: any) {
//       setError(error.message || "Failed to generate prompts. Please try again.")
//       toast({
//         title: "Error",
//         description: error.message || "Failed to generate prompts. Please try again.",
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
//     setError(null)
//     setImages([])
//     setSelectedImages([])
    
//     try {
//       // Call the generate-images API
//       const response = await fetch("/api/generate-images", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ 
//           prompts, 
//           theme: theme.trim() // Pass the theme for directory naming
//         }),
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || "Failed to generate images")
//       }

//       const data = await response.json()
      
//       // Save the generated images
//       if (data.images && data.images.length > 0) {
//         setImages(data.images)
//         setGeneratedThemeDirectory(data.themeDirectory)
        
//         toast({
//           title: "Success",
//           description: `Generated ${data.images.length} images successfully!`,
//         })
//       } else {
//         throw new Error("No images were generated")
//       }
//     } catch (error: any) {
//       setError(error.message || "Failed to generate images. Please try again.")
//       toast({
//         title: "Error",
//         description: error.message || "Failed to generate images. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsGeneratingImages(false)
//     }
//   }

//   const toggleImageSelection = (imageUrl: string) => {
//     if (selectedImages.includes(imageUrl)) {
//       setSelectedImages(selectedImages.filter((url) => url !== imageUrl))
//     } else {
//       setSelectedImages([...selectedImages, imageUrl])
//     }
//   }

//   const handleMintCollection = async () => {
//     if (!isConnected) {
//       try {
//         await connect()
//       } catch (error: any) {
//         toast({
//           title: "Connection failed",
//           description: error.message || "Please connect your wallet to mint NFTs",
//           variant: "destructive",
//         })
//         return
//       }
//     }
    
//     if (selectedImages.length === 0) {
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
//     setError(null)
    
//     try {
//       setIsUploading(true)
      
//       // Step 1: Upload selected images to IPFS
//       const selectedImageDetails = images.filter(img => 
//         selectedImages.includes(img.base64)
//       )
      
//       const uploadPromises = selectedImageDetails.map(async (img) => {
//         try {
//           // Extract the imageData and fileName
//           const response = await fetch("/api/upload-to-ipfs", {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               imageData: img.base64,
//               fileName: img.filepath.split('/').pop() || "nft-image.png",
//             }),
//           })
    
//           if (!response.ok) {
//             const errorData = await response.json()
//             throw new Error(errorData.error || "Failed to upload image to IPFS")
//           }
    
//           return await response.json()
//         } catch (error: any) {
//           console.error("Error uploading image:", error)
//           return null
//         }
//       })
    
//       const uploadResults = await Promise.all(uploadPromises)
//       const successfulUploads = uploadResults.filter(result => result && result.success)
      
//       if (successfulUploads.length === 0) {
//         throw new Error("Failed to upload any images to IPFS")
//       }
      
//       setIsUploading(false)
      
//       // Step 2: Create metadata
//       const metadata = {
//         name: collectionName,
//         description: collectionDescription,
//         images: successfulUploads.map(upload => ({
//           cid: upload.cid,
//           url: upload.url,
//         })),
//         creator: "currentUserAddress", // In a real app, this would be the connected wallet
//         createdAt: new Date().toISOString(),
//         theme: theme,
//       }
      
//       // Step 3: Mint the NFT collection
//       const mintResponse = await fetch("/api/mint-nft", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ metadata }),
//       })
      
//       if (!mintResponse.ok) {
//         const errorData = await mintResponse.json()
//         throw new Error(errorData.error || "Failed to mint NFT collection")
//       }
      
//       const mintData = await mintResponse.json()
      
//       // Step 4: Show success state
//       setTokenId(mintData.tokenId)
//       setCollectionId(theme.toLowerCase().replace(/\s+/g, '-'))
//       setMintSuccess(true)
      
//       toast({
//         title: "Success!",
//         description: "Your NFT collection has been minted successfully!",
//       })
//     } catch (error: any) {
//       setError(error.message || "Failed to mint your NFT collection. Please try again.")
//       toast({
//         title: "Error",
//         description: error.message || "Failed to mint your NFT collection. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsMinting(false)
//       setIsUploading(false)
//     }
//   }
  
//   const viewCollection = () => {
//     // Navigate to the collection page
//     router.push(`/collection/${collectionId}`);
//     setShowMintDialog(false);
//   };
  
//   const resetForm = () => {
//     setTheme("")
//     setPrompts([])
//     setImages([])
//     setSelectedImages([])
//     setCollectionName("")
//     setCollectionDescription("")
//     setMintSuccess(false)
//     setTokenId("")
//     setCollectionId("")
//     setShowMintDialog(false)
//     setError(null)
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
//                 disabled={isGeneratingPrompts || isGeneratingImages}
//               />
//               <Button
//                 onClick={handleGeneratePrompts}
//                 disabled={isGeneratingPrompts || isGeneratingImages || !theme.trim()}
//                 className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none rounded-r-sm pixel-btn"
//               >
//                 {isGeneratingPrompts ? (
//                   <div className="flex items-center">
//                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                     <span className="font-pixel text-xs">GENERATING...</span>
//                   </div>
//                 ) : (
//                   <span className="font-pixel text-xs">GENERATE</span>
//                 )}
//               </Button>
//             </div>
//           </div>

//           {prompts.length > 0 && (
//             <motion.div 
//               className="space-y-2"
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: "auto" }}
//               transition={{ duration: 0.3 }}
//             >
//               <div className="flex justify-between items-center">
//                 <label className="text-sm font-medium font-pixel text-xs">Generated Prompts</label>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={handleGeneratePrompts}
//                   disabled={isGeneratingPrompts || isGeneratingImages}
//                   className="text-xs rounded-none pixel-corners"
//                 >
//                   <PixelIcon icon={RefreshCw} className="h-3 w-3 mr-1" />
//                   <span className="font-pixel text-[10px]">REGENERATE</span>
//                 </Button>
//               </div>
//               <Textarea
//                 value={prompts.join("\n")}
//                 readOnly
//                 className="h-32 bg-gray-900/80 border-gray-800 font-mono text-xs rounded-none pixel-corners"
//               />
//               <Button
//                 onClick={handleGenerateImages}
//                 disabled={isGeneratingImages || isGeneratingPrompts}
//                 className="w-full bg-pixel-blue hover:bg-pixel-blue/80 font-pixel rounded-none pixel-corners pixel-btn"
//               >
//                 {isGeneratingImages ? (
//                   <div className="flex items-center">
//                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                     <span className="font-pixel text-xs">GENERATING IMAGES...</span>
//                   </div>
//                 ) : (
//                   <span className="font-pixel text-xs">GENERATE IMAGES</span>
//                 )}
//               </Button>
//             </motion.div>
//           )}

//           {selectedImages.length > 0 && (
//             <motion.div 
//               className="space-y-2 pt-4 border-t border-gray-800"
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.3 }}
//             >
//               <label className="text-sm font-medium font-pixel text-xs">
//                 Selected Images ({selectedImages.length})
//               </label>
//               <Button
//                 onClick={handleMintCollection}
//                 disabled={isMinting || isConnecting}
//                 className="w-full gold-gradient hover:opacity-90 text-black font-pixel rounded-none pixel-corners pixel-btn"
//               >
//                 {isConnecting ? (
//                   <div className="flex items-center">
//                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                     <span className="font-pixel text-xs">CONNECTING WALLET...</span>
//                   </div>
//                 ) : (
//                   <span className="font-pixel text-xs">MINT NFT COLLECTION</span>
//                 )}
//               </Button>
//             </motion.div>
//           )}
          
//           {error && (
//             <motion.div
//               className="bg-red-900/20 border border-red-900/50 rounded-none pixel-corners p-4 flex items-start gap-3"
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.3 }}
//             >
//               <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
//               <div>
//                 <p className="font-pixel text-xs text-red-500 mb-1">Error Occurred</p>
//                 <p className="text-sm text-gray-300">{error}</p>
//               </div>
//             </motion.div>
//           )}
//         </motion.div>

//         <motion.div 
//           className="space-y-4"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.4, delay: 0.1 }}
//         >
//           <h2 className="text-lg font-pixel text-xs">Preview</h2>
//           {images.length > 0 ? (
//             <div className="grid grid-cols-2 gap-4">
//               {images.map((image, index) => (
//                 <NFTPreview
//                   key={index}
//                   imageUrl={image.base64}
//                   isSelected={selectedImages.includes(image.base64)}
//                   onClick={() => toggleImageSelection(image.base64)}
//                   isGold={index === 0 || prompts[index]?.includes('gold')} // Make some gold based on prompts
//                 />
//               ))}
//             </div>
//           ) : (
//             <div className="h-64 bg-gray-900/80 rounded-none flex items-center justify-center border border-dashed border-gray-800 pixel-corners">
//               <p className="text-gray-500 text-sm font-pixel text-xs animate-pixel-fade">
//                 Generated images will appear here
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
//             <DialogDescription>
//               {mintSuccess 
//                 ? "Your NFT collection has been successfully minted on Filecoin." 
//                 : "Provide details for your NFT collection"}
//             </DialogDescription>
//           </DialogHeader>
          
//           {!mintSuccess ? (
//             <div className="space-y-4 py-4">
//               <div className="space-y-2">
//                 <label className="text-sm font-medium font-pixel text-xs">Collection Name</label>
//                 <Input 
//                   value={collectionName}
//                   onChange={(e) => setCollectionName(e.target.value)}
//                   placeholder="Enter collection name"
//                   className="bg-gray-800/80 border-gray-700 rounded-none pixel-corners"
//                   disabled={isMinting}
//                 />
//               </div>
              
//               <div className="space-y-2">
//                 <label className="text-sm font-medium font-pixel text-xs">Description</label>
//                 <Textarea
//                   value={collectionDescription}
//                   onChange={(e) => setCollectionDescription(e.target.value)}
//                   placeholder="Describe your collection..."
//                   className="h-24 bg-gray-800/80 border-gray-700 rounded-none pixel-corners"
//                   disabled={isMinting}
//                 />
//               </div>
              
//               <div className="grid grid-cols-4 gap-2">
//                 {selectedImages.map((img, i) => (
//                   <div key={i} className="aspect-square rounded-none pixel-corners overflow-hidden border border-gray-800">
//                     <img src={img} alt={`Selected ${i}`} className="w-full h-full object-cover pixelated" />
//                   </div>
//                 ))}
//               </div>
              
//               {error && (
//                 <div className="bg-red-900/20 border border-red-900/50 rounded-none pixel-corners p-3 flex items-start gap-2">
//                   <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
//                   <p className="text-sm text-red-500">{error}</p>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="py-6 flex flex-col items-center justify-center">
//               <div className="h-16 w-16 bg-pixel-green/20 rounded-full flex items-center justify-center mb-4">
//                 <Check className="h-8 w-8 text-pixel-green" />
//               </div>
              
//               <div className="text-center mb-4">
//                 <p className="text-white mb-2">Token ID:</p>
//                 <code className="bg-gray-800 px-3 py-1 rounded-sm text-sm">{tokenId}</code>
//               </div>
              
//               <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
//                 {selectedImages.slice(0, 4).map((img, i) => (
//                   <div key={i} className="aspect-square rounded-none pixel-corners overflow-hidden border border-gray-800">
//                     <img src={img} alt={`Minted ${i}`} className="w-full h-full object-cover pixelated" />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
          
//           <DialogFooter className="flex flex-col sm:flex-row gap-2">
//             {!mintSuccess ? (
//               <>
//                 <Button 
//                   variant="outline" 
//                   onClick={() => setShowMintDialog(false)}
//                   disabled={isMinting}
//                   className="w-full sm:w-auto bg-gray-800 border-gray-700 hover:bg-gray-700 rounded-none pixel-corners"
//                 >
//                   Cancel
//                 </Button>
//                 <Button 
//                   onClick={handleConfirmMint}
//                   disabled={isMinting || !collectionName.trim()}
//                   className="w-full sm:w-auto bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
//                 >
//                   {isMinting ? (
//                     <div className="flex items-center">
//                       {isUploading ? (
//                         <>
//                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                           <span className="font-pixel text-xs">UPLOADING TO IPFS...</span>
//                         </>
//                       ) : (
//                         <>
//                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                           <span className="font-pixel text-xs">MINTING NFT...</span>
//                         </>
//                       )}
//                     </div>
//                   ) : (
//                     <span className="font-pixel text-xs">CONFIRM & MINT</span>
//                   )}
//                 </Button>
//               </>
//             ) : (
//               <>
//                 <Button 
//                   onClick={viewCollection}
//                   className="w-full sm:w-auto gold-gradient hover:opacity-90 text-black font-pixel rounded-none pixel-corners pixel-btn"
//                 >
//                   <span className="font-pixel text-xs">VIEW COLLECTION</span>
//                 </Button>
//                 <Button 
//                   onClick={resetForm}
//                   className="w-full sm:w-auto bg-pixel-blue hover:bg-pixel-blue/80 font-pixel rounded-none pixel-corners pixel-btn"
//                 >
//                   <span className="font-pixel text-xs">CREATE NEW COLLECTION</span>
//                 </Button>
//               </>
//             )}
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )}

