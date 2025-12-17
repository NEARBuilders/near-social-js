# near-social-js Relayer

A relayer plugin for near-social-js that enables gasless transactions on [NEAR Social](https://near.social) (`social.near` contract).

## Features

- **Connect**: Ensures users have storage deposit on social.near
- **Publish**: Relays signed delegate actions (meta-transactions) for gasless social posts and profile updates

## Quick Start

### 1. Install dependencies

```bash
cd demo/relayer
bun install
```

### 2. Configure secrets

Create a `.env` file or set environment variables:

```bash
RELAYER_ACCOUNT_ID=your-relayer.near
RELAYER_PRIVATE_KEY=ed25519:...
```

### 3. Run the dev server

```bash
bun run dev
```

The relayer will be available at `http://localhost:3014/relayer`

## API Endpoints

### POST /connect

Ensures an account has storage deposit on social.near.

**Request:**
```json
{
  "accountId": "user.near"
}
```

**Response:**
```json
{
  "accountId": "user.near",
  "hasStorage": false,
  "depositTxHash": "ABC123..."
}
```

### POST /publish

Submits a signed delegate action to the network.

**Request:**
```json
{
  "payload": "base64-encoded-signed-delegate-action"
}
```

**Response:**
```json
{
  "hash": "DEF456..."
}
```

### GET /ping

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Client Usage

### Creating a delegate action for profile update

```typescript
import { Social } from "near-social-js";
import { Near } from "near-kit";

const near = new Near({
  network: "mainnet",
  wallet: yourWalletAdapter,
});

const social = new Social({ near });

const tx = await social.setProfile("user.near", {
  name: "My Name",
  description: "Hello world",
});

const { payload } = await tx.delegate();

const response = await fetch("http://localhost:3014/relayer/publish", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ payload }),
});

const result = await response.json();
console.log("Transaction hash:", result.hash);
```

## Configuration

### Variables

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `network` | `"mainnet" \| "testnet"` | `"mainnet"` | NEAR network to connect to |
| `contractId` | `string` | `"social.near"` | Social contract ID |

### Secrets

| Name | Required | Description |
|------|----------|-------------|
| `relayerAccountId` | Yes | Account ID of the relayer (pays for gas) |
| `relayerPrivateKey` | Yes | Private key of the relayer account |

## License

Part of the [near-social-js](https://github.com/NEARBuilders/near-social-js) library.
