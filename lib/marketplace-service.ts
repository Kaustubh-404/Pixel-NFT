// lib/marketplace-service.ts
import { Rarity } from './contracts/nft-contract'

/**
 * Service layer for interacting with the NFT marketplace
 */

export interface NFTListing {
  id: string
  tokenId: string | string[]
  price: string
  isBundle: boolean
  sellerAddress: string
  listedAt: string
  status: 'active' | 'sold' | 'cancelled'
  metadataUrl: string
  rarity: Rarity | Rarity[]
  name: string
  description: string
  imageCid: string
}

/**
 * List an NFT for sale on the marketplace
 * @param tokenId The ID of the NFT token or array of IDs for a bundle
 * @param price The price in tFIL
 * @param isBundle Whether this is a bundle of multiple NFTs
 * @param metadataUrl The IPFS metadata URL
 * @param sellerAddress The address of the seller
 * @returns The listing details
 */
export async function listNFTForSale(
  tokenId: string | string[],
  price: string,
  isBundle: boolean,
  metadataUrl: string,
  sellerAddress: string
): Promise<NFTListing> {
  try {
    const response = await fetch('/api/marketplace/list-nft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokenId,
        price,
        isBundle,
        sellerAddress,
        metadataUrl
      }),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to list NFT for sale:', error)
    throw error
  }
}

/**
 * Buy an NFT from the marketplace
 * @param listingId The ID of the marketplace listing
 * @param buyerAddress The address of the buyer
 * @param paymentHash Optional transaction hash for payment verification
 * @returns The purchase details
 */
export async function buyNFT(
  listingId: string,
  buyerAddress: string,
  paymentHash?: string
): Promise<{
  success: boolean
  purchaseId: string
  transactionHash: string
}> {
  try {
    const response = await fetch('/api/marketplace/buy-nft', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listingId,
        buyerAddress,
        paymentHash
      }),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to buy NFT:', error)
    throw error
  }
}

/**
 * Get marketplace listings with optional filters
 * @param filters Optional filters for the listings
 * @returns Array of marketplace listings
 */
export async function getMarketplaceListings(filters?: {
  seller?: string
  rarity?: Rarity
  bundle?: boolean
}): Promise<NFTListing[]> {
  try {
    // Build query parameters
    const params = new URLSearchParams()
    
    if (filters?.seller) {
      params.append('seller', filters.seller)
    }
    
    if (filters?.rarity !== undefined) {
      params.append('rarity', filters.rarity.toString())
    }
    
    if (filters?.bundle !== undefined) {
      params.append('bundle', filters.bundle.toString())
    }
    
    const queryString = params.toString() ? `?${params.toString()}` : ''
    
    const response = await fetch(`/api/marketplace/get-listings${queryString}`)

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const data = await response.json()
    return data.listings
  } catch (error) {
    console.error('Failed to get marketplace listings:', error)
    throw error
  }
}

/**
 * Get details for a specific NFT from its metadata URL
 * @param metadataUrl The IPFS metadata URL
 * @returns The NFT details
 */
export async function getNFTDetails(metadataUrl: string): Promise<{
  name: string
  description: string
  image: string
  attributes: Array<{ trait_type: string; value: string | number }>
}> {
  try {
    // If it's an IPFS URL, convert to a gateway URL for retrieval
    const gatewayUrl = metadataUrl.replace(
      'ipfs://', 
      'https://gateway.pinata.cloud/ipfs/'
    )
    
    const response = await fetch(gatewayUrl)

    if (!response.ok) {
      throw new Error(`Error fetching NFT metadata: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to get NFT details:', error)
    throw error
  }
}