// lib/api.ts
// This file contains service functions to interact with the API endpoints

/**
 * Generates prompts for NFT creation based on a theme
 * @param theme The theme for prompts generation
 */
export async function generatePrompts(theme: string): Promise<string[]> {
  try {
    const response = await fetch("/api/generate-prompts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ theme }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate prompts");
    }

    const data = await response.json();
    return data.prompts;
  } catch (error: any) {
    console.error("Error generating prompts:", error);
    throw error;
  }
}

/**
 * Generates images based on prompts
 * @param prompts List of text prompts to generate images
 * @param theme Optional theme name for directory organization
 */
export async function generateImages(prompts: string[], theme?: string): Promise<any[]> {
  try {
    const response = await fetch("/api/generate-images", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        prompts,
        theme: theme || "collection" 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate images");
    }

    const data = await response.json();
    return data.images || [];
  } catch (error: any) {
    console.error("Error generating images:", error);
    throw error;
  }
}

/**
 * Uploads a single image to IPFS
 * @param imageData Base64 encoded image data
 * @param fileName Optional file name
 */
export async function uploadToIPFS(imageData: string, fileName?: string): Promise<{
  success: boolean;
  cid: string;
  url: string;
}> {
  try {
    const response = await fetch("/api/upload-to-ipfs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageData,
        fileName: fileName || "nft-image.png",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to upload to IPFS");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error uploading to IPFS:", error);
    throw error;
  }
}

/**
 * Uploads multiple images to IPFS in batch
 * @param images Array of image data objects
 * @param generateMetadata Whether to generate metadata for each image
 */
export async function batchUploadToIPFS(
  images: Array<{ imageData: string; fileName: string }>,
  generateMetadata = false
): Promise<{
  success: boolean;
  results: Array<{
    fileName: string;
    success: boolean;
    cid?: string;
    url?: string;
    error?: string;
    metadata?: {
      cid?: string;
      url?: string;
      error?: string;
    };
  }>;
}> {
  try {
    const response = await fetch("/api/upload-to-ipfs", {
      method: "PUT", // Use PUT for batch uploads as defined in the API
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        images,
        generateMetadata,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to upload images to IPFS");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error batch uploading to IPFS:", error);
    throw error;
  }
}

/**
 * Uploads NFT metadata to IPFS
 * @param metadata JSON metadata for the NFT
 */
export async function uploadMetadataToIPFS(metadata: any): Promise<{
  success: boolean;
  cid: string;
  url: string;
}> {
  try {
    const response = await fetch("/api/upload-to-ipfs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isMetadata: true,
        metadata,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to upload metadata to IPFS");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error uploading metadata to IPFS:", error);
    throw error;
  }
}

/**
 * Mints a new NFT with the given metadata
 * @param metadata NFT metadata
 */
export async function mintNFT(metadata: any): Promise<{
  tokenId: string;
  transactionHash: string;
}> {
  try {
    const response = await fetch("/api/mint-nft", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ metadata }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to mint NFT");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error minting NFT:", error);
    throw error;
  }
}

// Fetch trending collections
export async function fetchTrendingCollections() {
  // This would be replaced with an actual API call
  // For now, returning mock data
  return [
    {
      id: "pixel-animals",
      name: "Pixel Animals",
      creator: "0x1234...5678",
      image: "/placeholder.svg?height=100&width=100",
      items: 100,
      floorPrice: "0.1 FIL",
    },
    {
      id: "golden-creatures",
      name: "Golden Creatures",
      creator: "0xabcd...efgh",
      image: "/placeholder.svg?height=100&width=100",
      items: 50,
      floorPrice: "0.2 FIL",
      isGold: true,
    },
    {
      id: "pixel-landscapes",
      name: "Pixel Landscapes",
      creator: "0x7890...1234",
      image: "/placeholder.svg?height=100&width=100",
      items: 60,
      floorPrice: "0.08 FIL",
    },
    {
      id: "retro-arcade",
      name: "Retro Arcade",
      creator: "0x2345...6789",
      image: "/placeholder.svg?height=100&width=100",
      items: 110,
      floorPrice: "0.18 FIL",
    },
  ]
}

// Function to fetch a specific collection
export async function fetchCollection(id: string) {
  // In a real app, make an API call
  const isGold = id.includes('gold') || id.includes('golden')
  
  return {
    id,
    name: id
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    creator: "0x1234...5678",
    description: `A collection of pixel art NFTs featuring ${id.replace(/-/g, " ")} minted on Filecoin`,
    isGold,
    items: Array(8)
      .fill(null)
      .map((_, i) => ({
        id: i,
        name: `${id
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")} #${i + 1}`,
        image: `/placeholder.svg?height=300&width=300`,
        price: (0.1 + i * 0.05).toFixed(2),
        isGold: isGold || i % 4 === 0, // Make some NFTs gold
      })),
  }
}

// Function to fetch user's NFTs
export async function fetchUserNFTs(address: string) {
  // In a real app, make an API call with the address parameter
  return Array(6)
    .fill(null)
    .map((_, i) => ({
      id: i,
      name: `My Pixel NFT #${i + 1}`,
      image: `/placeholder.svg?height=300&width=300`,
      collection: i % 2 === 0 ? "Pixel Animals" : "Golden Creatures",
      collectionId: i % 2 === 0 ? "pixel-animals" : "golden-creatures",
      acquired: new Date().toISOString(),
      status: i % 3 === 0 ? "listed" : "owned",
      isGold: i === 0 || i === 3, // Make some NFTs gold
    }))
}

// // lib/api.ts
// // This file handles API interactions for collections and NFTs

