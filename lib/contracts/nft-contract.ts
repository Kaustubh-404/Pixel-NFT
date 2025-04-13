// lib/contracts/nft-contract.ts
import { parseEther } from 'viem'

// ABI for the PixelNFT contract
// This is a simplified version - in a real implementation, you'd include all methods
export const PIXEL_NFT_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	// ... (rest of the ABI remains the same)
]

// Define contract addresses (these would come from deployment)
export const CONTRACT_ADDRESS = '0x48b343e298cA724f78650Aec3d79852c9cBcaD7F' // Replace with actual deployed contract

// Define rarity tiers
export enum Rarity {
  B_TIER = 0,
  A_TIER = 1,
  S_TIER = 2,
}

// Rarity metadata for display and price calculation
export const RARITY_INFO = {
  [Rarity.B_TIER]: {
    name: 'B-Tier',
    description: 'Common pixel art',
    priceMultiplier: 1.0,
    cssClass: 'bg-pixel-blue/20 text-pixel-blue',
    borderClass: 'border-pixel-blue',
  },
  [Rarity.A_TIER]: {
    name: 'A-Tier',
    description: 'Rare pixel art with unique elements',
    priceMultiplier: 2.0,
    cssClass: 'bg-pixel-purple/20 text-pixel-purple',
    borderClass: 'border-pixel-purple',
  },
  [Rarity.S_TIER]: {
    name: 'S-Tier',
    description: 'Legendary pixel art with gold elements',
    priceMultiplier: 5.0,
    cssClass: 'gold-gradient text-black',
    borderClass: 'border-gold',
  },
}

// Base price in tFIL
export const BASE_PRICE = parseEther('0.01')

// Calculate price based on rarity
export function calculatePrice(rarity: Rarity): bigint {
  return BASE_PRICE * BigInt(Math.floor(RARITY_INFO[rarity].priceMultiplier * 100)) / BigInt(100)
}

// // lib/contracts/nft-contract.ts
// import { parseEther } from 'viem'

