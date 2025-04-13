// lib/contracts/nft-helpers.ts
import { 
    PIXEL_NFT_ABI, 
    CONTRACT_ADDRESS, 
    Rarity
  } from './nft-contract'
  import { 
    useReadContract, 
    useWriteContract, 
    useWaitForTransactionReceipt
  } from 'wagmi'

  
  // Interface for NFT Details
  interface NFTDetails {
    tokenURI: string;
    rarity: Rarity;
    price: bigint;
    isListed: boolean;
    owner: `0x${string}`;
  }
  
  // Hook for minting a single NFT
  export function useMintNFT() {
    const writeContract = useWriteContract()
  
    const { 
      data: txHash, 
      isPending: isWritePending, 
      isSuccess: isWriteSuccess, 
      error: writeError 
    } = writeContract
  
    const { 
      data: txData, 
      isLoading: isTxLoading, 
      isSuccess: isTxSuccess,
      error: txError
    } = useWaitForTransactionReceipt({
      hash: txHash,
    })
  
    // Function to call the mint function with specific parameters
    const mintNFT = (
      to: `0x${string}`, 
      uri: string, 
      nftRarity: Rarity
    ) => {
      writeContract.writeContract({
        address: CONTRACT_ADDRESS,
        abi: PIXEL_NFT_ABI,
        functionName: 'mint',
        args: [to, uri, nftRarity]
      })
    }
    
    return {
      mintNFT,
      txHash,
      txData,
      isLoading: isWritePending || isTxLoading,
      isSuccess: isWriteSuccess && isTxSuccess,
      isError: !!writeError || !!txError,
      error: writeError || txError
    }
  }
  
  // Hook for minting multiple NFTs as a bundle
  export function useMintNFTBundle() {
    const writeContract = useWriteContract()
  
    const { 
      data: txHash, 
      isPending: isWritePending, 
      isSuccess: isWriteSuccess, 
      error: writeError 
    } = writeContract
  
    const { 
      data: txData, 
      isLoading: isTxLoading, 
      isSuccess: isTxSuccess,
      error: txError
    } = useWaitForTransactionReceipt({
      hash: txHash,
    })
  
    // Function to call the mintBundle function with specific parameters
    const mintNFTBundle = (
      to: `0x${string}`, 
      uris: string[], 
      nftRarities: Rarity[],
      bundleMetadataURI: string
    ) => {
      writeContract.writeContract({
        address: CONTRACT_ADDRESS,
        abi: PIXEL_NFT_ABI,
        functionName: 'mintBundle',
        args: [to, uris, nftRarities, bundleMetadataURI]
      })
    }
    
    return {
      mintNFTBundle,
      txHash,
      txData,
      isLoading: isWritePending || isTxLoading,
      isSuccess: isWriteSuccess && isTxSuccess,
      isError: !!writeError || !!txError,
      error: writeError || txError
    }
  }
  
  // Hook for listing an NFT for sale
  export function useListNFT() {
    const writeContract = useWriteContract()
  
    const { 
      data: txHash, 
      isPending: isWritePending, 
      isSuccess: isWriteSuccess, 
      error: writeError 
    } = writeContract
  
    const { 
      data: txData, 
      isLoading: isTxLoading, 
      isSuccess: isTxSuccess,
      error: txError
    } = useWaitForTransactionReceipt({
      hash: txHash,
    })
  
    // Function to list an NFT for sale
    const listNFT = (tokenId: bigint, price: bigint) => {
      writeContract.writeContract({
        address: CONTRACT_ADDRESS,
        abi: PIXEL_NFT_ABI,
        functionName: 'listNFT',
        args: [tokenId, price]
      })
    }
    
    return {
      listNFT,
      txHash,
      txData,
      isLoading: isWritePending || isTxLoading,
      isSuccess: isWriteSuccess && isTxSuccess,
      isError: !!writeError || !!txError,
      error: writeError || txError
    }
  }
  
  // Hook for buying an NFT
  export function useBuyNFT() {
    const writeContract = useWriteContract()
  
    const { 
      data: txHash, 
      isPending: isWritePending, 
      isSuccess: isWriteSuccess, 
      error: writeError 
    } = writeContract
  
    const { 
      data: txData, 
      isLoading: isTxLoading, 
      isSuccess: isTxSuccess,
      error: txError
    } = useWaitForTransactionReceipt({
      hash: txHash,
    })
  
    // Function to buy an NFT
    const buyNFT = (id: bigint, nftPrice: bigint) => {
      writeContract.writeContract({
        address: CONTRACT_ADDRESS,
        abi: PIXEL_NFT_ABI,
        functionName: 'buyNFT',
        args: [id],
        value: nftPrice
      })
    }
    
    return {
      buyNFT,
      txHash,
      txData,
      isLoading: isWritePending || isTxLoading,
      isSuccess: isWriteSuccess && isTxSuccess,
      isError: !!writeError || !!txError,
      error: writeError || txError
    }
  }
  
  // Hook to get NFT details
  export function useNFTDetails(tokenId: bigint) {
    const { 
      data, 
      isLoading, 
      isError, 
      error 
    } = useReadContract({
      address: CONTRACT_ADDRESS,
      abi: PIXEL_NFT_ABI,
      functionName: 'getNFTDetails',
      args: [tokenId],
      query: {
        enabled: tokenId > toBigInt(0),
      }
    })
    
    // Type-safe parsing of NFT details
    const nftDetails = data && Array.isArray(data) && data.length >= 5 
      ? {
          tokenURI: data[0] as string,
          rarity: data[1] as Rarity,
          price: data[2] as bigint,
          isListed: data[3] as boolean,
          owner: data[4] as `0x${string}`,
        } 
      : null
    
    return {
      nftDetails,
      isLoading,
      isError,
      error
    }
  }
  
  // To handle BigInt literals in older TypeScript configurations,
  // you can use these helper functions
  export const toBigInt = (value: number | string): bigint => BigInt(value);
  export const toBigIntLiteral = (value: number | string): bigint => BigInt(value);



