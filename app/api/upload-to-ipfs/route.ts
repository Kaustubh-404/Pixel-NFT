// app/api/upload-to-ipfs/route.ts
import { NextResponse } from "next/server"
import { uploadImageFromDataUrl, uploadJSONToIPFS, generateNFTMetadata } from "@/lib/storage/ipfs"
import { Rarity } from "@/lib/contracts/nft-contract"
import { getRarityLabel } from "@/lib/nft/rarity-analyzer"

export async function POST(request: Request) {
  try {
    const { imageData, metadata, rarity = 0 } = await request.json()

    if (!imageData) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 })
    }

    // Upload the image to IPFS
    const imageCid = await uploadImageFromDataUrl(imageData)
    console.log(`Uploaded image to IPFS with CID: ${imageCid}`)

    // Create NFT metadata with the image CID
    const nftMetadata = generateNFTMetadata(
      metadata?.name || "Pixel Art NFT",
      metadata?.description || "A unique AI-generated pixel art NFT on Filecoin",
      imageCid,
      [
        {
          trait_type: "Rarity",
          value: getRarityLabel(rarity as Rarity)
        },
        {
          trait_type: "Art Style",
          value: "Pixel Art"
        },
        {
          trait_type: "Generation",
          value: "AI Generated"
        },
        ...(metadata?.attributes || [])
      ]
    )

    // Upload the metadata to IPFS
    const metadataCid = await uploadJSONToIPFS(nftMetadata)
    console.log(`Uploaded metadata to IPFS with CID: ${metadataCid}`)

    return NextResponse.json({
      success: true,
      imageCid,
      metadataCid,
      imageUrl: `ipfs://${imageCid}`,
      metadataUrl: `ipfs://${metadataCid}`,
    })
  } catch (error) {
    console.error("Error uploading to IPFS:", error)
    return NextResponse.json({ 
      error: "Failed to upload to IPFS", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}

// import { NextResponse } from "next/server"

// export async function POST(request: Request) {
//   try {
//     const { imageData } = await request.json()

//     if (!imageData) {
//       return NextResponse.json({ error: "Image data is required" }, { status: 400 })
//     }

//     // In a real implementation, this would upload to IPFS/Filecoin
//     // For demo purposes, we'll just return a mock CID
//     const mockCid = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"

//     return NextResponse.json({
//       cid: mockCid,
//       url: `ipfs://${mockCid}`,
//     })
//   } catch (error) {
//     console.error("Error uploading to IPFS:", error)
//     return NextResponse.json({ error: "Failed to upload to IPFS" }, { status: 500 })
//   }
// }
