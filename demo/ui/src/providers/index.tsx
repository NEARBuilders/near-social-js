import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletProvider } from '../integrations/near-wallet';
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
      <WalletProvider network={network}>{children}</WalletProvider>
    </QueryClientProvider>
  );
}

export { WalletProvider, QueryClientProvider };

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
