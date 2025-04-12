"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ChevronRight, Zap, ShieldCheck, ArrowRight, Github } from "lucide-react"

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header with gradient border on scroll */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-gray-950/80 backdrop-blur-lg border-b border-gray-800" : ""
      }`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="font-pixel text-xl text-transparent bg-clip-text bg-gradient-to-r from-pixel-green to-pixel-blue">
              PixelNFT
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-300 hover:text-white transition-colors">How it works</a>
            <a href="#examples" className="text-sm text-gray-300 hover:text-white transition-colors">Examples</a>
            <Link href="/explore" className="text-sm text-gray-300 hover:text-white transition-colors">
              Explore
            </Link>
          </div>
          <Link href="/create">
            <Button variant="outline" className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn">
              <span className="font-pixel text-xs">LAUNCH DAPP</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero section with moving gradient */}
      <div className="relative overflow-hidden pt-20">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(46, 213, 115, 0.15), transparent 40%)`,
          }}
        />
        
        <div className="container mx-auto px-4 pt-24 pb-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="font-pixel text-4xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pixel-green to-pixel-blue">
              Create & Trade Pixel Art NFTs with AI
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Generate unique pixel art NFTs using AI and mint them on Filecoin with just a few clicks.
              No coding required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create">
                <Button className="w-full sm:w-auto bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn h-12 px-8">
                  <span className="font-pixel text-sm">START CREATING</span>
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button variant="outline" className="w-full sm:w-auto bg-gray-900/50 border-gray-700 hover:bg-gray-800 text-white font-pixel rounded-none pixel-corners h-12 px-8">
                  <span className="font-pixel text-sm">EXPLORE NFTS</span>
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Pixel dots background */}
        <div className="absolute inset-0 z-[-1] opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(46, 213, 115, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(46, 213, 115, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        {/* Floating showcase image */}
        <div className="relative max-w-5xl mx-auto -mt-8 px-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative z-10 border-2 border-gray-800 pixel-corners overflow-hidden shadow-xl shadow-pixel-green/10"
          >
            <div className="aspect-[16/9] relative overflow-hidden bg-gray-900">
              <img
                src="/placeholder.svg?height=720&width=1280" 
                alt="PixelNFT Platform Preview"
                className="w-full h-full object-cover pixelated"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent opacity-80"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                <p className="text-sm font-pixel text-white">Create, mint, and trade pixel art NFTs on Filecoin</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features section */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-pixel text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pixel-green to-pixel-blue">
              Platform Features
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Everything you need to create, mint, and trade unique pixel art NFTs powered by AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <div className="h-12 w-12 bg-pixel-green/20 rounded-none pixel-corners flex items-center justify-center text-pixel-green">
                  <Zap className="h-6 w-6" />
                </div>,
                title: "AI-Generated Pixel Art",
                description: "Create unique pixel art with our integrated AI model. Just enter a theme or idea, and our system generates custom pixel art."
              },
              {
                icon: <div className="h-12 w-12 bg-pixel-blue/20 rounded-none pixel-corners flex items-center justify-center text-pixel-blue">
                  <ShieldCheck className="h-6 w-6" />
                </div>,
                title: "Filecoin Blockchain",
                description: "Mint and store your NFTs on Filecoin's decentralized network, ensuring your digital assets are secure and permanent."
              },
              {
                icon: <div className="h-12 w-12 bg-gold/20 rounded-none pixel-corners flex items-center justify-center text-gold">
                  <div className="pixel-loader h-6 w-6"></div>
                </div>,
                title: "Gold Rarity System",
                description: "Special NFTs feature gold accents and themes, creating a natural rarity system within collections to add value."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-gray-900/50 border border-gray-800 p-6 rounded-none pixel-corners"
              >
                {feature.icon}
                <h3 className="font-pixel text-lg mt-4 mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 bg-gray-900/30 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-pixel text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pixel-green to-pixel-blue">
              How It Works
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Create your first pixel art NFT in minutes with just a few simple steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {[
              {
                number: "01",
                title: "Enter Your Theme",
                description: "Provide a theme or concept for your pixel art collection. Be as specific or creative as you want."
              },
              {
                number: "02",
                title: "Generate Pixel Art with AI",
                description: "Our AI model, powered by Lilypad and Stable Diffusion XL, creates multiple unique pixel art pieces based on your theme."
              },
              {
                number: "03",
                title: "Select Your Favorites",
                description: "Choose the pixel art images you like best. Rare gold-themed images are occasionally generated for added value."
              },
              {
                number: "04",
                title: "Mint on Filecoin",
                description: "With one click, mint your selections as NFTs on the Filecoin blockchain, creating a permanent collection."
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex mb-8 relative"
              >
                <div className="mt-1 mr-6">
                  <div className="h-10 w-10 bg-pixel-green/20 text-pixel-green font-pixel flex items-center justify-center rounded-none pixel-corners">
                    {step.number}
                  </div>
                  {index < 3 && (
                    <div className="h-full w-px bg-gray-800 absolute left-5 top-12"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-pixel text-lg mb-2 text-white">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              </motion.div>
            ))}

            <div className="text-center mt-12">
              <Link href="/create">
                <Button className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn h-12 px-8">
                  <span className="font-pixel text-sm">CREATE YOUR FIRST NFT</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Example collections */}
      <section id="examples" className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-pixel text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pixel-green to-pixel-blue">
              Featured Collections
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Check out some of the popular pixel art NFT collections created on our platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                id: "pixel-monsters",
                name: "Pixel Monsters",
                creator: "0x5678...9012",
                image: "/placeholder.svg?height=300&width=300",
                items: 85,
                floorPrice: "0.12 FIL",
              },
              {
                id: "crypto-punks-pixel",
                name: "Crypto Punks Pixel",
                creator: "0x3456...7890",
                image: "/placeholder.svg?height=300&width=300",
                items: 150,
                floorPrice: "0.3 FIL",
                isGold: true,
              },
              {
                id: "pixel-landscapes",
                name: "Pixel Landscapes",
                creator: "0x7890...1234",
                image: "/placeholder.svg?height=300&width=300",
                items: 60,
                floorPrice: "0.08 FIL",
              },
            ].map((collection, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className={`bg-gray-900/80 border border-gray-800 rounded-none overflow-hidden hover:border-pixel-green transition-colors pixel-corners relative ${collection.isGold ? "gold-gradient" : ""}`}
              >
                <div className={`relative aspect-square ${collection.isGold ? "bg-black/50" : ""}`}>
                  <img src={collection.image} alt={collection.name} className="object-cover w-full h-full pixelated" />
                </div>
                <div className="p-4">
                  <h3 className="font-pixel text-xs text-white mb-1">{collection.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">by {collection.creator}</p>
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="text-gray-400 font-pixel text-[10px]">Items</p>
                      <p className="font-medium">{collection.items}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-pixel text-[10px]">Floor</p>
                      <p className={collection.isGold ? "text-gold-400 font-medium" : "text-pixel-green font-medium"}>
                        {collection.floorPrice}
                      </p>
                    </div>
                  </div>
                </div>
                <Link href={`/collection/${collection.id}`} className="absolute inset-0">
                  <span className="sr-only">View collection</span>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/explore">
              <Button variant="outline" className="bg-gray-900/50 border-gray-700 hover:bg-gray-800 text-white font-pixel rounded-none pixel-corners h-12 px-8">
                <span className="font-pixel text-sm">EXPLORE ALL COLLECTIONS</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <div className="font-pixel text-xl text-transparent bg-clip-text bg-gradient-to-r from-pixel-green to-pixel-blue">
                PixelNFT
              </div>
              <p className="text-sm text-gray-400 mt-2">Creating pixel art NFTs on Filecoin, powered by AI</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div>
                <h4 className="font-pixel text-sm mb-3">Platform</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/create" className="text-gray-400 hover:text-white transition-colors">Create</Link></li>
                  <li><Link href="/explore" className="text-gray-400 hover:text-white transition-colors">Explore</Link></li>
                  <li><Link href="/profile" className="text-gray-400 hover:text-white transition-colors">My NFTs</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-pixel text-sm mb-3">Resources</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Filecoin</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Lilypad</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-pixel text-sm mb-3">Connect</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="https://github.com" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                      <Github className="h-4 w-4" /> GitHub
                    </a>
                  </li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Discord</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-6 text-center">
            <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} PixelNFT. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}