// // ABI for the PixelNFT contract
// // This is a simplified version - in a real implementation, you'd include all methods
// export const PIXEL_NFT_ABI = [
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "to",
// 				"type": "address"
// 			},
// 			{
// 				"internalType": "uint256",
// 				"name": "tokenId",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "approve",
// 		"outputs": [],
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [],
// 		"stateMutability": "nonpayable",
// 		"type": "constructor"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "sender",
// 				"type": "address"
// 			},
// 			{
// 				"internalType": "uint256",
// 				"name": "tokenId",
// 				"type": "uint256"
// 			},
// 			{
// 				"internalType": "address",
// 				"name": "owner",
// 				"type": "address"
// 			}
// 		],
// 		"name": "ERC721IncorrectOwner",
// 		"type": "error"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "operator",
// 				"type": "address"
// 			},
// 			{
// 				"internalType": "uint256",
// 				"name": "tokenId",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "ERC721InsufficientApproval",
// 		"type": "error"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "approver",
// 				"type": "address"
// 			}
// 		],
// 		"name": "ERC721InvalidApprover",
// 		"type": "error"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "operator",
// 				"type": "address"
// 			}
// 		],
// 		"name": "ERC721InvalidOperator",
// 		"type": "error"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "owner",
// 				"type": "address"
// 			}
// 		],
// 		"name": "ERC721InvalidOwner",
// 		"type": "error"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "receiver",
// 				"type": "address"
// 			}
// 		],
// 		"name": "ERC721InvalidReceiver",
// 		"type": "error"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "sender",
// 				"type": "address"
// 			}
// 		],
// 		"name": "ERC721InvalidSender",
// 		"type": "error"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "tokenId",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "ERC721NonexistentToken",
// 		"type": "error"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "owner",
// 				"type": "address"
// 			}
// 		],
// 		"name": "OwnableInvalidOwner",
// 		"type": "error"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "account",
// 				"type": "address"
// 			}
// 		],
// 		"name": "OwnableUnauthorizedAccount",
// 		"type": "error"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": true,
// 				"internalType": "address",
// 				"name": "owner",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": true,
// 				"internalType": "address",
// 				"name": "approved",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": true,
// 				"internalType": "uint256",
// 				"name": "tokenId",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "Approval",
// 		"type": "event"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": true,
// 				"internalType": "address",
// 				"name": "owner",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": true,
// 				"internalType": "address",
// 				"name": "operator",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": false,
// 				"internalType": "bool",
// 				"name": "approved",
// 				"type": "bool"
// 			}
// 		],
// 		"name": "ApprovalForAll",
// 		"type": "event"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": false,
// 				"internalType": "uint256",
// 				"name": "_fromTokenId",
// 				"type": "uint256"
// 			},
// 			{
// 				"indexed": false,
// 				"internalType": "uint256",
// 				"name": "_toTokenId",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "BatchMetadataUpdate",
// 		"type": "event"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": false,
// 				"internalType": "uint256",
// 				"name": "bundleId",
// 				"type": "uint256"
// 			},
// 			{
// 				"indexed": false,
// 				"internalType": "uint256",
// 				"name": "price",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "BundleListed",
// 		"type": "event"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": false,
// 				"internalType": "uint256",
// 				"name": "bundleId",
// 				"type": "uint256"
// 			},
// 			{
// 				"indexed": false,
// 				"internalType": "address",
// 				"name": "creator",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": false,
// 				"internalType": "uint256[]",
// 				"name": "tokenIds",
// 				"type": "uint256[]"
// 			},
// 			{
// 				"indexed": false,
// 				"internalType": "string",
// 				"name": "bundleURI",
// 				"type": "string"
// 			}
// 		],
// 		"name": "BundleMinted",
// 		"type": "event"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": false,
// 				"internalType": "uint256",
// 				"name": "bundleId",
// 				"type": "uint256"
// 			},
// 			{
// 				"indexed": false,
// 				"internalType": "address",
// 				"name": "seller",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": false,
// 				"internalType": "address",
// 				"name": "buyer",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": false,
// 				"internalType": "uint256",
// 				"name": "price",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "BundlePurchased",
// 		"type": "event"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "bundleId",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "buyBundle",
// 		"outputs": [],
// 		"stateMutability": "payable",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "tokenId",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "buyNFT",
// 		"outputs": [],
// 		"stateMutability": "payable",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "bundleId",
// 				"type": "uint256"
// 			},
// 			{
// 				"internalType": "uint256",
// 				"name": "price",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "listBundle",
// 		"outputs": [],
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "tokenId",
// 				"type": "uint256"
// 			},
// 			{
// 				"internalType": "uint256",
// 				"name": "price",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "listNFT",
// 		"outputs": [],
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": false,
// 				"internalType": "uint256",
// 				"name": "_tokenId",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "MetadataUpdate",
// 		"type": "event"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "to",
// 				"type": "address"
// 			},
// 			{
// 				"internalType": "string",
// 				"name": "tokenURI",
// 				"type": "string"
// 			},
// 			{
// 				"internalType": "enum PixelNFT.Rarity",
// 				"name": "rarity",
// 				"type": "uint8"
// 			}
// 		],
// 		"name": "mint",
// 		"outputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "",
// 				"type": "uint256"
// 			}
// 		],
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "to",
// 				"type": "address"
// 			},
// 			{
// 				"internalType": "string[]",
// 				"name": "tokenURIs",
// 				"type": "string[]"
// 			},
// 			{
// 				"internalType": "enum PixelNFT.Rarity[]",
// 				"name": "rarities",
// 				"type": "uint8[]"
// 			},
// 			{
// 				"internalType": "string",
// 				"name": "bundleURI",
// 				"type": "string"
// 			}
// 		],
// 		"name": "mintBundle",
// 		"outputs": [
// 			{
// 				"internalType": "uint256[]",
// 				"name": "",
// 				"type": "uint256[]"
// 			}
// 		],
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": false,
// 				"internalType": "uint256",
// 				"name": "tokenId",
// 				"type": "uint256"
// 			},
// 			{
// 				"indexed": false,
// 				"internalType": "uint256",
// 				"name": "price",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "NFTListed",
// 		"type": "event"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": false,
// 				"internalType": "uint256",
// 				"name": "tokenId",
// 				"type": "uint256"
// 			},
// 			{
// 				"indexed": false,
// 				"internalType": "address",
// 				"name": "creator",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": false,
// 				"internalType": "enum PixelNFT.Rarity",
// 				"name": "rarity",
// 				"type": "uint8"
// 			},
// 			{
// 				"indexed": false,
// 				"internalType": "string",
// 				"name": "tokenURI",
// 				"type": "string"
// 			}
// 		],
// 		"name": "NFTMinted",
// 		"type": "event"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": false,
// 				"internalType": "uint256",
// 				"name": "tokenId",
// 				"type": "uint256"
// 			},
// 			{
// 				"indexed": false,
// 				"internalType": "address",
// 				"name": "seller",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": false,
// 				"internalType": "address",
// 				"name": "buyer",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": false,
// 				"internalType": "uint256",
// 				"name": "price",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "NFTPurchased",
// 		"type": "event"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": true,
// 				"internalType": "address",
// 				"name": "previousOwner",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": true,
// 				"internalType": "address",
// 				"name": "newOwner",
// 				"type": "address"
// 			}
// 		],
// 		"name": "OwnershipTransferred",
// 		"type": "event"
// 	},
// 	{
// 		"inputs": [],
// 		"name": "renounceOwnership",
// 		"outputs": [],
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "from",
// 				"type": "address"
// 			},
// 			{
// 				"internalType": "address",
// 				"name": "to",
// 				"type": "address"
// 			},
// 			{
// 				"internalType": "uint256",
// 				"name": "tokenId",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "safeTransferFrom",
// 		"outputs": [],
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "from",
// 				"type": "address"
// 			},
// 			{
// 				"internalType": "address",
// 				"name": "to",
// 				"type": "address"
// 			},
// 			{
// 				"internalType": "uint256",
// 				"name": "tokenId",
// 				"type": "uint256"
// 			},
// 			{
// 				"internalType": "bytes",
// 				"name": "data",
// 				"type": "bytes"
// 			}
// 		],
// 		"name": "safeTransferFrom",
// 		"outputs": [],
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "operator",
// 				"type": "address"
// 			},
// 			{
// 				"internalType": "bool",
// 				"name": "approved",
// 				"type": "bool"
// 			}
// 		],
// 		"name": "setApprovalForAll",
// 		"outputs": [],
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": true,
// 				"internalType": "address",
// 				"name": "from",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": true,
// 				"internalType": "address",
// 				"name": "to",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": true,
// 				"internalType": "uint256",
// 				"name": "tokenId",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "Transfer",
// 		"type": "event"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "from",
// 				"type": "address"
// 			},
// 			{
// 				"internalType": "address",
// 				"name": "to",
// 				"type": "address"
// 			},
// 			{
// 				"internalType": "uint256",
// 				"name": "tokenId",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "transferFrom",
// 		"outputs": [],
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "newOwner",
// 				"type": "address"
// 			}
// 		],
// 		"name": "transferOwnership",
// 		"outputs": [],
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [],
// 		"name": "A_TIER_PRICE",
// 		"outputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "",
// 				"type": "uint256"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [],
// 		"name": "B_TIER_PRICE",
// 		"outputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "",
// 				"type": "uint256"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "owner",
// 				"type": "address"
// 			}
// 		],
// 		"name": "balanceOf",
// 		"outputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "",
// 				"type": "uint256"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "bundles",
// 		"outputs": [
// 			{
// 				"internalType": "string",
// 				"name": "bundleURI",
// 				"type": "string"
// 			},
// 			{
// 				"internalType": "bool",
// 				"name": "isForSale",
// 				"type": "bool"
// 			},
// 			{
// 				"internalType": "uint256",
// 				"name": "listingPrice",
// 				"type": "uint256"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "tokenId",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "getApproved",
// 		"outputs": [
// 			{
// 				"internalType": "address",
// 				"name": "",
// 				"type": "address"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "bundleId",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "getBundleDetails",
// 		"outputs": [
// 			{
// 				"internalType": "uint256[]",
// 				"name": "tokenIds",
// 				"type": "uint256[]"
// 			},
// 			{
// 				"internalType": "string",
// 				"name": "bundleURI",
// 				"type": "string"
// 			},
// 			{
// 				"internalType": "uint256",
// 				"name": "price",
// 				"type": "uint256"
// 			},
// 			{
// 				"internalType": "bool",
// 				"name": "isListed",
// 				"type": "bool"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "tokenId",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "getNFTDetails",
// 		"outputs": [
// 			{
// 				"internalType": "string",
// 				"name": "tokenURI",
// 				"type": "string"
// 			},
// 			{
// 				"internalType": "enum PixelNFT.Rarity",
// 				"name": "rarity",
// 				"type": "uint8"
// 			},
// 			{
// 				"internalType": "uint256",
// 				"name": "price",
// 				"type": "uint256"
// 			},
// 			{
// 				"internalType": "bool",
// 				"name": "isListed",
// 				"type": "bool"
// 			},
// 			{
// 				"internalType": "address",
// 				"name": "owner",
// 				"type": "address"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "address",
// 				"name": "owner",
// 				"type": "address"
// 			},
// 			{
// 				"internalType": "address",
// 				"name": "operator",
// 				"type": "address"
// 			}
// 		],
// 		"name": "isApprovedForAll",
// 		"outputs": [
// 			{
// 				"internalType": "bool",
// 				"name": "",
// 				"type": "bool"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [],
// 		"name": "name",
// 		"outputs": [
// 			{
// 				"internalType": "string",
// 				"name": "",
// 				"type": "string"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "nftData",
// 		"outputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "tokenId",
// 				"type": "uint256"
// 			},
// 			{
// 				"internalType": "enum PixelNFT.Rarity",
// 				"name": "rarity",
// 				"type": "uint8"
// 			},
// 			{
// 				"internalType": "uint256",
// 				"name": "mintPrice",
// 				"type": "uint256"
// 			},
// 			{
// 				"internalType": "bool",
// 				"name": "isForSale",
// 				"type": "bool"
// 			},
// 			{
// 				"internalType": "uint256",
// 				"name": "listingPrice",
// 				"type": "uint256"
// 			},
// 			{
// 				"internalType": "address",
// 				"name": "creator",
// 				"type": "address"
// 			},
// 			{
// 				"internalType": "string",
// 				"name": "tokenURI",
// 				"type": "string"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [],
// 		"name": "owner",
// 		"outputs": [
// 			{
// 				"internalType": "address",
// 				"name": "",
// 				"type": "address"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "tokenId",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "ownerOf",
// 		"outputs": [
// 			{
// 				"internalType": "address",
// 				"name": "",
// 				"type": "address"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [],
// 		"name": "S_TIER_PRICE",
// 		"outputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "",
// 				"type": "uint256"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "bytes4",
// 				"name": "interfaceId",
// 				"type": "bytes4"
// 			}
// 		],
// 		"name": "supportsInterface",
// 		"outputs": [
// 			{
// 				"internalType": "bool",
// 				"name": "",
// 				"type": "bool"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [],
// 		"name": "symbol",
// 		"outputs": [
// 			{
// 				"internalType": "string",
// 				"name": "",
// 				"type": "string"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"internalType": "uint256",
// 				"name": "tokenId",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "tokenURI",
// 		"outputs": [
// 			{
// 				"internalType": "string",
// 				"name": "",
// 				"type": "string"
// 			}
// 		],
// 		"stateMutability": "view",
// 		"type": "function"
// 	}
// ]

