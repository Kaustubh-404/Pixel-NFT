// lib/nft/rarity-analyzer.ts
import { Rarity } from '../contracts/nft-contract'

/**
 * Analyzes generated prompts and images to determine NFT rarity
 */

// Keywords that indicate higher rarity
const S_TIER_KEYWORDS = [
  'gold', 'golden', 'rare', 'legendary', 'unique', 'special',
  'exclusive', 'epic', 'mythic', 'limited', 'holographic'
]

const A_TIER_KEYWORDS = [
  'silver', 'glowing', 'animated', 'shiny', 'metallic',
  'vibrant', 'mystical', 'premium', 'fantasy', 'enhanced'
]

/**
 * Analyzes a prompt to determine the rarity tier
 * @param prompt The prompt text used to generate the image
 * @returns The determined rarity tier
 */
export function analyzePromptForRarity(prompt: string): Rarity {
  const promptLower = prompt.toLowerCase()
  
  // First check for S-tier keywords
  if (S_TIER_KEYWORDS.some(keyword => promptLower.includes(keyword))) {
    return Rarity.S_TIER
  }
  
  // Then check for A-tier keywords
  if (A_TIER_KEYWORDS.some(keyword => promptLower.includes(keyword))) {
    return Rarity.A_TIER
  }
  
  // Default to B-tier
  return Rarity.B_TIER
}

/**
 * Creates an even distribution of rarities across generated NFTs
 * For bundles with multiple NFTs, this ensures a good mix
 * @param count Number of NFTs to generate rarities for
 * @returns Array of rarities with a distribution favoring lower tiers
 */
export function generateRarityDistribution(count: number): Rarity[] {
  const rarities: Rarity[] = []
  
  // S-tier: ~10% chance
  // A-tier: ~30% chance
  // B-tier: ~60% chance
  for (let i = 0; i < count; i++) {
    const randomValue = Math.random()
    
    if (randomValue <= 0.1) {
      rarities.push(Rarity.S_TIER)
    } else if (randomValue <= 0.4) {
      rarities.push(Rarity.A_TIER)
    } else {
      rarities.push(Rarity.B_TIER)
    }
  }
  
  // Ensure at least one higher rarity for bundles of 4+
  if (count >= 4 && !rarities.includes(Rarity.S_TIER) && !rarities.includes(Rarity.A_TIER)) {
    // Replace a random B-tier with an A-tier
    const indexToReplace = Math.floor(Math.random() * count)
    rarities[indexToReplace] = Rarity.A_TIER
  }
  
  return rarities
}

/**
 * Utility function to determine final rarity from multiple factors
 * @param prompt The generation prompt
 * @param suggestedRarity Optional pre-determined rarity
 * @returns The final rarity determination
 */
export function determineRarity(prompt: string, suggestedRarity?: Rarity): Rarity {
  const promptRarity = analyzePromptForRarity(prompt)
  
  // If a suggested rarity was provided, use the higher of the two
  if (suggestedRarity !== undefined) {
    return Math.max(promptRarity, suggestedRarity)
  }
  
  return promptRarity
}

/**
 * Get rarity label for display
 * @param rarity Rarity tier
 * @returns Human-readable label
 */
export function getRarityLabel(rarity: Rarity): string {
  switch (rarity) {
    case Rarity.S_TIER:
      return 'S-Tier'
    case Rarity.A_TIER:
      return 'A-Tier'
    case Rarity.B_TIER:
      return 'B-Tier'
    default:
      return 'Unknown'
  }
}

/**
 * Get CSS class for styling based on rarity
 * @param rarity Rarity tier
 * @returns CSS class string
 */
export function getRarityClassNames(rarity: Rarity): {badge: string, border: string} {
  switch (rarity) {
    case Rarity.S_TIER:
      return {
        badge: 'gold-gradient text-black font-bold',
        border: 'border-gold-400'
      }
    case Rarity.A_TIER:
      return {
        badge: 'bg-pixel-purple/20 text-pixel-purple font-medium',
        border: 'border-pixel-purple'
      }
    case Rarity.B_TIER:
      return {
        badge: 'bg-pixel-blue/20 text-pixel-blue',
        border: 'border-pixel-blue'
      }
    default:
      return {
        badge: '',
        border: ''
      }
  }
}