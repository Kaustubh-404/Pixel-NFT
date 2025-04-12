"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function HowItWorks() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="text-pixel-green hover:text-pixel-green/80 font-pixel mx-auto block my-8 text-xs"
        >
          [how it works]
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gray-900/95 border-gray-800 text-white rounded-none pixel-corners scanlines">
        <div className="space-y-6 py-4">
          <h2 className="text-xl font-pixel text-center text-pixel-green">how it works</h2>

          <p className="text-sm text-center">
            PixelNFT allows anyone to create NFTs using AI. All NFTs created on PixelNFT are fair-launch, meaning
            everyone has equal access to buy and sell when the collection is first created.
          </p>

          <div className="space-y-4">
            <div className="space-y-1 bg-gray-800/50 p-3 pixel-corners">
              <p className="text-sm font-pixel text-pixel-green">step 1:</p>
              <p className="text-sm text-gray-300">enter a theme for your pixel art NFT collection</p>
            </div>

            <div className="space-y-1 bg-gray-800/50 p-3 pixel-corners">
              <p className="text-sm font-pixel text-pixel-blue">step 2:</p>
              <p className="text-sm text-gray-300">generate and select your favorite AI-created pixel art</p>
            </div>

            <div className="space-y-1 bg-gray-800/50 p-3 pixel-corners">
              <p className="text-sm font-pixel text-gold-400">step 3:</p>
              <p className="text-sm text-gray-300">mint your collection to the Filecoin blockchain</p>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            by using this platform you agree to the terms and conditions and certify that you are over 18
          </p>

          <Button
            onClick={() => setOpen(false)}
            className="w-full bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
          >
            I&apos;m ready to create
          </Button>

          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <a href="#" className="hover:text-gray-300 font-pixel text-[10px]">
              privacy policy
            </a>
            <a href="#" className="hover:text-gray-300 font-pixel text-[10px]">
              terms of service
            </a>
            <a href="#" className="hover:text-gray-300 font-pixel text-[10px]">
              fees
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
