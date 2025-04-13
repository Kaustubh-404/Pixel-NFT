"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";

// Rainbow Kit imports for wagmi v2
import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
  getDefaultConfig,
  ConnectButton,
  lightTheme,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { filecoinCalibration } from 'viem/chains';
import { http, createConfig, WagmiProvider, useAccount, useDisconnect, useBalance, useSignMessage } from 'wagmi';
import { useTheme } from "next-themes";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a React Query client - moved outside of component to prevent recreations
const queryClient = new QueryClient();

// Create a wagmi config with the Filecoin Calibration network - moved outside component
const config = getDefaultConfig({
  appName: 'PixelNFT',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '8340afce470baf1c28124a4f40e83bc8',
  chains: [filecoinCalibration],
  transports: {
    [filecoinCalibration.id]: http(),
  },
  ssr: true,
});

interface WalletContextType {
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string | null;
  signMessage: (message: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  connect: async () => {},
  disconnect: () => {},
  isConnected: false,
  isConnecting: false,
  balance: null,
  signMessage: async () => "",
});

export const useWallet = () => useContext(WalletContext);

// A flag to track if RainbowKit has been initialized
let rainbowKitInitialized = false;

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProviderWrapper>
          {children}
        </RainbowKitProviderWrapper>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function RainbowKitProviderWrapper({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const { toast } = useToast();
  
  // Using hooks from wagmi
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const [isManuallyConnecting, setIsManuallyConnecting] = useState(false);
  
  // Get balance using wagmi hooks
  const { data: balanceData } = useBalance({
    address,
    query: {
      enabled: !!address && isConnected,
    }
  });
  
  // Format balance for display
  const balance = balanceData ? 
    `${parseFloat(balanceData?.formatted).toFixed(4)} ${balanceData?.symbol}` : 
    null;

  // Initialize RainbowKit configuration only once
  useEffect(() => {
    if (!rainbowKitInitialized) {
      rainbowKitInitialized = true;
      console.log("RainbowKit initialized once");
    }
  }, []);

  // Connect function - not directly used with Rainbow Kit but kept for API compatibility
  const connect = async (): Promise<void> => {
    setIsManuallyConnecting(true);
    try {
      // This is a placeholder as RainbowKit handles connection via UI
      // The actual connection is handled by the ConnectButton component
      toast({
        title: "Connect Wallet",
        description: "Please use the connect button to connect your wallet",
      });
      // Not returning address to match Promise<void> return type
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsManuallyConnecting(false);
    }
  };

  // Disconnect function
  const disconnect = () => {
    wagmiDisconnect();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  // Sign message function using wagmi
  const { signMessageAsync } = useSignMessage();
  
  const signMessage = async (message: string): Promise<string> => {
    if (!isConnected || !address) {
      toast({
        title: "Error",
        description: "Wallet not connected",
        variant: "destructive",
      });
      throw new Error("Wallet not connected");
    }

    try {
      // Using wagmi v2 signMessage
      const signature = await signMessageAsync({ message });
      return signature;
    } catch (error: any) {
      console.error("Failed to sign message:", error);
      toast({
        title: "Signing failed",
        description: error.message || "Failed to sign message",
        variant: "destructive",
      });
      throw error;
    }
  };

  // This uses the wallet provider context
  const contextValue: WalletContextType = {
    address: address || null,
    connect,
    disconnect,
    isConnected: !!isConnected,
    isConnecting: isConnecting || isManuallyConnecting,
    balance,
    signMessage,
  };

  // Use RainbowKit's theme based on the application theme
  const rainbowTheme = resolvedTheme === 'dark' ? darkTheme() : lightTheme();

  return (
    <WalletContext.Provider value={contextValue}>
      <RainbowKitProvider theme={rainbowTheme} appInfo={{
        appName: 'PixelNFT',
      }}>
        {children}
      </RainbowKitProvider>
    </WalletContext.Provider>
  );
}


// "use client";

// import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
// import { useToast } from "@/components/ui/use-toast";

// // Rainbow Kit imports for wagmi v2
// import '@rainbow-me/rainbowkit/styles.css';
// import {
//   RainbowKitProvider,
//   getDefaultConfig,
//   ConnectButton,
//   lightTheme,
//   darkTheme,
// } from '@rainbow-me/rainbowkit';
// import { filecoinCalibration } from 'viem/chains';
// import { http, createConfig, WagmiProvider, useAccount, useDisconnect, useBalance, useSignMessage } from 'wagmi';
// import { useTheme } from "next-themes";
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// // Create a wagmi config with the Filecoin Calibration network
// const config = getDefaultConfig({
//   appName: 'PixelNFT',
//   projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
//   chains: [filecoinCalibration],
//   transports: {
//     [filecoinCalibration.id]: http(),
//   },
//   ssr: true, // Enable server-side rendering
// });

// // Create a React Query client
// const queryClient = new QueryClient();

// interface WalletContextType {
//   address: string | null;
//   connect: () => Promise<void>;
//   disconnect: () => void;
//   isConnected: boolean;
//   isConnecting: boolean;
//   balance: string | null;
//   signMessage: (message: string) => Promise<string>;
// }

// const WalletContext = createContext<WalletContextType>({
//   address: null,
//   connect: async () => {},
//   disconnect: () => {},
//   isConnected: false,
//   isConnecting: false,
//   balance: null,
//   signMessage: async () => "",
// });

// export const useWallet = () => useContext(WalletContext);

// export function WalletProvider({ children }: { children: ReactNode }) {
//   return (
//     <WagmiProvider config={config}>
//       <QueryClientProvider client={queryClient}>
//         <RainbowKitProviderWrapper>
//           {children}
//         </RainbowKitProviderWrapper>
//       </QueryClientProvider>
//     </WagmiProvider>
//   );
// }

// function RainbowKitProviderWrapper({ children }: { children: ReactNode }) {
//   const { resolvedTheme } = useTheme();
//   const { toast } = useToast();
  
//   // Using hooks from wagmi
//   const { address, isConnected, isConnecting } = useAccount();
//   const { disconnect: wagmiDisconnect } = useDisconnect();
//   const [isManuallyConnecting, setIsManuallyConnecting] = useState(false);
  
//   // Get balance using wagmi hooks
//   const { data: balanceData } = useBalance({
//     address,
//     query: {
//       enabled: !!address && isConnected,
//     }
//   });
  
//   // Format balance for display
//   const balance = balanceData ? 
//     `${parseFloat(balanceData?.formatted).toFixed(4)} ${balanceData?.symbol}` : 
//     null;

//   // Connect function - not directly used with Rainbow Kit but kept for API compatibility
//   const connect = async () => {
//     setIsManuallyConnecting(true);
//     try {
//       // This is a placeholder as RainbowKit handles connection via UI
//       // The actual connection is handled by the ConnectButton component
//       toast({
//         title: "Connect Wallet",
//         description: "Please use the connect button to connect your wallet",
//       });
//       return address as string;
//     } catch (error: any) {
//       console.error("Failed to connect wallet:", error);
//       toast({
//         title: "Connection failed",
//         description: error.message || "Failed to connect wallet",
//         variant: "destructive",
//       });
//       throw error;
//     } finally {
//       setIsManuallyConnecting(false);
//     }
//   };

//   // Disconnect function
//   const disconnect = () => {
//     wagmiDisconnect();
//     toast({
//       title: "Wallet Disconnected",
//       description: "Your wallet has been disconnected",
//     });
//   };

//   // Sign message function using wagmi
//   const { signMessageAsync } = useSignMessage();
  
//   const signMessage = async (message: string): Promise<string> => {
//     if (!isConnected || !address) {
//       toast({
//         title: "Error",
//         description: "Wallet not connected",
//         variant: "destructive",
//       });
//       throw new Error("Wallet not connected");
//     }

//     try {
//       // Using wagmi v2 signMessage
//       const signature = await signMessageAsync({ message });
//       return signature;
//     } catch (error: any) {
//       console.error("Failed to sign message:", error);
//       toast({
//         title: "Signing failed",
//         description: error.message || "Failed to sign message",
//         variant: "destructive",
//       });
//       throw error;
//     }
//   };

//   // This uses the wallet provider context
//   const contextValue: WalletContextType = {
//     address: address || null,
//     connect,
//     disconnect,
//     isConnected: !!isConnected,
//     isConnecting: isConnecting || isManuallyConnecting,
//     balance,
//     signMessage,
//   };

//   return (
//     <WalletContext.Provider value={contextValue}>
//       <RainbowKitProvider theme={resolvedTheme === 'dark' ? darkTheme() : lightTheme()}>
//         {children}
//       </RainbowKitProvider>
//     </WalletContext.Provider>
//   );
// }

// // // components/wallet-provider.tsx
// // "use client"

// // import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
// // import { useToast } from "@/components/ui/use-toast"

// // interface WalletContextType {
// //   address: string | null
// //   connect: () => Promise<void>
// //   disconnect: () => void
// //   isConnected: boolean
// //   balance: string | null
// //   signMessage: (message: string) => Promise<string>
// //   isConnecting: boolean
// // }

// // const WalletContext = createContext<WalletContextType>({
// //   address: null,
// //   connect: async () => {},
// //   disconnect: () => {},
// //   isConnected: false,
// //   balance: null,
// //   signMessage: async () => "",
// //   isConnecting: false
// // })

// // export const useWallet = () => useContext(WalletContext)

// // export function WalletProvider({ children }: { children: ReactNode }) {
// //   const [address, setAddress] = useState<string | null>(null)
// //   const [isConnected, setIsConnected] = useState(false)
// //   const [isConnecting, setIsConnecting] = useState(false)
// //   const [balance, setBalance] = useState<string | null>(null)
// //   const { toast } = useToast()

// //   // Check if wallet was previously connected
// //   useEffect(() => {
// //     const savedAddress = localStorage.getItem("walletAddress")
// //     if (savedAddress) {
// //       setAddress(savedAddress)
// //       setIsConnected(true)
// //       // Generate a random balance for demo purposes
// //       const randomBalance = (Math.random() * 5).toFixed(2) + " FIL"
// //       setBalance(randomBalance)
// //     }
// //   }, [])

// //   const connect = async () => {
// //     try {
// //       setIsConnecting(true)

// //       // This would be replaced with actual wallet connection logic
// //       // For example, using ethers.js or web3.js to connect to MetaMask
      
// //       // Check if ethereum object exists in window (MetaMask or similar wallet)
// //       if (typeof window !== 'undefined' && (window as any).ethereum) {
// //         try {
// //           // Request account access
// //           const accounts = await (window as any).ethereum.request({ 
// //             method: 'eth_requestAccounts' 
// //           })
          
// //           // Get the connected wallet address
// //           const connectedAddress = accounts[0]
          
// //           // Generate a random balance for demo
// //           const mockBalance = (Math.random() * 5).toFixed(2) + " FIL"
          
// //           setAddress(connectedAddress)
// //           setBalance(mockBalance)
// //           setIsConnected(true)
// //           localStorage.setItem("walletAddress", connectedAddress)
          
// //           return connectedAddress
// //         } catch (error: any) {
// //           if (error.code === 4001) {
// //             // User rejected the connection
// //             throw new Error("User rejected wallet connection")
// //           } else {
// //             console.error("Wallet connection error:", error)
// //             throw error
// //           }
// //         }
// //       } else {
// //         // Fallback to mock wallet for demo purposes
// //         await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate connection delay

// //         const mockAddress = "0x" + Math.random().toString(16).slice(2, 10) + "..." + Math.random().toString(16).slice(2, 6)
// //         const mockBalance = (Math.random() * 5).toFixed(2) + " FIL"

// //         setAddress(mockAddress)
// //         setBalance(mockBalance)
// //         setIsConnected(true)
// //         localStorage.setItem("walletAddress", mockAddress)

// //         toast({
// //           title: "Demo Wallet Connected",
// //           description: "Using a simulated wallet connection",
// //         })

// //         return mockAddress
// //       }
// //     } catch (error) {
// //       console.error("Failed to connect wallet:", error)
// //       throw error
// //     } finally {
// //       setIsConnecting(false)
// //     }
// //   }

// //   const disconnect = () => {
// //     setAddress(null)
// //     setBalance(null)
// //     setIsConnected(false)
// //     localStorage.removeItem("walletAddress")
    
// //     toast({
// //       title: "Wallet Disconnected",
// //       description: "Your wallet has been disconnected",
// //     })
// //   }

// //   const signMessage = async (message: string): Promise<string> => {
// //     if (!isConnected) {
// //       toast({
// //         title: "Error",
// //         description: "Wallet not connected",
// //         variant: "destructive",
// //       })
// //       throw new Error("Wallet not connected")
// //     }

// //     try {
// //       // Check if we have an actual ethereum provider
// //       if (typeof window !== 'undefined' && (window as any).ethereum && address) {
// //         try {
// //           // Format the address properly (remove any "..." if using mock address)
// //           const formattedAddress = address.includes("...") 
// //             ? "0x" + Math.random().toString(16).slice(2, 42) // Generate a full address if using mock
// //             : address
            
// //           // Request signature
// //           const signature = await (window as any).ethereum.request({
// //             method: 'personal_sign',
// //             params: [message, formattedAddress],
// //           })
          
// //           return signature
// //         } catch (error: any) {
// //           if (error.code === 4001) {
// //             // User rejected the signature
// //             throw new Error("User rejected signature request")
// //           } else {
// //             console.error("Signing error:", error)
// //             throw error
// //           }
// //         }
// //       } else {
// //         // Simulate signing delay for mock wallet
// //         await new Promise((resolve) => setTimeout(resolve, 1000))

// //         // Mock signature
// //         const mockSignature = "0x" + Array(130)
// //           .fill(0)
// //           .map(() => Math.floor(Math.random() * 16).toString(16))
// //           .join("")

// //         return mockSignature
// //       }
// //     } catch (error) {
// //       console.error("Failed to sign message:", error)
// //       throw error
// //     }
// //   }

// //   return (
// //     <WalletContext.Provider
// //       value={{
// //         address,
// //         connect,
// //         disconnect,
// //         isConnected,
// //         balance,
// //         signMessage,
// //         isConnecting
// //       }}
// //     >
// //       {children}
// //     </WalletContext.Provider>
// //   )
// // }


// // // "use client"

// // // import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
// // // import { useToast } from "@/components/ui/use-toast"

// // // interface WalletContextType {
// // //   address: string | null
// // //   connect: () => Promise<void>
// // //   disconnect: () => void
// // //   isConnected: boolean
// // //   balance: string | null
// // //   signMessage: (message: string) => Promise<string>
// // // }

// // // const WalletContext = createContext<WalletContextType>({
// // //   address: null,
// // //   connect: async () => {},
// // //   disconnect: () => {},
// // //   isConnected: false,
// // //   balance: null,
// // //   signMessage: async () => "",
// // // })

// // // export const useWallet = () => useContext(WalletContext)

// // // export function WalletProvider({ children }: { children: ReactNode }) {
// // //   const [address, setAddress] = useState<string | null>(null)
// // //   const [isConnected, setIsConnected] = useState(false)
// // //   const [balance, setBalance] = useState<string | null>(null)
// // //   const { toast } = useToast()

// // //   // Check if wallet was previously connected
// // //   useEffect(() => {
// // //     const savedAddress = localStorage.getItem("walletAddress")
// // //     if (savedAddress) {
// // //       setAddress(savedAddress)
// // //       setIsConnected(true)
// // //       setBalance("1.25 FIL") // Mock balance
// // //     }
// // //   }, [])

// // //   const connect = async () => {
// // //     try {
// // //       // This would be replaced with actual wallet connection logic
// // //       // For example, using ethers.js or web3.js to connect to MetaMask
// // //       await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate connection delay

// // //       const mockAddress =
// // //         "0x" + Math.random().toString(16).slice(2, 10) + "..." + Math.random().toString(16).slice(2, 6)
// // //       const mockBalance = (Math.random() * 5).toFixed(2) + " FIL"

// // //       setAddress(mockAddress)
// // //       setBalance(mockBalance)
// // //       setIsConnected(true)
// // //       localStorage.setItem("walletAddress", mockAddress)

// // //       return mockAddress
// // //     } catch (error) {
// // //       console.error("Failed to connect wallet:", error)
// // //       throw error
// // //     }
// // //   }

// // //   const disconnect = () => {
// // //     setAddress(null)
// // //     setBalance(null)
// // //     setIsConnected(false)
// // //     localStorage.removeItem("walletAddress")
// // //   }

// // //   const signMessage = async (message: string): Promise<string> => {
// // //     if (!isConnected) {
// // //       toast({
// // //         title: "Error",
// // //         description: "Wallet not connected",
// // //         variant: "destructive",
// // //       })
// // //       throw new Error("Wallet not connected")
// // //     }

// // //     // Simulate signing delay
// // //     await new Promise((resolve) => setTimeout(resolve, 1000))

// // //     // Mock signature
// // //     const mockSignature =
// // //       "0x" +
// // //       Array(130)
// // //         .fill(0)
// // //         .map(() => Math.floor(Math.random() * 16).toString(16))
// // //         .join("")

// // //     return mockSignature
// // //   }

// // //   return (
// // //     <WalletContext.Provider
// // //       value={{
// // //         address,
// // //         connect,
// // //         disconnect,
// // //         isConnected,
// // //         balance,
// // //         signMessage,
// // //       }}
// // //     >
// // //       {children}
// // //     </WalletContext.Provider>
// // //   )
// // // }
