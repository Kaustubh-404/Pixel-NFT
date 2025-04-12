"use client"

import Link from "next/link"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useWallet } from "@/components/wallet-provider"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Wallet, LogOut, Copy, ExternalLink } from "lucide-react"
import { PixelIcon } from "@/components/pixel-icon"

export function ConnectWallet() {
  const [open, setOpen] = useState(false)
  const { address, isConnected, connect, disconnect } = useWallet()
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()

  const handleConnect = async () => {
    if (isConnected) {
      setOpen(true)
      return
    }

    setIsConnecting(true)
    try {
      await connect()
      toast({
        title: "Connected",
        description: "Your wallet has been connected successfully",
      })
      setOpen(false)
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect wallet",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setOpen(false)
    toast({
      title: "Disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  return (
    <>
      <Button
        onClick={handleConnect}
        className={
          isConnected
            ? "bg-pixel-green hover:bg-pixel-green/80 text-black rounded-none pixel-corners pixel-btn"
            : "bg-pixel-blue hover:bg-pixel-blue/80 text-white rounded-none pixel-corners pixel-btn"
        }
        disabled={isConnecting}
      >
        {isConnecting ? (
          <div className="pixel-loader mr-2 h-4 w-4"></div>
        ) : (
          <PixelIcon icon={Wallet} className="h-4 w-4 mr-2" />
        )}
        {isConnected ? (
          <span className="hidden md:inline font-pixel text-xs">{address}</span>
        ) : (
          <span className="font-pixel text-xs">CONNECT</span>
        )}
      </Button>

      <Dialog open={open && isConnected} onOpenChange={setOpen}>
        <DialogContent className="bg-gray-900/95 border-gray-800 text-white rounded-none pixel-corners">
          <DialogHeader>
            <DialogTitle className="font-pixel text-pixel-green">Wallet Connected</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gray-800/80 p-3 rounded-none pixel-corners">
              <p className="text-sm text-gray-400 mb-1 font-pixel text-xs">Address</p>
              <div className="flex items-center justify-between">
                <code className="text-sm">{address}</code>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={copyAddress} className="rounded-none">
                    <PixelIcon icon={Copy} className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" asChild className="rounded-none">
                    <a href={`https://filfox.info/en/address/${address}`} target="_blank" rel="noopener noreferrer">
                      <PixelIcon icon={ExternalLink} className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button asChild variant="outline" className="rounded-none pixel-corners">
                <Link href="/profile">
                  <span className="font-pixel text-xs">View Profile</span>
                </Link>
              </Button>
              <Button
                variant="destructive"
                onClick={handleDisconnect}
                className="flex items-center rounded-none pixel-corners"
              >
                <PixelIcon icon={LogOut} className="h-4 w-4 mr-2" />
                <span className="font-pixel text-xs">Disconnect</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
