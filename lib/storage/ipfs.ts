// lib/storage/ipfs.ts
/**
 * IPFS Storage Module
 * 
 * This module handles uploading data to IPFS using direct HTTP API calls
 * to public IPFS gateways with writable API endpoints.
 */

// List of public IPFS API endpoints (write-enabled)
const IPFS_API_ENDPOINTS = [
    'https://ipfs.infura.io:5001/api/v0',
    'https://api.pinata.cloud/pinning/pinFileToIPFS',
  ]
  
  // API keys for services that require them
  // In production, these would be environment variables
  const API_KEYS = {
    pinata: process.env.NEXT_PUBLIC_PINATA_API_KEY || '',
    pinataSecret: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '',
  }
  
  /**
   * Upload a file to IPFS using available gateways
   * @param file The file data to upload
   * @returns The IPFS CID of the uploaded content
   */
  export async function uploadFileToIPFS(file: File): Promise<string> {
    // Create a FormData object to send the file
    const formData = new FormData()
    formData.append('file', file)
    
    // Try Infura IPFS first
    try {
      const response = await fetch(`${IPFS_API_ENDPOINTS[0]}/add`, {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.Hash // Return the IPFS CID
      }
    } catch (error) {
      console.error('Failed to upload to Infura IPFS:', error)
      // Continue to next provider on failure
    }
    
    // Try Pinata as fallback
    try {
      const response = await fetch(IPFS_API_ENDPOINTS[1], {
        method: 'POST',
        headers: {
          'pinata_api_key': API_KEYS.pinata,
          'pinata_secret_api_key': API_KEYS.pinataSecret,
        },
        body: formData,
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.IpfsHash // Return the IPFS CID
      }
    } catch (error) {
      console.error('Failed to upload to Pinata:', error)
    }
    
    throw new Error('Failed to upload to IPFS: All providers failed')
  }
  
  /**
   * Upload JSON data to IPFS
   * @param jsonData The JSON data to upload
   * @returns The IPFS CID of the uploaded content
   */
  export async function uploadJSONToIPFS(jsonData: object): Promise<string> {
    // Convert JSON to a file
    const blob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' })
    const file = new File([blob], 'metadata.json', { type: 'application/json' })
    
    return uploadFileToIPFS(file)
  }
  
  /**
   * Upload an image from a data URL to IPFS
   * @param dataUrl The data URL string (e.g., from canvas.toDataURL())
   * @param fileName Optional filename
   * @returns The IPFS CID of the uploaded image
   */
  export async function uploadImageFromDataUrl(dataUrl: string, fileName = 'image.png'): Promise<string> {
    // Convert data URL to a File object
    const response = await fetch(dataUrl)
    const blob = await response.blob()
    const file = new File([blob], fileName, { type: blob.type })
    
    return uploadFileToIPFS(file)
  }
  
  /**
   * Get the HTTP URL for an IPFS CID
   * @param cid The IPFS CID
   * @returns A publicly accessible HTTP URL for the content
   */
  export function getIPFSGatewayURL(cid: string): string {
    // Use a reliable public gateway
    return `https://gateway.pinata.cloud/ipfs/${cid}`
  }
  
  /**
   * Generate metadata for an NFT
   * @param name NFT name
   * @param description NFT description
   * @param imageCid IPFS CID of the image
   * @param attributes Additional attributes
   * @returns The complete metadata object
   */
  export function generateNFTMetadata(
    name: string,
    description: string,
    imageCid: string,
    attributes: Array<{ trait_type: string; value: string | number }>
  ): object {
    return {
      name,
      description,
      image: `ipfs://${imageCid}`,
      external_url: getIPFSGatewayURL(imageCid),
      attributes,
      created_at: new Date().toISOString(),
    }
  }
  
  /**
   * Generate metadata for a bundle of NFTs
   * @param name Bundle name
   * @param description Bundle description
   * @param nftCids Array of CIDs for the NFTs in the bundle
   * @param previewImageCid IPFS CID for bundle preview image
   * @returns The complete bundle metadata object
   */
  export function generateBundleMetadata(
    name: string,
    description: string,
    nftCids: string[],
    previewImageCid: string
  ): object {
    return {
      name,
      description,
      image: `ipfs://${previewImageCid}`,
      external_url: getIPFSGatewayURL(previewImageCid),
      properties: {
        nfts: nftCids.map(cid => `ipfs://${cid}`),
        nft_count: nftCids.length,
      },
      created_at: new Date().toISOString(),
    }
  } 