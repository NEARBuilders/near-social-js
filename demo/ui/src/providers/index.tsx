// @ts-ignore
import '../styles.css';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Network } from "near-kit";
import { WalletProvider } from "../integrations/near-wallet";
import { ApiProvider } from "./api-provider";

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
        <ApiProvider>{children}</ApiProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export { WalletProvider, QueryClientProvider, ApiProvider };
export { useApi } from "./api-provider";

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
