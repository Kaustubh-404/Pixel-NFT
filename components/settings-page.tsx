"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useWallet } from "@/components/wallet-provider"
import { PixelHeading } from "@/components/pixel-heading"
import { PixelatedBackground } from "@/components/pixelated-background"
import { Eye, EyeOff, Bell, BellOff, Shield, Zap, Image, Upload, Download, Globe } from "lucide-react"

export default function SettingsPage() {
  const { isConnected, connect, address } = useWallet()
  const { toast } = useToast()
  
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [twitter, setTwitter] = useState("")
  const [discord, setDiscord] = useState("")
  const [showEmail, setShowEmail] = useState(false)
  
  const [notifications, setNotifications] = useState({
    sales: true,
    newItems: true,
    priceChanges: false,
    auctionEnding: true,
    newsletter: false
  })
  
  const [security, setSecurity] = useState({
    twoFactor: false,
    activityNotifications: true,
    emailConfirmation: true,
    loginAlerts: true,
    approvalRequests: true
  })
  
  const [display, setDisplay] = useState({
    darkMode: true,
    showBalance: true,
    pixelEffects: true,
    animations: true,
    highContrast: false,
    compactView: false
  })
  
  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showActivity: true,
    showCollections: true,
    showFollowers: false
  })
  
  const [walletSettings, setWalletSettings] = useState({
    autoConnect: true,
    confirmTransactions: true,
    hideSmallBalances: true,
    showTestnets: false
  })

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated."
    })
  }

  const handleConnect = async () => {
    try {
      await connect()
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect wallet",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="relative">
      <PixelatedBackground />
      
      <PixelHeading
        text="Settings"
        className="text-2xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pixel-green to-pixel-blue"
      />

      {!isConnected ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-900/80 rounded-none border border-gray-800 pixel-corners relative z-10">
          <p className="text-gray-400 mb-4 font-pixel text-xs">Connect your wallet to view and update settings</p>
          <Button
            onClick={handleConnect}
            className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
          >
            <span className="font-pixel text-xs">CONNECT WALLET</span>
          </Button>
        </div>
      ) : (
        <div className="relative z-10">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="bg-gray-900/80 border-gray-800 w-full rounded-none pixel-corners mb-6">
              <TabsTrigger 
                value="profile" 
                className="flex-1 data-[state=active]:bg-gray-800 rounded-none font-pixel text-xs"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="flex-1 data-[state=active]:bg-gray-800 rounded-none font-pixel text-xs"
              >
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="wallet" 
                className="flex-1 data-[state=active]:bg-gray-800 rounded-none font-pixel text-xs"
              >
                Wallet
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="flex-1 data-[state=active]:bg-gray-800 rounded-none font-pixel text-xs"
              >
                Security
              </TabsTrigger>
              <TabsTrigger 
                value="display" 
                className="flex-1 data-[state=active]:bg-gray-800 rounded-none font-pixel text-xs"
              >
                Display
              </TabsTrigger>
              <TabsTrigger 
                value="privacy" 
                className="flex-1 data-[state=active]:bg-gray-800 rounded-none font-pixel text-xs"
              >
                Privacy
              </TabsTrigger>
            </TabsList>
            
            {/* Profile Settings Tab */}
            <TabsContent value="profile">
              <Card className="bg-gray-900/80 border-gray-800 rounded-none pixel-corners">
                <CardHeader>
                  <CardTitle className="font-pixel text-sm">Profile Settings</CardTitle>
                  <CardDescription>Manage your public profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="w-full sm:w-24 h-24 relative bg-gray-800 rounded-none pixel-corners border border-gray-700 flex items-center justify-center">
                      <Image className="w-10 h-10 text-gray-600" />
                      <div className="absolute -bottom-2 -right-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 rounded-none pixel-corners p-0 bg-gray-800 border-gray-700"
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium font-pixel text-xs">Username</label>
                        <Input 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Enter username"
                          className="bg-gray-800/80 border-gray-700 rounded-none pixel-corners"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium font-pixel text-xs">Bio</label>
                        <Input 
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell others about yourself"
                          className="bg-gray-800/80 border-gray-700 rounded-none pixel-corners"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium font-pixel text-xs">Email</label>
                    <div className="flex items-center gap-2">
                      <Input 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email"
                        className="bg-gray-800/80 border-gray-700 rounded-none pixel-corners"
                        type={showEmail ? "text" : "password"}
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => setShowEmail(!showEmail)}
                        className="bg-gray-800/80 border-gray-700 rounded-none pixel-corners"
                      >
                        {showEmail ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Your email will not be displayed publicly</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium font-pixel text-xs">Twitter</label>
                      <Input 
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        placeholder="@username"
                        className="bg-gray-800/80 border-gray-700 rounded-none pixel-corners"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium font-pixel text-xs">Discord</label>
                      <Input 
                        value={discord}
                        onChange={(e) => setDiscord(e.target.value)}
                        placeholder="username#0000"
                        className="bg-gray-800/80 border-gray-700 rounded-none pixel-corners"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium font-pixel text-xs">Connected Address</label>
                    <div className="flex items-center gap-2">
                      <Input 
                        value={address || "0x0000...0000"}
                        readOnly
                        className="bg-gray-800/80 border-gray-700 rounded-none pixel-corners font-mono"
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => {
                          navigator.clipboard.writeText(address || "");
                          toast({
                            title: "Address copied",
                            description: "Wallet address copied to clipboard"
                          });
                        }}
                        className="bg-gray-800/80 border-gray-700 rounded-none pixel-corners"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveProfile}
                      className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
                    >
                      <span className="font-pixel text-xs">SAVE CHANGES</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card className="bg-gray-900/80 border-gray-800 rounded-none pixel-corners">
                <CardHeader>
                  <CardTitle className="font-pixel text-sm">Notification Settings</CardTitle>
                  <CardDescription>Control when and how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {[
                      { id: 'sales', label: 'Sales & Purchases', description: 'Get notified when your NFTs are sold or when you purchase new ones', icon: <Zap className="h-4 w-4 text-pixel-green" /> },
                      { id: 'newItems', label: 'New Items', description: 'Get notified when new items are added to collections you follow', icon: <Bell className="h-4 w-4 text-pixel-blue" /> },
                      { id: 'priceChanges', label: 'Price Changes', description: 'Get notified when prices change on NFTs you are watching', icon: <Bell className="h-4 w-4 text-pixel-blue" /> },
                      { id: 'auctionEnding', label: 'Auction Ending', description: 'Get notified when auctions you are participating in are ending soon', icon: <Bell className="h-4 w-4 text-pixel-blue" /> },
                      { id: 'newsletter', label: 'Newsletter', description: 'Receive updates about new features and platform changes', icon: <BellOff className="h-4 w-4 text-gray-400" /> }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <div>
                            <h4 className="text-sm font-medium">{item.label}</h4>
                            <p className="text-xs text-gray-400">{item.description}</p>
                          </div>
                        </div>
                        <Switch 
                          checked={notifications[item.id as keyof typeof notifications]}
                          onCheckedChange={(checked) => setNotifications({...notifications, [item.id]: checked})}
                          className="data-[state=checked]:bg-pixel-green"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => toast({
                        title: "Notification settings updated",
                        description: "Your notification preferences have been saved."
                      })}
                      className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
                    >
                      <span className="font-pixel text-xs">SAVE CHANGES</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Wallet Settings Tab */}
            <TabsContent value="wallet">
              <Card className="bg-gray-900/80 border-gray-800 rounded-none pixel-corners">
                <CardHeader>
                  <CardTitle className="font-pixel text-sm">Wallet Settings</CardTitle>
                  <CardDescription>Manage your wallet preferences and connections</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-none pixel-corners bg-gray-800/80 border border-gray-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold">Connected Wallet</p>
                        <p className="text-sm text-gray-400 font-mono">{address || "0x0000...0000"}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="bg-gray-700/50 border-gray-600 rounded-none pixel-corners text-xs font-pixel"
                        onClick={() => toast({
                          title: "Action required",
                          description: "Please reconnect your wallet to disconnect.",
                        })}
                      >
                        DISCONNECT
                      </Button>
                    </div>
                  </div>
                
                  <div className="space-y-4">
                    {[
                      { id: 'autoConnect', label: 'Auto-connect Wallet', description: 'Automatically connect to your wallet when you visit the platform' },
                      { id: 'confirmTransactions', label: 'Confirm All Transactions', description: 'Always require confirmation before submitting blockchain transactions' },
                      { id: 'hideSmallBalances', label: 'Hide Small Balances', description: 'Hide tokens with small balances from your wallet view' },
                      { id: 'showTestnets', label: 'Show Testnet Networks', description: 'Display testnet networks in network selection' }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">{item.label}</h4>
                          <p className="text-xs text-gray-400">{item.description}</p>
                        </div>
                        <Switch 
                          checked={walletSettings[item.id as keyof typeof walletSettings]}
                          onCheckedChange={(checked) => setWalletSettings({...walletSettings, [item.id]: checked})}
                          className="data-[state=checked]:bg-pixel-green"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-gray-800/80 border-gray-700 rounded-none pixel-corners"
                      onClick={() => toast({
                        title: "Export completed",
                        description: "Your transaction history has been downloaded."
                      })}
                    >
                      <span>Export Transaction History</span>
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-between bg-gray-800/80 border-gray-700 rounded-none pixel-corners"
                      onClick={() => toast({
                        title: "Coming soon",
                        description: "Multiple wallet support will be available soon."
                      })}
                    >
                      <span>Connect Additional Wallet</span>
                      <Wallet className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => toast({
                        title: "Wallet settings updated",
                        description: "Your wallet preferences have been saved."
                      })}
                      className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
                    >
                      <span className="font-pixel text-xs">SAVE CHANGES</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Security Tab */}
            <TabsContent value="security">
              <Card className="bg-gray-900/80 border-gray-800 rounded-none pixel-corners">
                <CardHeader>
                  <CardTitle className="font-pixel text-sm">Security Settings</CardTitle>
                  <CardDescription>Manage your account security preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {[
                      { id: 'twoFactor', label: 'Two-Factor Authentication', description: 'Require a security code in addition to your password', icon: <Shield className="h-4 w-4 text-pixel-green" /> },
                      { id: 'activityNotifications', label: 'Activity Notifications', description: 'Get notified about suspicious account activity', icon: <Shield className="h-4 w-4 text-pixel-green" /> },
                      { id: 'emailConfirmation', label: 'Email Confirmation', description: 'Require email confirmation for important actions', icon: <Shield className="h-4 w-4 text-pixel-green" /> },
                      { id: 'loginAlerts', label: 'Login Alerts', description: 'Receive alerts when your account is accessed from a new device', icon: <Shield className="h-4 w-4 text-pixel-green" /> },
                      { id: 'approvalRequests', label: 'Transaction Approvals', description: 'Require explicit approval for all transactions above 1 FIL', icon: <Shield className="h-4 w-4 text-pixel-green" /> }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <div>
                            <h4 className="text-sm font-medium">{item.label}</h4>
                            <p className="text-xs text-gray-400">{item.description}</p>
                          </div>
                        </div>
                        <Switch 
                          checked={security[item.id as keyof typeof security]}
                          onCheckedChange={(checked) => setSecurity({...security, [item.id]: checked})}
                          className="data-[state=checked]:bg-pixel-green"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 border border-gray-700 rounded-none bg-gray-800/50 pixel-corners">
                    <h4 className="font-medium mb-2">Recovery Methods</h4>
                    <p className="text-sm text-gray-400 mb-3">Set up recovery methods to help secure your account</p>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start bg-gray-700/50 border-gray-600 rounded-none pixel-corners"
                        onClick={() => toast({
                          title: "Feature coming soon",
                          description: "Recovery phrase setup will be available soon."
                        })}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        <span className="font-pixel text-xs">SETUP RECOVERY PHRASE</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start bg-gray-700/50 border-gray-600 rounded-none pixel-corners"
                        onClick={() => toast({
                          title: "Feature coming soon",
                          description: "Backup wallet setup will be available soon."
                        })}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        <span className="font-pixel text-xs">BACKUP WALLET</span>
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => toast({
                        title: "Security settings updated",
                        description: "Your security preferences have been saved."
                      })}
                      className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
                    >
                      <span className="font-pixel text-xs">SAVE CHANGES</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Display Tab */}
            <TabsContent value="display">
              <Card className="bg-gray-900/80 border-gray-800 rounded-none pixel-corners">
                <CardHeader>
                  <CardTitle className="font-pixel text-sm">Display Settings</CardTitle>
                  <CardDescription>Customize how the PixelNFT platform looks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {[
                      { id: 'darkMode', label: 'Dark Mode', description: 'Use dark theme throughout the application' },
                      { id: 'showBalance', label: 'Show Balance', description: 'Display your wallet balance in the header' },
                      { id: 'pixelEffects', label: 'Pixel Effects', description: 'Enable pixel art effects throughout the UI' },
                      { id: 'animations', label: 'Animations', description: 'Enable UI animations and transitions' },
                      { id: 'highContrast', label: 'High Contrast', description: 'Increase contrast for better visibility' },
                      { id: 'compactView', label: 'Compact View', description: 'Use a more compact layout throughout the app' }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">{item.label}</h4>
                          <p className="text-xs text-gray-400">{item.description}</p>
                        </div>
                        <Switch 
                          checked={display[item.id as keyof typeof display]}
                          onCheckedChange={(checked) => setDisplay({...display, [item.id]: checked})}
                          className="data-[state=checked]:bg-pixel-green"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button variant="outline" className="bg-gray-900 border-2 border-pixel-green rounded-none pixel-corners h-16">
                      <span className="font-pixel text-xs text-pixel-green">PIXEL GREEN</span>
                    </Button>
                    
                    <Button variant="outline" className="bg-gray-900 border-2 border-pixel-blue rounded-none pixel-corners h-16">
                      <span className="font-pixel text-xs text-pixel-blue">PIXEL BLUE</span>
                    </Button>
                    
                    <Button variant="outline" className="bg-gray-900 border-2 border-gold rounded-none pixel-corners h-16 gold-gradient">
                      <span className="font-pixel text-xs text-black">GOLD THEME</span>
                    </Button>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => toast({
                        title: "Display settings updated",
                        description: "Your display preferences have been saved."
                      })}
                      className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
                    >
                      <span className="font-pixel text-xs">SAVE CHANGES</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Privacy Tab */}
            <TabsContent value="privacy">
              <Card className="bg-gray-900/80 border-gray-800 rounded-none pixel-corners">
                <CardHeader>
                  <CardTitle className="font-pixel text-sm">Privacy Settings</CardTitle>
                  <CardDescription>Control what information is visible to other users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {[
                      { id: 'publicProfile', label: 'Public Profile', description: 'Allow others to view your profile and NFT collection' },
                      { id: 'showActivity', label: 'Activity History', description: 'Make your buying and selling activity visible to others' },
                      { id: 'showCollections', label: 'Collections', description: 'Display collections you have created or contributed to' },
                      { id: 'showFollowers', label: 'Followers & Following', description: 'Show your social connections on the platform' }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">{item.label}</h4>
                          <p className="text-xs text-gray-400">{item.description}</p>
                        </div>
                        <Switch 
                          checked={privacy[item.id as keyof typeof privacy]}
                          onCheckedChange={(checked) => setPrivacy({...privacy, [item.id]: checked})}
                          className="data-[state=checked]:bg-pixel-green"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 border border-gray-700 rounded-none bg-gray-800/50 pixel-corners">
                    <h4 className="font-medium mb-2">Data Management</h4>
                    <p className="text-sm text-gray-400 mb-3">Control your personal data on PixelNFT</p>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start bg-gray-700/50 border-gray-600 rounded-none pixel-corners"
                        onClick={() => toast({
                          title: "Data export initiated",
                          description: "We'll email you when your data is ready to download."
                        })}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        <span className="font-pixel text-xs">REQUEST DATA EXPORT</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start bg-gray-700/50 border-red-900/30 text-red-400 rounded-none pixel-corners"
                        onClick={() => toast({
                          title: "Request submitted",
                          description: "We've received your account deletion request."
                        })}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        <span className="font-pixel text-xs">DELETE ACCOUNT</span>
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => toast({
                        title: "Privacy settings updated",
                        description: "Your privacy preferences have been saved."
                      })}
                      className="bg-pixel-green hover:bg-pixel-green/80 text-black font-pixel rounded-none pixel-corners pixel-btn"
                    >
                      <span className="font-pixel text-xs">SAVE CHANGES</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}

// This is needed for the Trash icon
import { Trash, Copy, Wallet } from "lucide-react"