"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"

interface WalletContextType {
  address: string | null
  connect: () => Promise<void>
  disconnect: () => void
  isConnected: boolean
  balance: string | null
  signMessage: (message: string) => Promise<string>
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  connect: async () => {},
  disconnect: () => {},
  isConnected: false,
  balance: null,
  signMessage: async () => "",
})

export const useWallet = () => useContext(WalletContext)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [balance, setBalance] = useState<string | null>(null)
  const { toast } = useToast()

  // Check if wallet was previously connected
  useEffect(() => {
    const savedAddress = localStorage.getItem("walletAddress")
    if (savedAddress) {
      setAddress(savedAddress)
      setIsConnected(true)
      setBalance("1.25 FIL") // Mock balance
    }
  }, [])

  const connect = async () => {
    try {
      // This would be replaced with actual wallet connection logic
      // For example, using ethers.js or web3.js to connect to MetaMask
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate connection delay

      const mockAddress =
        "0x" + Math.random().toString(16).slice(2, 10) + "..." + Math.random().toString(16).slice(2, 6)
      const mockBalance = (Math.random() * 5).toFixed(2) + " FIL"

      setAddress(mockAddress)
      setBalance(mockBalance)
      setIsConnected(true)
      localStorage.setItem("walletAddress", mockAddress)

      return mockAddress
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      throw error
    }
  }

  const disconnect = () => {
    setAddress(null)
    setBalance(null)
    setIsConnected(false)
    localStorage.removeItem("walletAddress")
  }

  const signMessage = async (message: string): Promise<string> => {
    if (!isConnected) {
      toast({
        title: "Error",
        description: "Wallet not connected",
        variant: "destructive",
      })
      throw new Error("Wallet not connected")
    }

    // Simulate signing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock signature
    const mockSignature =
      "0x" +
      Array(130)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")

    return mockSignature
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        connect,
        disconnect,
        isConnected,
        balance,
        signMessage,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
