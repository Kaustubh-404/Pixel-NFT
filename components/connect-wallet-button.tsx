// // components/connect-wallet-button.tsx
// 'use client'

// import { ConnectButton } from '@rainbow-me/rainbowkit'
// import { Button } from '@/components/ui/button'
// import { Wallet } from 'lucide-react'
// import { PixelIcon } from '@/components/pixel-icon'
// import { useToast } from '@/components/ui/use-toast'
// import { useState } from 'react'
// import { useNetwork, useSwitchNetwork } from 'wagmi'
// import { filecoinCalibration } from 'wagmi/chains'

// export function ConnectWalletButton() {
//   const { toast } = useToast()
//   const { chain } = useNetwork()
//   const { switchNetwork } = useSwitchNetwork()
//   const [isConnecting, setIsConnecting] = useState(false)

//   // Function to ensure user is on Filecoin Calibration (testnet)
//   const ensureCorrectNetwork = () => {
//     if (chain?.id !== filecoinCalibration.id && switchNetwork) {
//       setIsConnecting(true)
      
//       switchNetwork(filecoinCalibration.id)
//       toast({
//         title: "Switching network",
//         description: "Please approve switching to Filecoin Calibration testnet",
//       })
      
//       setTimeout(() => setIsConnecting(false), 3000)
//     }
//   }

//   return (
//     <ConnectButton.Custom>
//       {({
//         account,
//         chain,
//         openAccountModal,
//         openChainModal,
//         openConnectModal,
//         mounted,
//       }) => {
//         const ready = mounted
//         const connected = ready && account && chain

//         return (
//           <div
//             {...(!ready && {
//               'aria-hidden': true,
//               style: {
//                 opacity: 0,
//                 pointerEvents: 'none',
//                 userSelect: 'none',
//               },
//             })}
//           >
//             {(() => {
//               if (!connected) {
//                 return (
//                   <Button
//                     onClick={openConnectModal}
//                     className="bg-pixel-blue hover:bg-pixel-blue/80 text-white rounded-none pixel-corners pixel-btn"
//                     disabled={isConnecting}
//                   >
//                     {isConnecting ? (
//                       <div className="pixel-loader mr-2 h-4 w-4"></div>
//                     ) : (
//                       <PixelIcon icon={Wallet} className="h-4 w-4 mr-2" />
//                     )}
//                     <span className="font-pixel text-xs">CONNECT</span>
//                   </Button>
//                 )
//               }

//               if (chain.unsupported) {
//                 return (
//                   <Button
//                     onClick={openChainModal}
//                     className="bg-destructive hover:bg-destructive/80 text-white rounded-none pixel-corners pixel-btn"
//                   >
//                     <span className="font-pixel text-xs">WRONG NETWORK</span>
//                   </Button>
//                 )
//               }

//               // Otherwise connected and on the right network
//               return (
//                 <Button
//                   onClick={openAccountModal}
//                   className="bg-pixel-green hover:bg-pixel-green/80 text-black rounded-none pixel-corners pixel-btn"
//                 >
//                   <PixelIcon icon={Wallet} className="h-4 w-4 mr-2" />
//                   <span className="hidden md:inline font-pixel text-xs">
//                     {account.displayName}
//                     {account.displayBalance ? ` (${account.displayBalance})` : ''}
//                   </span>
//                 </Button>
//               )
//             })()}
//           </div>
//         )
//       }}
//     </ConnectButton.Custom>
//   )
// }



// components/connect-wallet-button.tsx
'use client'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'
import { PixelIcon } from '@/components/pixel-icon'
import { useToast } from '@/components/ui/use-toast'
import { useState } from 'react'
import { useChainId, useSwitchChain } from 'wagmi'
import { filecoinCalibration } from 'wagmi/chains'

export function ConnectWalletButton() {
  const { toast } = useToast()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [isConnecting, setIsConnecting] = useState(false)

  // Function to ensure user is on Filecoin Calibration (testnet)
  const ensureCorrectNetwork = () => {
    if (chainId !== filecoinCalibration.id && switchChain) {
      setIsConnecting(true)
     
      switchChain({ chainId: filecoinCalibration.id })
      toast({
        title: "Switching network",
        description: "Please approve switching to Filecoin Calibration testnet",
      })
     
      setTimeout(() => setIsConnecting(false), 3000)
    }
  }

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted
        const connected = ready && account && chain
        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    className="bg-pixel-blue hover:bg-pixel-blue/80 text-white rounded-none pixel-corners pixel-btn"
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <div className="pixel-loader mr-2 h-4 w-4"></div>
                    ) : (
                      <PixelIcon icon={Wallet} className="h-4 w-4 mr-2" />
                    )}
                    <span className="font-pixel text-xs">CONNECT</span>
                  </Button>
                )
              }
              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    className="bg-destructive hover:bg-destructive/80 text-white rounded-none pixel-corners pixel-btn"
                  >
                    <span className="font-pixel text-xs">WRONG NETWORK</span>
                  </Button>
                )
              }
              // Otherwise connected and on the right network
              return (
                <Button
                  onClick={openAccountModal}
                  className="bg-pixel-green hover:bg-pixel-green/80 text-black rounded-none pixel-corners pixel-btn"
                >
                  <PixelIcon icon={Wallet} className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline font-pixel text-xs">
                    {account.displayName}
                    {account.displayBalance ? ` (${account.displayBalance})` : ''}
                  </span>
                </Button>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}