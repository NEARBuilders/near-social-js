// @ts-ignore
import '../styles.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletProvider } from '../integrations/near-wallet';
import { RelayerProvider } from './relayer-provider';
import type { Network } from 'near-kit';

const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export interface SocialProviderProps {
  children: React.ReactNode;
  network?: Network;
  queryClient?: QueryClient;
}

export function SocialProvider({
  children,
  network = 'mainnet',
  queryClient = defaultQueryClient,
}: SocialProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider network={network}>
        <RelayerProvider>{children}</RelayerProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export { WalletProvider, QueryClientProvider, RelayerProvider };
export { useRelayer } from './relayer-provider';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}
