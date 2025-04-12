"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Compass, Wallet, User, Settings, PlusCircle } from "lucide-react"
import { PixelIcon } from "@/components/pixel-icon"

export function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Explore", href: "/explore", icon: Compass },
    { name: "My NFTs", href: "/my-nfts", icon: Wallet },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <div className="w-16 md:w-64 h-screen bg-gray-900/95 border-r border-gray-800 flex flex-col fixed z-50 pixel-corners">
      <div className="p-4 border-b border-gray-800 flex items-center justify-center md:justify-start">
        <div className="font-pixel text-xl text-transparent bg-clip-text bg-gradient-to-r from-pixel-green to-pixel-blue hidden md:block">
          PixelNFT
        </div>
        <div className="md:hidden text-pixel-green font-bold text-xl font-pixel">PX</div>
      </div>

      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link href={item.href}>
                <div
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 text-sm transition-colors pixel-corners",
                    pathname === item.href
                      ? "bg-gray-800 text-pixel-green pixel-glow"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50",
                  )}
                >
                  <PixelIcon icon={item.icon} className="h-5 w-5" />
                  <span className="hidden md:inline font-pixel text-xs">{item.name}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Link href="/create">
          <div className="flex items-center justify-center md:justify-start space-x-2 px-3 py-2 bg-pixel-green hover:bg-pixel-green/80 text-black rounded-none pixel-corners transition-colors pixel-btn">
            <PlusCircle className="h-5 w-5" />
            <span className="font-pixel text-xs hidden md:inline">CREATE NFT</span>
          </div>
        </Link>
      </div>
    </div>
  )
}
