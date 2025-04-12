"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { NFTPreview } from "@/components/nft-preview"
import { generatePrompts, generateImages, uploadToIPFS, mintNFT } from "@/lib/lilypad"
import { useToast } from "@/components/ui/use-toast"
import { RefreshCw, Check } from "lucide-react"
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

export default function CreatePage() {
  const [theme, setTheme] = useState("")
  const [prompts, setPrompts] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false)
  const [isGeneratingImages, setIsGeneratingImages] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [showMintDialog, setShowMintDialog] = useState(false)
  const [collectionName, setCollectionName] = useState("")
  const [collectionDescription, setCollectionDescription] = useState("")
  const [mintSuccess, setMintSuccess] = useState(false)
  const [tokenId, setTokenId] = useState("")
  
  const { toast } = useToast()
  const { isConnected, connect } = useWallet()

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
      const generatedPrompts = await generatePrompts(theme)
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
      const generatedImages = await generateImages(prompts)
      setImages(generatedImages)
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
        await connect()
      } catch (error) {
        toast({
          title: "Connection failed",
          description: "Please connect your wallet to mint NFTs",
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
      // Step 1: Upload images to IPFS (in a real app)
      // Here we're just simulating with a delay
      await uploadToIPFS("imagedata")
      
      // Step 2: Create metadata
      const metadata = {
        name: collectionName,
        description: collectionDescription,
        images: selectedImages,
        creator: "currentUserAddress", // In a real app, this would be the connected wallet
        createdAt: new Date().toISOString(),
      }
      
      // Step 3: Mint the NFT collection
      const newTokenId = await mintNFT(metadata)
      
      // Step 4: Show success state
      setTokenId(newTokenId)
      setMintSuccess(true)
      
      toast({
        title: "Success!",
        description: "Your NFT collection has been minted successfully!",
      })
    } catch (error) {
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
    setSelectedImages([])
    setCollectionName("")
    setCollectionDescription("")
    setMintSuccess(false)
    setTokenId("")
    setShowMintDialog(false)
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
                disabled={isGeneratingImages}
                className="w-full bg-pixel-blue hover:bg-pixel-blue/80 font-pixel rounded-none pixel-corners pixel-btn"
              >
                {isGeneratingImages ? (
                  <>
                    <div className="pixel-loader mr-2 h-4 w-4"></div>
                    <span className="font-pixel text-xs">GENERATING...</span>
                  </>
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
              <Button
                onClick={handleMintCollection}
                className="w-full gold-gradient hover:opacity-90 text-black font-pixel rounded-none pixel-corners pixel-btn"
              >
                <span className="font-pixel text-xs">MINT NFT COLLECTION</span>
              </Button>
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
              {images.map((imageUrl, index) => (
                <NFTPreview
                  key={index}
                  imageUrl={imageUrl}
                  isSelected={selectedImages.includes(imageUrl)}
                  onClick={() => toggleImageSelection(imageUrl)}
                  isGold={index === 0 || prompts[index].includes('gold')} // Make some gold based on prompts
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
                ? "Your NFT collection has been successfully minted on Filecoin." 
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
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium font-pixel text-xs">Description</label>
                <Textarea
                  value={collectionDescription}
                  onChange={(e) => setCollectionDescription(e.target.value)}
                  placeholder="Describe your collection..."
                  className="h-24 bg-gray-800/80 border-gray-700 rounded-none pixel-corners"
                />
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {selectedImages.map((img, i) => (
                  <div key={i} className="aspect-square rounded-none pixel-corners overflow-hidden border border-gray-800">
                    <img src={img} alt={`Selected ${i}`} className="w-full h-full object-cover pixelated" />
                  </div>
                ))}
              </div>
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
              
              <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                {selectedImages.slice(0, 4).map((img, i) => (
                  <div key={i} className="aspect-square rounded-none pixel-corners overflow-hidden border border-gray-800">
                    <img src={img} alt={`Minted ${i}`} className="w-full h-full object-cover pixelated" />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {!mintSuccess ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setShowMintDialog(false)}
                  className="w-full sm:w-auto bg-gray-800 border-gray-700 hover:bg-gray-700 rounded-none pixel-corners"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmMint}
                  disabled={isMinting}
                  className="w-full sm:w-auto bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
                >
                  {isMinting ? (
                    <>
                      <div className="pixel-loader mr-2 h-4 w-4"></div>
                      <span className="font-pixel text-xs">MINTING...</span>
                    </>
                  ) : (
                    <span className="font-pixel text-xs">CONFIRM & MINT</span>
                  )}
                </Button>
              </>
            ) : (
              <Button 
                onClick={resetForm}
                className="w-full bg-pixel-blue hover:bg-pixel-blue/80 font-pixel rounded-none pixel-corners pixel-btn"
              >
                <span className="font-pixel text-xs">CREATE NEW COLLECTION</span>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}