// // lib/contracts/nft-helpers.ts
// import { 
//     PIXEL_NFT_ABI, 
//     CONTRACT_ADDRESS, 
//     Rarity, 
//     calculatePrice 
//   } from './nft-contract'
//   import { 
//     useContractRead, 
//     useContractWrite, 
//     usePrepareContractWrite,
//     useWaitForTransaction
//   } from 'wagmi'
//   import { useState, useEffect } from 'react'
//   import { parseEther } from 'viem'
  
//   // Hook for minting a single NFT
//   export function useMintNFT() {
//     const [tokenURI, setTokenURI] = useState<string>('')
//     const [rarity, setRarity] = useState<Rarity>(Rarity.B_TIER)
    
//     const { config } = usePrepareContractWrite({
//       address: CONTRACT_ADDRESS as `0x${string}`,
//       abi: PIXEL_NFT_ABI,
//       functionName: 'mint',
//       args: [undefined, tokenURI, rarity], // will be populated when function is called
//       enabled: false,
//     })
    
//     const { 
//       data, 
//       isLoading, 
//       isSuccess, 
//       isError, 
//       error, 
//       write 
//     } = useContractWrite(config)
    
//     const {
//       data: txData,
//       isLoading: isTxLoading,
//       isSuccess: isTxSuccess
//     } = useWaitForTransaction({
//       hash: data?.hash,
//     })
  
//     // Function to call the mint function with specific parameters
//     const mintNFT = async (
//       to: `0x${string}`, 
//       uri: string, 
//       nftRarity: Rarity
//     ) => {
//       setTokenURI(uri)
//       setRarity(nftRarity)
      
//       // Small delay to ensure state is updated
//       setTimeout(() => {
//         if (write) {
//           write({
//             args: [to, uri, nftRarity]
//           })
//         }
//       }, 100)
//     }
    
//     return {
//       mintNFT,
//       data,
//       txData,
//       isLoading: isLoading || isTxLoading,
//       isSuccess: isSuccess && isTxSuccess,
//       isError,
//       error
//     }
//   }
  
//   // Hook for minting multiple NFTs as a bundle
//   export function useMintNFTBundle() {
//     const [tokenURIs, setTokenURIs] = useState<string[]>([])
//     const [rarities, setRarities] = useState<Rarity[]>([])
//     const [bundleURI, setBundleURI] = useState<string>('')
    
//     const { config } = usePrepareContractWrite({
//       address: CONTRACT_ADDRESS as `0x${string}`,
//       abi: PIXEL_NFT_ABI,
//       functionName: 'mintBundle',
//       args: [undefined, tokenURIs, rarities, bundleURI], // will be populated when function is called
//       enabled: false,
//     })
    
//     const { 
//       data, 
//       isLoading, 
//       isSuccess, 
//       isError, 
//       error, 
//       write 
//     } = useContractWrite(config)
    
