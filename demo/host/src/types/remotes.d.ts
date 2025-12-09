declare module 'near_social_js/App' {
  import type { FC } from 'react';
  export const App: FC;
  export default App;
}

declare module 'near_social_js/Router' {
  import type { FC } from 'react';
  export const AppRouter: FC;
  export default AppRouter;
}

declare module 'near_social_js/components' {
  import type { FC, ComponentType } from 'react';

  export const ProfileCard: FC<{ accountId?: string; profile?: Record<string, unknown> }>;
  export const ProfileAvatar: FC<{ accountId?: string; size?: number }>;
  export const ProfileEditDialog: FC<{ open?: boolean; onOpenChange?: (open: boolean) => void }>;
  export const JsonViewer: FC<{ data?: unknown }>;
  export const MethodCard: FC<{ title?: string; description?: string }>;
  export const ResponsePanel: FC<{ response?: unknown }>;
  export const WalletButton: FC;
  export const Logo: FC;

  export const Button: ComponentType<Record<string, unknown>>;
  export const Card: ComponentType<Record<string, unknown>>;
  export const Dialog: ComponentType<Record<string, unknown>>;
  export const Input: ComponentType<Record<string, unknown>>;
  export const Label: ComponentType<Record<string, unknown>>;
  export const ScrollArea: ComponentType<Record<string, unknown>>;
  export const Tabs: ComponentType<Record<string, unknown>>;
}

declare module 'near_social_js/profile' {
  import type { FC } from 'react';

  export interface Profile {
    name?: string;
    image?: { url?: string };
    description?: string;
    linktree?: Record<string, string>;
    tags?: Record<string, string>;
  }

  export const ProfileCard: FC<{ accountId?: string; profile?: Profile }>;
  export const ProfileAvatar: FC<{ accountId?: string; size?: number }>;
  export const ProfileEditDialog: FC<{ open?: boolean; onOpenChange?: (open: boolean) => void }>;
}

declare module 'near_social_js/providers' {
  import type { FC, PropsWithChildren } from 'react';

  export const SocialProvider: FC<PropsWithChildren<{ network?: 'mainnet' | 'testnet' }>>;
  export const WalletProvider: FC<PropsWithChildren<{ network?: 'mainnet' | 'testnet' }>>;
  export const QueryClientProvider: FC<PropsWithChildren>;
  export function createQueryClient(): unknown;
}

declare module 'near_social_js/hooks/social' {
  export function useSocial(): unknown;
  export function useProfile(accountId: string): { data?: unknown; isLoading: boolean };
  export function useFollowers(accountId: string): { data?: unknown; isLoading: boolean };
  export function useFollowing(accountId: string): { data?: unknown; isLoading: boolean };
}

declare module 'near_social_js/hooks/graph' {
  export function useGraph(): unknown;
  export function useGraphGet(options: unknown): { data?: unknown; isLoading: boolean };
  export function useGraphKeys(options: unknown): { data?: unknown; isLoading: boolean };
}

declare module 'near_social_js/hooks/wallet' {
  export function useWallet(): {
    accountId?: string;
    connect: () => void;
    disconnect: () => void;
    social?: unknown;
  };
}
