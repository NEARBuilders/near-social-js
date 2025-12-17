import { RouterProvider, createRouter } from '@tanstack/react-router';

import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx';

import { routeTree } from './routeTree.gen.ts';

import { SocialProvider } from './providers/index.tsx';
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
    <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
      <SocialProvider network="mainnet">
        <RouterProvider router={router} />
      </SocialProvider>
    </TanStackQueryProvider.Provider>
  );
}

export default App;
