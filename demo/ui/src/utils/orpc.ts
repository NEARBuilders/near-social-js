import type { AppRouterClient } from "@data-provider/api";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { onError } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

export const SERVER_URL = `${import.meta.env.VITE_SERVER_URL ?? "http://localhost:8787"}/api/rpc`;

export const ASSET_ENRICHMENT_URL = `${import.meta.env.VITE_ASSET_ENRICHMENT_URL ?? "http://localhost:6767"}/api/rpc`;

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      
    },
  }),
  defaultOptions: { queries: { staleTime: 60 * 1000 } },
});

/**
 * This creates an isomorphic oRPC client that works correctly in both
 * SSR (server-side rendering) and client-side environments.
 */
const getORPCClient = createIsomorphicFn()
  .server(() => {
    // Server-side: Use full server URL and forward headers/cookies
    const link = new RPCLink({
      url: SERVER_URL,
      headers: () => getRequestHeaders(), // Forward request headers
      interceptors: [
        onError((error) => {
          console.error("oRPC Server Error:", error);
          throw error;
        }),
      ],
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    });

    return createORPCClient(link);
  })
  .client(() => {
    // Client-side: Use browser relative URL with cookies
    const link = new RPCLink({
      url: SERVER_URL,
      interceptors: [
        onError((error) => {
          console.error("oRPC Client Error:", error);
        }),
      ],
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    });

    return createORPCClient(link);
  });

const getAssetEnrichmentClient = createIsomorphicFn()
  .server(() => {
    const link = new RPCLink({
      url: ASSET_ENRICHMENT_URL,
      headers: () => getRequestHeaders(),
      interceptors: [
        onError((error) => {
          console.error("oRPC Asset-Enrichment Server Error:", error);
          throw error;
        }),
      ],
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    });

    return createORPCClient(link);
  })
  .client(() => {
    const link = new RPCLink({
      url: ASSET_ENRICHMENT_URL,
      interceptors: [
        onError((error) => {
          console.error("oRPC Asset-Enrichment Client Error:", error);
        }),
      ],
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    });

    return createORPCClient(link);
  });

  // @ts-expect-error some mismatch
export const client: AppRouterClient = getORPCClient();

export const assetEnrichmentClient  = getAssetEnrichmentClient();

export const orpc = createTanstackQueryUtils(client);
