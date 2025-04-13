// lib/nft-service.ts
import { Rarity } from './contracts/nft-contract'

/**
 * Service layer for interacting with NFT-related APIs
 */

/**
 * Generate prompts for NFT creation based on a theme
 * @param theme The user's input theme
 * @param count Number of prompts to generate
 * @returns Array of generated prompts
 */
export async function generatePrompts(theme: string, count: number = 1): Promise<string[]> {
  try {
    const response = await fetch('/api/generate-prompts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ theme, count }),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const data = await response.json()
    return data.prompts
  } catch (error) {
    console.error('Failed to generate prompts:', error)
    throw error
  }
}

/**
 * Generate images from prompts
 * @param prompts Array of text prompts
 * @returns Generated images with their rarities
 */
export async function generateImages(prompts: string[]): Promise<{
  images: string[]
  rarities: Rarity[]
  prompts: string[]
}> {
  try {
    const response = await fetch('/api/generate-images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompts }),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const data = await response.json()
    return {
      images: data.images,
      rarities: data.rarities,
      prompts: data.prompts,
    }
  } catch (error) {
    console.error('Failed to generate images:', error)
    throw error
  }
}

/**
 * Upload an image and metadata to IPFS
 * @param imageData Base64 encoded image data
 * @param metadata Additional metadata for the NFT
 * @returns IPFS CIDs and URLs
 */
export async function uploadToIPFS(
  imageData: string,
  metadata: {
    name: string
    description: string
    rarity: Rarity
    attributes?: Array<{ trait_type: string; value: string | number }>
  }
): Promise<{
  imageCid: string
  metadataCid: string
  imageUrl: string
  metadataUrl: string
}> {
  try {
    const response = await fetch('/api/upload-to-ipfs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData,
        metadata: {
          name: metadata.name,
          description: metadata.description,
          attributes: metadata.attributes || [],
        },
        rarity: metadata.rarity,
      }),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to upload to IPFS:', error)
    throw error
  }
}

/**
 * Mint NFTs on the blockchain
 * @param mintData Data for minting NFTs
 * @returns Transaction information and token IDs
 */
export async function mintNFT(mintData: {
  metadataUrls: string[]
  rarities: Rarity[]
  bundleName?: string
  bundleDescription?: string
  bundlePreviewImageCid?: string
  walletAddress?: string
}): Promise<{
  success: boolean
  tokenId: string | string[]
  transactionHash: string
  metadataUrl?: string
  bundleMetadataUrl?: string
}> {
  try {
    const response = await fetch('/api/mint-nft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mintData),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to mint NFT:', error)
    throw error
  }
}