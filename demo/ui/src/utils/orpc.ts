import { createORPCClient, onError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import type { ContractRouterClient } from "@orpc/contract";
import type { contract } from "../../../relayer/src/contract";

export const RELAYER_URL = `${import.meta.env.VITE_RELAYER_URL ?? "http://localhost:3014"}/api/rpc`;

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: () => { },
  }),
  defaultOptions: { queries: { staleTime: 60 * 1000 } },
});

function createRelayerLink() {
  return new RPCLink({
    url: RELAYER_URL,
    interceptors: [
      onError((error: unknown) => {
        console.error("oRPC Relayer Error:", error);
      }),
    ],
    fetch(url, options) {
      return fetch(url, {
        ...options,
        // credentials: "include",
      });
    },
  });
}

export type RelayerContract = typeof contract;
export type RelayerClient = ContractRouterClient<RelayerContract>;

export const relayerClient: RelayerClient = createORPCClient(createRelayerLink());
