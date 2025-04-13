// app/api/mint-nft/route.ts
import { NextResponse } from "next/server"
import { generateBundleMetadata, uploadJSONToIPFS } from "@/lib/storage/ipfs"
import { Rarity } from "@/lib/contracts/nft-contract"

export async function POST(request: Request) {
  try {
    const { 
      metadataUrls, // Array of IPFS URLs for each NFT metadata
      rarities, // Array of rarity values corresponding to each NFT
      bundleName, // Optional name for the bundle (if multiple NFTs)
      bundleDescription, // Optional description for the bundle
      bundlePreviewImageCid, // CID for a preview image of the bundle
      walletAddress // The user's wallet address
    } = await request.json()

    if (!metadataUrls || !Array.isArray(metadataUrls) || metadataUrls.length === 0) {
      return NextResponse.json({ error: "Metadata URLs array is required" }, { status: 400 })
    }

    if (!rarities || !Array.isArray(rarities) || rarities.length !== metadataUrls.length) {
      return NextResponse.json({ error: "Rarities array must match metadataUrls array" }, { status: 400 })
    }

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    // For minting multiple NFTs as a bundle
    if (metadataUrls.length > 1) {
      if (!bundlePreviewImageCid) {
        return NextResponse.json({ error: "Bundle preview image CID is required for multiple NFTs" }, { status: 400 })
      }

      // Create bundle metadata
      const bundleMetadata = generateBundleMetadata(
        bundleName || "Pixel Art NFT Bundle",
        bundleDescription || "A bundle of AI-generated pixel art NFTs on Filecoin",
        metadataUrls.map(url => url.replace('ipfs://', '')), // Extract CIDs
        bundlePreviewImageCid
      )

      // Upload the bundle metadata to IPFS
      const bundleMetadataCid = await uploadJSONToIPFS(bundleMetadata)
      
      // In a real implementation, this would interact with the Filecoin FVM
      // using the contract interface to mint the bundle
      // For this example, we'll mock the transaction data
      
      return NextResponse.json({
        success: true,
        bundleMetadataCid,
        bundleMetadataUrl: `ipfs://${bundleMetadataCid}`,
        tokenIds: Array(metadataUrls.length).fill(0).map((_, i) => "0x" + Math.random().toString(16).slice(2, 10)),
        transactionHash: "0x" + Math.random().toString(16).slice(2, 66),
      })
    } else {
      // For minting a single NFT
      const metadataUrl = metadataUrls[0]
      const rarity = rarities[0]
      
      // In a real implementation, this would interact with the Filecoin FVM
      // For now, return mock transaction data
      return NextResponse.json({
        success: true,
        tokenId: "0x" + Math.random().toString(16).slice(2, 10),
        transactionHash: "0x" + Math.random().toString(16).slice(2, 66),
        metadataUrl,
        rarity
      })
    }
  } catch (error) {
    console.error("Error minting NFT:", error)
    return NextResponse.json({ 
      error: "Failed to mint NFT", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}


// import { NextResponse } from "next/server"

// export async function POST(request: Request) {
//   try {
//     const { metadata } = await request.json()

//     if (!metadata) {
//       return NextResponse.json({ error: "Metadata is required" }, { status: 400 })
//     }

//     // In a real implementation, this would interact with the Filecoin FVM
//     // to mint an NFT using a smart contract
//     // For demo purposes, we'll just return a mock token ID
//     const mockTokenId = "0x" + Math.random().toString(16).slice(2, 10)

//     return NextResponse.json({
//       tokenId: mockTokenId,
//       transactionHash: "0x" + Math.random().toString(16).slice(2, 66),
//     })
//   } catch (error) {
//     console.error("Error minting NFT:", error)
//     return NextResponse.json({ error: "Failed to mint NFT" }, { status: 500 })
//   }
// }
