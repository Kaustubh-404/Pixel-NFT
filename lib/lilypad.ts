// This file handles interactions with the Lilypad API for AI model access

// Function to generate prompts using Llama 3.1
export async function generatePrompts(theme: string): Promise<string[]> {
  try {
    const response = await fetch("/api/generate-prompts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ theme }),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const data = await response.json()
    return data.prompts
  } catch (error) {
    console.error("Failed to generate prompts:", error)
    throw error
  }
}

// Function to generate images using Stable Diffusion XL
export async function generateImages(prompts: string[]): Promise<string[]> {
  try {
    const response = await fetch("/api/generate-images", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompts }),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const data = await response.json()
    return data.images
  } catch (error) {
    console.error("Failed to generate images:", error)
    throw error
  }
}

// Function to upload image to IPFS/Filecoin
export async function uploadToIPFS(imageData: string): Promise<string> {
  try {
    const response = await fetch("/api/upload-to-ipfs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageData }),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const data = await response.json()
    return data.cid
  } catch (error) {
    console.error("Failed to upload to IPFS:", error)
    throw error
  }
}

// Function to mint NFT on Filecoin
export async function mintNFT(metadata: any): Promise<string> {
  try {
    const response = await fetch("/api/mint-nft", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ metadata }),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const data = await response.json()
    return data.tokenId
  } catch (error) {
    console.error("Failed to mint NFT:", error)
    throw error
  }
}
