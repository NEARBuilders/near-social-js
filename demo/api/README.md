# near-social-js API

API plugin for `near-social-js` that enables gasless transactions on [NEAR Social](https://near.social) (`social.near` contract).

## Features

- **Connect**: Ensures users have storage deposit on `social.near`
- **Publish**: Submits signed delegate actions (meta-transactions) through the API account

## Quick Start

### 1. Install dependencies

```bash
cd demo/api
bun install
```

### 2. Configure secrets

Create a `.env` file or set environment variables:

```bash
API_ACCOUNT_ID=your-api.near
API_PRIVATE_KEY=ed25519:...
```

### 3. Run the dev server

```bash
bun run dev
```

The API will be available at `http://localhost:3014/api/rpc`.

## API Endpoints

### `POST /connect`

Ensures an account has storage deposit on `social.near`.

### `POST /publish`

Submits a signed delegate action to the network.

### `GET /ping`

Health check endpoint.