// // Define contract addresses (these would come from deployment)
// export const CONTRACT_ADDRESS = '0x48b343e298cA724f78650Aec3d79852c9cBcaD7F' // Replace with actual deployed contract

// // Define rarity tiers
// export enum Rarity {
//   B_TIER = 0,
//   A_TIER = 1,
//   S_TIER = 2,
// }

// // Rarity metadata for display and price calculation
// export const RARITY_INFO = {
//   [Rarity.B_TIER]: {
//     name: 'B-Tier',
//     description: 'Common pixel art',
//     priceMultiplier: 1.0,
//     cssClass: 'bg-pixel-blue/20 text-pixel-blue',
//     borderClass: 'border-pixel-blue',
//   },
//   [Rarity.A_TIER]: {
//     name: 'A-Tier',
//     description: 'Rare pixel art with unique elements',
//     priceMultiplier: 2.0,
//     cssClass: 'bg-pixel-purple/20 text-pixel-purple',
//     borderClass: 'border-pixel-purple',
//   },
//   [Rarity.S_TIER]: {
//     name: 'S-Tier',
//     description: 'Legendary pixel art with gold elements',
//     priceMultiplier: 5.0,
//     cssClass: 'gold-gradient text-black',
//     borderClass: 'border-gold',
//   },
// }

// // Base price in tFIL
// export const BASE_PRICE = parseEther('0.01')

// // Calculate price based on rarity
// export function calculatePrice(rarity: Rarity): bigint {
//   return BASE_PRICE * BigInt(Math.floor(RARITY_INFO[rarity].priceMultiplier * 100)) / 100n
// }