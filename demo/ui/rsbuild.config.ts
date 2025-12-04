import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { TanStackRouterRspack } from '@tanstack/router-plugin/rspack';
import pkg from './package.json';

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/main.tsx',
      remote: './src/remote.tsx',
    },
  },
  resolve: {
    alias: {
      '@': './src',
      'near-social-js': '../../src/index.ts',
    },
  },
  html: {
    template: './index.html',
  },
  server: {
    port: 3000,
  },
  tools: {
    rspack: {
      target: 'web',
      externalsType: 'module',
      externals: {
        fs: 'commonjs fs',
        path: 'commonjs path',
        crypto: 'commonjs crypto',
        'node:fs': 'commonjs node:fs',
        'node:fs/promises': 'commonjs node:fs/promises',
        'node:path': 'commonjs node:path',
        'node:crypto': 'commonjs node:crypto',
      },
      plugins: [
        TanStackRouterRspack({
          target: 'react',
          autoCodeSplitting: true,
        }),
        new ModuleFederationPlugin({
          name: 'near_social_js',
          filename: 'remoteEntry.js',
          dts: false,
          exposes: {
            './App': './src/bootstrap.tsx',
            './components': './src/components/index.ts',
            './profile': './src/components/profile/index.ts',
            './providers': './src/providers/index.tsx',
            './hooks/social': './src/integrations/near-social/hooks.ts',
            './hooks/graph': './src/integrations/near-graph/hooks.ts',
            './hooks/wallet': './src/integrations/near-wallet/index.ts',
            './types': './src/types/index.ts',
          },
          shared: {
            react: {
              singleton: true,
              eager: true,
              requiredVersion: pkg.dependencies.react,
            },
            'react-dom': {
              singleton: true,
              eager: true,
              requiredVersion: pkg.dependencies['react-dom'],
            },
            '@tanstack/react-query': {
              singleton: true,
              eager: true,
              requiredVersion: pkg.dependencies['@tanstack/react-query'],
            },
            '@tanstack/react-router': {
              singleton: true,
              eager: true,
              requiredVersion: pkg.dependencies['@tanstack/react-router'],
            },
            'near-kit': {
              singleton: true,
              eager: true,
              requiredVersion: pkg.dependencies['near-kit'],
            },
          },
        }),
      ],
    },
  },
  output: {
    assetPrefix: 'auto',
  },
});
