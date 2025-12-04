# Module Federation Guide

This demo app is built with Rsbuild and Module Federation, allowing it to run as a standalone application or expose its modules to be consumed by other applications.

## Remote Configuration

**Remote Name:** `near_social_js`
**Entry Point:** `http://localhost:3000/remoteEntry.js` (dev) or `https://your-domain.com/remoteEntry.js` (production)

## Exposed Modules

### 1. Full Application

```typescript
// Import the complete app with routing
import { App } from 'near_social_js/App';
```

### 2. Component Library

```typescript
// Import all components
import {
  ProfileCard,
  ProfileAvatar,
  ProfileEditDialog,
  JsonViewer,
  MethodCard,
  ResponsePanel,
  WalletButton,
  Logo,
  Button,
  Card,
  Dialog,
  Input,
  Label,
  ScrollArea,
  Tabs,
} from 'near_social_js/components';
```

### 3. Profile Components (Focused Export)

```typescript
// Import only profile-related components
import { ProfileCard, ProfileAvatar, ProfileEditDialog } from 'near_social_js/profile';
import type { Profile } from 'near_social_js/profile';
```

### 4. Providers

```typescript
// Import providers for wrapping components
import { SocialProvider, WalletProvider, QueryClientProvider, createQueryClient } from 'near_social_js/providers';

// Usage
<SocialProvider network="mainnet">
  <YourApp />
</SocialProvider>
```

### 5. Hooks

```typescript
// Social hooks
import { useSocial, useProfile, useFollowers, useFollowing } from 'near_social_js/hooks/social';

// Graph hooks
import { useGraph, useGraphGet, useGraphKeys } from 'near_social_js/hooks/graph';

// Wallet hooks
import { useWallet } from 'near_social_js/hooks/wallet';
```

### 6. TypeScript Types

```typescript
// Import types
import type {
  Profile,
  Post,
  GraphOptions,
  GetOptions,
  SetOptions,
  Network,
} from 'near_social_js/types';
```

## Host Application Setup

### 1. Install Dependencies

```bash
npm install @module-federation/enhanced
```

### 2. Configure Rsbuild in Host App

```typescript
// rsbuild.config.ts in host app
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

export default defineConfig({
  plugins: [pluginReact()],
  tools: {
    rspack: {
      plugins: [
        new ModuleFederationPlugin({
          name: 'host_app',
          remotes: {
            near_social_js: 'near_social_js@http://localhost:3000/remoteEntry.js',
          },
          shared: {
            react: { singleton: true },
            'react-dom': { singleton: true },
            '@tanstack/react-query': { singleton: true },
            'near-kit': { singleton: true },
            'near-social-js': { singleton: true },
          },
        }),
      ],
    },
  },
});
```

## Usage Examples

### Example 1: Using Profile Components

```tsx
import { SocialProvider } from 'near_social_js/providers';
import { ProfileCard } from 'near_social_js/profile';
import { useProfile } from 'near_social_js/hooks/social';

function UserProfile({ accountId }: { accountId: string }) {
  const { data: profile, isLoading } = useProfile(accountId);

  if (isLoading) return <div>Loading...</div>;

  return (
    <SocialProvider network="mainnet">
      <ProfileCard accountId={accountId} profile={profile} />
    </SocialProvider>
  );
}
```

### Example 2: Using Wallet Integration

```tsx
import { WalletProvider } from 'near_social_js/providers';
import { useWallet } from 'near_social_js/hooks/wallet';
import { ProfileCard } from 'near_social_js/profile';

function MyApp() {
  const { accountId, connect, disconnect, social } = useWallet();

  return (
    <WalletProvider network="mainnet">
      <div>
        {accountId ? (
          <>
            <p>Connected: {accountId}</p>
            <button onClick={disconnect}>Disconnect</button>
          </>
        ) : (
          <button onClick={connect}>Connect Wallet</button>
        )}
      </div>
    </WalletProvider>
  );
}
```

### Example 3: Using Full App

```tsx
import { App } from 'near_social_js/App';

function HostApp() {
  return (
    <div>
      <h1>My Host Application</h1>
      <App />
    </div>
  );
}
```

## Shared Dependencies

The following dependencies are configured as singletons to ensure only one instance is used across all federated modules:

- `react` (^19.2.0)
- `react-dom` (^19.2.0)
- `@tanstack/react-query` (^5.66.5)
- `@tanstack/react-router` (^1.132.0)
- `near-kit` (^0.5.2)
- `near-social-js` (*)

Ensure your host application has compatible versions of these dependencies.

## Development

### Running Standalone

```bash
cd demo
npm install
npm run dev
```

Visit http://localhost:3000 to see the standalone app.

### Building for Production

```bash
npm run build
```

The build output will include `remoteEntry.js` which can be deployed and consumed by other applications.

### Building Type Definitions

```bash
npm run build:types
```

Type definitions will be generated in `dist/types` directory.

## Network Configuration

The demo app defaults to NEAR `mainnet`. To use `testnet`:

```tsx
<SocialProvider network="testnet">
  {/* Your components */}
</SocialProvider>
```

Or when using WalletProvider directly:

```tsx
<WalletProvider network="testnet">
  {/* Your components */}
</WalletProvider>
```

## Notes

- All profile components require the `near-social-js` SDK and a connected wallet for write operations
- Components use Tailwind CSS v4 - ensure your host app supports modern CSS features
- The full app includes TanStack Router for file-based routing
- Components are designed to be used with the provided `SocialProvider` for proper context
