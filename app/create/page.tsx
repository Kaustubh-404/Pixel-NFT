"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Sidebar } from "@/components/sidebar"
import { NFTPreview } from "@/components/nft-preview"
import { generatePrompts, generateImages } from "@/lib/lilypad"
import { useToast } from "@/components/ui/use-toast"
import { RefreshCw } from "lucide-react"
import { PixelHeading } from "@/components/pixel-heading"
import { PixelIcon } from "@/components/pixel-icon"
import { PixelatedBackground } from "@/components/pixelated-background"

export default function CreatePage() {
  const [theme, setTheme] = useState("")
  const [prompts, setPrompts] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false)
  const [isGeneratingImages, setIsGeneratingImages] = useState(false)
  const { toast } = useToast()

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
    if (selectedImages.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one image to mint",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Minting in progress",
      description: "Your NFT collection is being minted...",
    })

    // This would connect to your smart contract logic
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Your NFT collection has been minted!",
      })
    }, 2000)
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      <Sidebar />
      <main className="flex-1 p-6 relative">
        <PixelatedBackground />

        <PixelHeading
          text="Create Pixel NFT Collection"
          className="text-2xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pixel-green to-pixel-blue"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-6">
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
              <div className="space-y-2">
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
              </div>
            )}

            {selectedImages.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-gray-800">
                <label className="text-sm font-medium font-pixel text-xs">
                  Selected Images ({selectedImages.length})
                </label>
                <Button
                  onClick={handleMintCollection}
                  className="w-full gold-gradient hover:opacity-90 text-black font-pixel rounded-none pixel-corners pixel-btn"
                >
                  <span className="font-pixel text-xs">MINT NFT COLLECTION</span>
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-pixel text-xs">Preview</h2>
            {images.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {images.map((imageUrl, index) => (
                  <NFTPreview
                    key={index}
                    imageUrl={imageUrl}
                    isSelected={selectedImages.includes(imageUrl)}
                    onClick={() => toggleImageSelection(imageUrl)}
                    isGold={index === 0} // Make the first one gold for demo
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
          </div>
        </div>
      </main>
    </div>
  )
}
