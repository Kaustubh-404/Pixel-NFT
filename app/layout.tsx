// app/layout.tsx
import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { WalletProvider } from "@/components/providers/wallet-provider"
import { Toaster } from "@/components/ui/toaster"
import { Press_Start_2P } from "next/font/google"
import { Inter } from "next/font/google"
import { cn } from "@/lib/utils"
import Layout from "@/components/layout"
import "@/app/globals.css"

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
})

export const metadata = {
  title: "PixelNFT - AI-Generated Pixel Art NFTs on Filecoin",
  description: "Create, mint, and trade pixel art NFTs using AI on the Filecoin network",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable, pixelFont.variable)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <WalletProvider>
            <Layout>
              {children}
            </Layout>
            <Toaster />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}