// // Function to fetch trending collections
// export async function fetchTrendingCollections() {
//   // This would be replaced with an actual API call
//   // For now, returning mock data
//   return [
//     {
//       id: "pixel-animals",
//       name: "Pixel Animals",
//       creator: "0x1234...5678",
//       image: "/placeholder.svg?height=100&width=100",
//       items: 100,
//       floorPrice: "0.1 FIL",
//     },
//     {
//       id: "golden-creatures",
//       name: "Golden Creatures",
//       creator: "0xabcd...efgh",
//       image: "/placeholder.svg?height=100&width=100",
//       items: 50,
//       floorPrice: "0.2 FIL",
//       isGold: true,
//     },
//     {
//       id: "pixel-landscapes",
//       name: "Pixel Landscapes",
//       creator: "0x7890...1234",
//       image: "/placeholder.svg?height=100&width=100",
//       items: 60,
//       floorPrice: "0.08 FIL",
//     },
//     {
//       id: "retro-arcade",
//       name: "Retro Arcade",
//       creator: "0x2345...6789",
//       image: "/placeholder.svg?height=100&width=100",
//       items: 110,
//       floorPrice: "0.18 FIL",
//     },
//     {
//       id: "pixel-heroes",
//       name: "Pixel Heroes",
//       creator: "0x8901...2345",
//       image: "/placeholder.svg?height=100&width=100",
//       items: 95,
//       floorPrice: "0.22 FIL",
//       isGold: true,
//     },
//     {
//       id: "8bit-cities",
//       name: "8-Bit Cities",
//       creator: "0x4567...8901",
//       image: "/placeholder.svg?height=100&width=100",
//       items: 70,
//       floorPrice: "0.15 FIL",
//     },
//   ]
// }

// // Function to fetch a specific collection
// export async function fetchCollection(id: string) {
//   // This would be replaced with an actual API call
//   // For now, returning mock data based on the ID
//   const isGold = id.includes('gold') || id.includes('golden')
  
//   return {
//     id,
//     name: id
//       .split("-")
//       .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(" "),
//     creator: "0x1234...5678",
//     description: `A collection of pixel art NFTs featuring ${id.replace(/-/g, " ")} minted on Filecoin`,
//     isGold,
//     items: Array(8)
//       .fill(null)
//       .map((_, i) => ({
//         id: i,
//         name: `${id
//           .split("-")
//           .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//           .join(" ")} #${i + 1}`,
//         image: `/placeholder.svg?height=300&width=300`,
//         price: (0.1 + i * 0.05).toFixed(2),
//         isGold: isGold || i % 4 === 0, // Make some NFTs gold
//       })),
//   }
// }

// // Function to fetch user's NFTs
// export async function fetchUserNFTs(address: string) {
//   // This would be replaced with an actual API call
//   // For now, returning mock data
//   return Array(6)
//     .fill(null)
//     .map((_, i) => ({
//       id: i,
//       name: `My Pixel NFT #${i + 1}`,
//       image: `/placeholder.svg?height=300&width=300`,
//       collection: i % 2 === 0 ? "Pixel Animals" : "Golden Creatures",
//       collectionId: i % 2 === 0 ? "pixel-animals" : "golden-creatures",
//       acquired: new Date().toISOString(),
//       status: i % 3 === 0 ? "listed" : "owned",
//       isGold: i === 0 || i === 3, // Make some NFTs gold
//     }))
// }

// // lib/lilypad.ts
// // This file handles interactions with the Lilypad API for AI model access

// // Function to generate prompts using Llama 3.1
// export async function generatePrompts(theme: string): Promise<string[]> {
//   try {
//     // Since we're mocking the API call, let's return some themed prompts
//     // In a real implementation, this would call the API endpoint
//     await new Promise(resolve => setTimeout(resolve, 1200)) // Simulate API delay
    
//     const basePrompts = [
//       "pixel-art, 8-bit style, low-res, vibrant colors",
//       "retro game style, pixelated, 16-bit era, detailed",
//       "pixel art, low-resolution, blocky, crisp edges",
//       "8-bit pixel character, vibrant palette, game sprite style"
//     ]
    
//     // Add the theme to each prompt
//     return basePrompts.map(prompt => 
//       `${theme}, ${prompt}${Math.random() > 0.75 ? ', gold accents, rare' : ''}`
//     )
//   } catch (error) {
//     console.error("Failed to generate prompts:", error)
//     throw error
//   }
// }

// // Function to generate images using Stable Diffusion XL
// export async function generateImages(prompts: string[]): Promise<string[]> {
//   try {
//     // In a real implementation, this would call the API endpoint
//     // For now, we'll just return placeholder images
//     await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API delay
    
//     return prompts.map((_, index) => 
//       `/placeholder.svg?height=${300 + index * 10}&width=${300 + index * 10}`
//     )
//   } catch (error) {
//     console.error("Failed to generate images:", error)
//     throw error
//   }
// }

// // Function to upload image to IPFS/Filecoin
// export async function uploadToIPFS(imageData: string): Promise<string> {
//   try {
//     // Simulate API delay
//     await new Promise(resolve => setTimeout(resolve, 1500))
    
//     // Return a mock CID
//     return "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
//   } catch (error) {
//     console.error("Failed to upload to IPFS:", error)
//     throw error
//   }
// }

// // Function to mint NFT on Filecoin
// export async function mintNFT(metadata: any): Promise<string> {
//   try {
//     // Simulate API delay
//     await new Promise(resolve => setTimeout(resolve, 2000))
    
//     // Return a mock token ID
//     return "0x" + Math.random().toString(16).slice(2, 10)
//   } catch (error) {
//     console.error("Failed to mint NFT:", error)
//     throw error
//   }
// }