//     const {
//       data: txData,
//       isLoading: isTxLoading,
//       isSuccess: isTxSuccess
//     } = useWaitForTransaction({
//       hash: data?.hash,
//     })
  
//     // Function to call the mintBundle function with specific parameters
//     const mintNFTBundle = async (
//       to: `0x${string}`, 
//       uris: string[], 
//       nftRarities: Rarity[],
//       bundleMetadataURI: string
//     ) => {
//       setTokenURIs(uris)
//       setRarities(nftRarities)
//       setBundleURI(bundleMetadataURI)
      
//       // Small delay to ensure state is updated
//       setTimeout(() => {
//         if (write) {
//           write({
//             args: [to, uris, nftRarities, bundleMetadataURI]
//           })
//         }
//       }, 100)
//     }
    
//     return {
//       mintNFTBundle,
//       data,
//       txData,
//       isLoading: isLoading || isTxLoading,
//       isSuccess: isSuccess && isTxSuccess,
//       isError,
//       error
//     }
//   }
  
//   // Hook for listing an NFT for sale
//   export function useListNFT() {
//     const { config } = usePrepareContractWrite({
//       address: CONTRACT_ADDRESS as `0x${string}`,
//       abi: PIXEL_NFT_ABI,
//       functionName: 'listNFT',
//       args: [0n, 0n], // Placeholder, will be overridden
//       enabled: false,
//     })
    
//     const { 
//       data, 
//       isLoading, 
//       isSuccess, 
//       isError, 
//       error, 
//       write 
//     } = useContractWrite(config)
    
//     const {
//       data: txData,
//       isLoading: isTxLoading,
//       isSuccess: isTxSuccess
//     } = useWaitForTransaction({
//       hash: data?.hash,
//     })
  
//     // Function to list an NFT for sale
//     const listNFT = async (tokenId: bigint, price: bigint) => {
//       if (write) {
//         write({
//           args: [tokenId, price]
//         })
//       }
//     }
    
//     return {
//       listNFT,
//       data,
//       txData,
//       isLoading: isLoading || isTxLoading,
//       isSuccess: isSuccess && isTxSuccess,
//       isError,
//       error
//     }
//   }
  
//   // Hook for buying an NFT
//   export function useBuyNFT() {
//     const [tokenId, setTokenId] = useState<bigint>(0n)
//     const [price, setPrice] = useState<bigint>(0n)
    
//     const { config } = usePrepareContractWrite({
//       address: CONTRACT_ADDRESS as `0x${string}`,
//       abi: PIXEL_NFT_ABI,
//       functionName: 'buyNFT',
//       args: [tokenId],
//       value: price,
//       enabled: false,
//     })
    
//     const { 
//       data, 
//       isLoading, 
//       isSuccess, 
//       isError, 
//       error, 
//       write 
//     } = useContractWrite(config)
    
//     const {
//       data: txData,
//       isLoading: isTxLoading,
//       isSuccess: isTxSuccess
//     } = useWaitForTransaction({
//       hash: data?.hash,
//     })
  
//     // Function to buy an NFT
//     const buyNFT = async (id: bigint, nftPrice: bigint) => {
//       setTokenId(id)
//       setPrice(nftPrice)
      
//       // Small delay to ensure state is updated
//       setTimeout(() => {
//         if (write) {
//           write({
//             args: [id],
//             value: nftPrice
//           })
//         }
//       }, 100)
//     }
    
//     return {
//       buyNFT,
//       data,
//       txData,
//       isLoading: isLoading || isTxLoading,
//       isSuccess: isSuccess && isTxSuccess,
//       isError,
//       error
//     }
//   }
  
//   // Hook to get NFT details
//   export function useNFTDetails(tokenId: bigint) {
//     const { data, isLoading, isError, error } = useContractRead({
//       address: CONTRACT_ADDRESS as `0x${string}`,
//       abi: PIXEL_NFT_ABI,
//       functionName: 'getNFTDetails',
//       args: [tokenId],
//       enabled: tokenId > 0n,
//     })
    
//     // Parse the result into a more usable form
//     const nftDetails = data ? {
//       tokenURI: data[0] as string,
//       rarity: data[1] as Rarity,
//       price: data[2] as bigint,
//       isListed: data[3] as boolean,
//       owner: data[4] as `0x${string}`,
//     } : null
    
//     return {
//       nftDetails,
//       isLoading,
//       isError,
//       error
//     }
//   }