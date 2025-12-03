import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { NearConnector } from '@hot-labs/near-connect'
import { Near, fromHotConnect } from 'near-kit'
import { Social } from 'near-social-js'

type NetworkId = 'mainnet' | 'testnet'

interface WalletContextType {
  near: Near | null
  social: Social | null
  accountId: string | null
  isConnecting: boolean
  connect: () => void
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType | null>(null)

interface WalletProviderProps {
  children: ReactNode
  network?: NetworkId
}

export function WalletProvider({
  children,
  network = 'mainnet',
}: WalletProviderProps) {
  const [near, setNear] = useState<Near | null>(null)
  const [social, setSocial] = useState<Social | null>(null)
  const [accountId, setAccountId] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connector, setConnector] = useState<NearConnector | null>(null)

  useEffect(() => {
    const nearConnector = new NearConnector({ network })
    setConnector(nearConnector)

    nearConnector.on('wallet:signIn', async (data) => {
      const nearInstance = new Near({
        network,
        wallet: fromHotConnect(nearConnector),
      })

      const socialInstance = new Social({ near: nearInstance, network })

      setNear(nearInstance)
      setSocial(socialInstance)
      setAccountId(data.accounts?.[0]?.accountId ?? null)
      setIsConnecting(false)
    })

    nearConnector.on('wallet:signOut', () => {
      setNear(null)
      setSocial(null)
      setAccountId(null)
    })

    return () => {
      nearConnector.removeAllListeners()
    }
  }, [network])

  const connect = useCallback(() => {
    if (connector) {
      setIsConnecting(true)
      connector.connect()
    }
  }, [connector])

  const disconnect = useCallback(() => {
    if (connector) {
      connector.disconnect()
    }
  }, [connector])

  return (
    <WalletContext.Provider
      value={{ near, social, accountId, isConnecting, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
