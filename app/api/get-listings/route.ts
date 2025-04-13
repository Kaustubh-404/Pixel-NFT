// app/api/marketplace/get-listings/route.ts
import { NextResponse } from "next/server"
import { Rarity } from "@/lib/contracts/nft-contract"

// In a real implementation, this would fetch data from a database
// For now, we'll use mock data
const MOCK_LISTINGS = [
  {
    id: "list_1234a",
    tokenId: "0x1234abcd",
    price: "0.05",
    isBundle: false,
    sellerAddress: "0x1234...5678",
    listedAt: "2023-08-01T12:00:00Z",
    status: "active",
    metadataUrl: "ipfs://bafybeibnsoufr2renqzsh347nrx54wcubt5lgkeivez63xvivplfwhtpym",
    rarity: Rarity.S_TIER,
    name: "Golden Pixel Dragon",
    description: "A legendary pixel art dragon with golden scales",
    imageCid: "bafybeihprzyvilohv6zysyfhcnwh6rskw4aiuv5eykfgb2q2fo4l75kpi4"
  },
  {
    id: "list_5678b",
    tokenId: "0x5678efgh",
    price: "0.02",
    isBundle: false,
    sellerAddress: "0xabcd...efgh",
    listedAt: "2023-08-02T14:30:00Z",
    status: "active",
    metadataUrl: "ipfs://bafybeigbbh2hm2clvxewdzirggkw4zyvktfuavajqrugzwi2krwkh5p36y",
    rarity: Rarity.A_TIER,
    name: "Mystic Forest",
    description: "A vibrant pixel art forest with mystical elements",
    imageCid: "bafybeid7ivndpjikvxwvii6qrmzjoe2mejifred5oofnqzkvwhhlxe3aru"
  },
  {
    id: "list_9012c",
    tokenId: ["0xabcd1234", "0xefgh5678", "0xijkl9012"],
    price: "0.15",
    isBundle: true,
    sellerAddress: "0x5678...9012",
    listedAt: "2023-08-03T09:45:00Z",
    status: "active",
    metadataUrl: "ipfs://bafybeihdwdcefgh4567ujhtdr6jukirefgsdfewr67itysdfghjkiolsdr",
    rarity: [Rarity.A_TIER, Rarity.B_TIER, Rarity.S_TIER],
    name: "Pixel Adventure Bundle",
    description: "A collection of three unique pixel art adventure scenes",
    imageCid: "bafybeigx24r5ys7a3egftrh6hsfd89rhsdfgrghrtwuytrsdfghnjhuiolp"
  }
]

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url)
    const sellerAddress = url.searchParams.get('seller')
    const rarityFilter = url.searchParams.get('rarity')
    const isBundle = url.searchParams.get('bundle') === 'true'
    
    // Filter listings based on parameters
    let filteredListings = [...MOCK_LISTINGS]
    
    if (sellerAddress) {
      filteredListings = filteredListings.filter(listing => listing.sellerAddress === sellerAddress)
    }
    
    if (rarityFilter) {
      const rarityValue = parseInt(rarityFilter)
      filteredListings = filteredListings.filter(listing => {
        if (Array.isArray(listing.rarity)) {
          return listing.rarity.includes(rarityValue)
        }
        return listing.rarity === rarityValue
      })
    }
    
    if (isBundle !== undefined) {
      filteredListings = filteredListings.filter(listing => listing.isBundle === isBundle)
    }
    
    return NextResponse.json({
      success: true,
      listings: filteredListings,
      total: filteredListings.length
    })
  } catch (error) {
    console.error("Error fetching listings:", error)
    return NextResponse.json({ 
      error: "Failed to fetch listings", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}