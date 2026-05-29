import { getAssetsUrl, getRuntimeConfig } from "./remote/runtime";

export async function hydrate() {
  console.log("[Hydrate] Starting...");

  let detectedRuntimeConfig: ReturnType<typeof getRuntimeConfig> | undefined;
  try {
    detectedRuntimeConfig = getRuntimeConfig() ?? undefined;
  } catch (error) {
    console.warn("[Hydrate] Failed to read runtime config:", error);
  }

  const runtimeConfig =
    detectedRuntimeConfig ??
    ({
      env: "development",
      account: "every.near",
      assetsUrl: new URL(import.meta.url).origin,
      apiBase: "/api",
      rpcBase: "/api/rpc",
    } as const);

  if (!detectedRuntimeConfig) {
    console.warn("[Hydrate] No runtime config found; using local dev fallback.");
  }

  const { createRoot, hydrateRoot } = await import("react-dom/client");
  const { RouterProvider } = await import("@tanstack/react-router");
  const { QueryClientProvider } = await import("@tanstack/react-query");
  const { WalletProvider } = await import("./integrations/near-wallet");
  const { ApiProvider } = await import("./providers/api-provider");
  const { createRouter } = await import("./router");

  const { router, queryClient } = createRouter({
    context: {
      assetsUrl: getAssetsUrl(runtimeConfig),
      runtimeConfig,
    },
  });

  const app = (
    <QueryClientProvider client={queryClient}>
      <WalletProvider network="mainnet">
        <ApiProvider>
          <RouterProvider router={router} />
        </ApiProvider>
      </WalletProvider>
    </QueryClientProvider>
  );

  const hasSsrBootstrap =
    typeof window !== "undefined" &&
    typeof (window as { $_TSR?: unknown }).$_TSR !== "undefined";

  if (hasSsrBootstrap) {
    const { RouterClient } = await import("@tanstack/react-router/ssr/client");
    console.log("[Hydrate] SSR bootstrap found, hydrating...");
    hydrateRoot(
      document,
      <QueryClientProvider client={queryClient}>
        <WalletProvider network="mainnet">
          <ApiProvider>
            <RouterClient router={router} />
          </ApiProvider>
        </WalletProvider>
      </QueryClientProvider>,
    );
  } else {
    console.log("[Hydrate] No SSR bootstrap, mounting SPA...");
    const rootEl = document.getElementById("root");
    if (!rootEl) {
      console.error("[Hydrate] Missing #root element");
      return;
    }
    createRoot(rootEl).render(app);
  }

  console.log("[Hydrate] Complete!");
}

export default hydrate;

if (typeof document !== "undefined") {
  void hydrate();
}
