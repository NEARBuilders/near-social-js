# near-social-js UI

Interactive demo application showcasing the capabilities of the [near-social-js](https://github.com/NEARBuilders/near-social-js) TypeScript SDK for interacting with [NEAR Social](https://near.social) (`social.near` contract).

## Module Federation

This package is configured as a Module Federation **remote**, exposing components, hooks, and providers that can be consumed by host applications. It also provides a [shadcn/ui registry](https://ui.shadcn.com/docs/registry) for easy component installation.

### Exposed Modules

- `./App` - Main application entry point
- `./components` - UI components (ProfileCard, ProfileAvatar, WalletButton, etc.)
- `./providers` - React context providers (SocialProvider)
- `./hooks/social` - NEAR Social data hooks
- `./hooks/graph` - Graph data hooks
- `./hooks/wallet` - Wallet connection hooks

### Component Registry

Install components via shadcn CLI:

```bash
npx shadcn@latest add -r <remote-url> profile-card
```

## Getting Started

Install dependencies:

```bash
bun install
```

Run the development server:

```bash
bun dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Building for Production

```bash
bun run build
```

## Tech Stack

- **[TanStack Router](https://tanstack.com/router)** - File-based routing
- **[TanStack Query](https://tanstack.com/query)** - Data fetching and state management
- **[React](https://react.dev)** - UI library
- **[Tailwind CSS](https://tailwindcss.com)** - Styling
- **[Rsbuild](https://rsbuild.dev)** - Build tool
- **[near-social-js](https://nearbuilders.github.io/near-social-js)** - NEAR social contract SDK

## Project Structure

- `src/routes/` - File-based routes
- `src/components/` - Reusable React components
- `src/integrations/` - NEAR wallet and SDK integrations

## Links

- [Documentation](https://nearbuilders.github.io/near-social-js)
- [GitHub Repository](https://github.com/NEARBuilders/near-social-js)
- [Live Demo](https://nearbuilders.github.io/near-social-js)
