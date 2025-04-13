// // components/providers/wallet-provider.tsx
// 'use client'

// import { getDefaultWallets, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
// import { configureChains, createConfig, WagmiConfig } from 'wagmi'
// import { filecoinCalibration } from 'wagmi/chains'
// import { publicProvider } from 'wagmi/providers/public'
// import { ReactNode } from 'react'
// import '@rainbow-me/rainbowkit/styles.css'

// // Configure Filecoin Calibration (testnet) for tFIL transactions
// const { chains, publicClient } = configureChains(
//   [filecoinCalibration],
//   [publicProvider()]
// )

// // Set up rainbow wallet connectors
// const { connectors } = getDefaultWallets({
//   appName: 'PixelNFT',
//   projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
//   chains,
// })

// // Create Wagmi config
// const wagmiConfig = createConfig({
//   autoConnect: true,
//   connectors,
//   publicClient,
// })

// export function WalletProvider({ children }: { children: ReactNode }) {
//   return (
//     <WagmiConfig config={wagmiConfig}>
//       <RainbowKitProvider 
//         chains={chains} 
//         theme={darkTheme({
//           accentColor: '#2ed573', // pixel-green from the theme
//           accentColorForeground: 'black',
//           borderRadius: 'small',
//           fontStack: 'system'
//         })}
//       >
//         {children}
//       </RainbowKitProvider>
//     </WagmiConfig>
//   )
// }



// components/providers/wallet-provider.tsx
'use client'
import { ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme, connectorsForWallets } from '@rainbow-me/rainbowkit'
import { 
  metaMaskWallet, 
  walletConnectWallet, 
  rainbowWallet, 
  coinbaseWallet 
} from '@rainbow-me/rainbowkit/wallets'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, createConfig } from 'wagmi'
import { filecoinCalibration } from 'wagmi/chains'

// Create a query client
const queryClient = new QueryClient()

// Configure wallet connectors
const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet,
      walletConnectWallet,
      rainbowWallet,
    ],
  },
], {
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '',
  appName: 'PixelNFT',
})

// Create Wagmi config for Filecoin Calibration Testnet
const config = createConfig({
  chains: [filecoinCalibration],
  transports: {
    [filecoinCalibration.id]: http(
      // Optional: Specify a custom RPC endpoint for Filecoin Calibration
      process.env.NEXT_PUBLIC_FILECOIN_CALIBRATION_RPC || 'https://api.calibration.node.glif.io/rpc/v0'
    )
  },
  connectors,
})

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#2ed573', // pixel-green from the theme
            accentColorForeground: 'black',
            borderRadius: 'small',
            fontStack: 'system'
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}