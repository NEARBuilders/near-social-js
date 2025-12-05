import { StrictMode } from 'react';
import { RouterProvider, createRouter } from '@tanstack/react-router';

import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx';
import { WalletProvider } from './integrations/near-wallet/index.ts';

import { routeTree } from './routeTree.gen.ts';

import './styles.css';

const TanStackQueryProviderContext = TanStackQueryProvider.getContext();
const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProviderContext,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return (
    <StrictMode>
      <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
        <WalletProvider network="mainnet">
          <RouterProvider router={router} />
        </WalletProvider>
      </TanStackQueryProvider.Provider>
    </StrictMode>
  );
}

export default App;
