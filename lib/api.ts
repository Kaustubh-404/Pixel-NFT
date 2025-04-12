// This file handles API interactions for collections and NFTs

// Function to fetch trending collections
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
    },
    // More collections...
  ]
}

// Function to fetch a specific collection
export async function fetchCollection(id: string) {
  // This would be replaced with an actual API call
  // For now, returning mock data based on the ID
  return {
    id,
    name: id
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    creator: "0x1234...5678",
    description: `A collection of pixel art NFTs featuring ${id.replace(/-/g, " ")} minted on Filecoin`,
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
      })),
  }
}

// Function to fetch user's NFTs
export async function fetchUserNFTs(address: string) {
  // This would be replaced with an actual API call
  // For now, returning mock data
  return Array(4)
    .fill(null)
    .map((_, i) => ({
      id: i,
      name: `My Pixel NFT #${i + 1}`,
      image: `/placeholder.svg?height=300&width=300`,
      collection: "My Collection",
      acquired: new Date().toISOString(),
    }))
}
