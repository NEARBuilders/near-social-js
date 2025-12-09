import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import { Near, generateKey } from 'near-kit';
import { useWallet } from '../integrations/near-wallet';
import { useGraphInstance } from '../integrations/near-graph';

const DELEGATE_KEY_STORAGE = 'near_social_delegate_key';
const RELAYER_ENABLED_STORAGE = 'near_social_relayer_enabled';

interface RelayerContextValue {
  isRelayerEnabled: boolean;
  toggleRelayer: () => Promise<void>;
  delegatePublicKey: string | null;
  delegateNear: Near | null;
  deleteDelegateKey: () => void;
  isLoading: boolean;
  canToggle: boolean;
}

const RelayerContext = createContext<RelayerContextValue | null>(null);

export function RelayerProvider({ children }: { children: ReactNode }) {
  const [isRelayerEnabled, setRelayerEnabled] = useState(() => {
    const stored = localStorage.getItem(RELAYER_ENABLED_STORAGE);
    return stored === 'true';
  });
  const [delegatePrivateKey, setDelegatePrivateKey] = useState<string | null>(null);
  const [delegatePublicKey, setDelegatePublicKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { near: walletNear, accountId } = useWallet();
  const graph = useGraphInstance();

  useEffect(() => {
    const stored = localStorage.getItem(DELEGATE_KEY_STORAGE);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { privateKey: string; publicKey: string };
        const isValidKey = parsed.privateKey?.startsWith('ed25519:') || parsed.privateKey?.startsWith('secp256k1:');
        if (isValidKey && parsed.publicKey) {
          setDelegatePrivateKey(parsed.privateKey);
          setDelegatePublicKey(parsed.publicKey);
        } else {
          localStorage.removeItem(DELEGATE_KEY_STORAGE);
        }
      } catch {
        localStorage.removeItem(DELEGATE_KEY_STORAGE);
      }
    }
  }, []);

  useEffect(() => {
    if (!delegatePrivateKey) {
      const keyPair = generateKey();
      const privateKey = keyPair.secretKey.toString();
      const publicKey = keyPair.publicKey.toString();

      setDelegatePrivateKey(privateKey);
      setDelegatePublicKey(publicKey);

      localStorage.setItem(
        DELEGATE_KEY_STORAGE,
        JSON.stringify({ privateKey, publicKey })
      );
    }
  }, [delegatePrivateKey]);

  const delegateNear = useMemo(() => {
    if (!delegatePrivateKey) return null;
    if (!delegatePrivateKey.startsWith('ed25519:') && !delegatePrivateKey.startsWith('secp256k1:')) {
      return null;
    }
    return new Near({
      network: 'mainnet',
      privateKey: delegatePrivateKey as `ed25519:${string}`,
    });
  }, [delegatePrivateKey]);

  const checkKeyRegistered = useCallback(async (): Promise<boolean> => {
    if (!accountId || !delegatePublicKey) return false;
    try {
      const result = await graph.isWritePermissionGranted({
        key: `${accountId}/`,
        granteePublicKey: delegatePublicKey,
      });
      return result;
    } catch {
      return false;
    }
  }, [accountId, delegatePublicKey, graph]);

  const toggleRelayer = useCallback(async () => {
    if (isRelayerEnabled) {
      setRelayerEnabled(false);
      localStorage.setItem(RELAYER_ENABLED_STORAGE, 'false');
      return;
    }

    if (!walletNear || !accountId || !delegatePublicKey) {
      throw new Error('Wallet not connected or delegate key not initialized');
    }

    setIsLoading(true);
    try {
      const isRegistered = await checkKeyRegistered();

      if (!isRegistered) {
        console.log("key", delegatePublicKey);
        const contractId = graph.getContractId();
        console.log("contract", contractId);
        const txBuilder = walletNear.transaction(accountId).addKey(delegatePublicKey, {
          type: 'functionCall',
          receiverId: contractId,
          methodNames: [],
          allowance: '0.25 NEAR',
        });
        console.log("tx", txBuilder);
        await txBuilder.send();
      }

      setRelayerEnabled(true);
      localStorage.setItem(RELAYER_ENABLED_STORAGE, 'true');
    } finally {
      setIsLoading(false);
    }
  }, [isRelayerEnabled, walletNear, accountId, delegatePublicKey, graph, checkKeyRegistered]);

  const deleteDelegateKey = useCallback(() => {
    localStorage.removeItem(DELEGATE_KEY_STORAGE);
    localStorage.setItem(RELAYER_ENABLED_STORAGE, 'false');
    setDelegatePrivateKey(null);
    setDelegatePublicKey(null);
    setRelayerEnabled(false);
  }, []);

  const canToggle = isRelayerEnabled || (!!walletNear && !!accountId && !!delegatePublicKey);

  return (
    <RelayerContext.Provider
      value={{
        isRelayerEnabled,
        toggleRelayer,
        delegatePublicKey,
        delegateNear,
        deleteDelegateKey,
        isLoading,
        canToggle,
      }}
    >
      {children}
    </RelayerContext.Provider>
  );
}

export function useRelayer() {
  const context = useContext(RelayerContext);
  if (!context) {
    throw new Error('useRelayer must be used within a RelayerProvider');
  }
  return context;
}
