import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { NearConnector } from '@hot-labs/near-connect';
import { Near, fromHotConnect } from 'near-kit';

type NetworkId = 'mainnet' | 'testnet';

interface WalletContextType {
  near: Near | null;
  accountId: string | null;
  isConnecting: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

interface WalletProviderProps {
  children: ReactNode;
  network?: NetworkId;
}

export function WalletProvider({
  children,
  network = 'mainnet',
}: WalletProviderProps) {
  const [near, setNear] = useState<Near | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connector, setConnector] = useState<NearConnector | null>(null);

  useEffect(() => {
    const nearConnector = new NearConnector({ network });
    setConnector(nearConnector);

    nearConnector.on('wallet:signIn', async (data) => {
      const nearInstance = new Near({
        network,
        wallet: fromHotConnect(nearConnector),
      });

      setNear(nearInstance);
      setAccountId(data.accounts?.[0]?.accountId ?? null);
      setIsConnecting(false);
    });

    nearConnector.on('wallet:signOut', () => {
      setNear(null);
      setAccountId(null);
    });

    nearConnector.wallet().then(async (wallet) => {
      const accounts = await wallet.getAccounts();
      if (accounts && accounts.length > 0) {
        const nearInstance = new Near({
          network,
          wallet: fromHotConnect(nearConnector),
        });

        setNear(nearInstance);
        setAccountId(accounts[0]?.accountId ?? null);
      }
    });

    return () => {
      nearConnector.removeAllListeners();
    };
  }, [network]);

  const connect = useCallback(() => {
    if (connector) {
      setIsConnecting(true);
      connector.connect();
    }
  }, [connector]);

  const disconnect = useCallback(() => {
    if (connector) {
      connector.disconnect();
    }
  }, [connector]);

  return (
    <WalletContext.Provider
      value={{ near, accountId, isConnecting, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
