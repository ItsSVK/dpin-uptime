# DPIN Validator

This is the official validator node for the DPIN (Decentralized Performance and Infrastructure Network) system.

## Quick Start

Run the validator using Docker:

```bash
docker run -e PRIVATE_KEY=your_solana_private_key -e HUB_URL=ws://hub.dpin.network dpinnetwork/validator
```

## Environment Variables

The validator requires two environment variables:

- `PRIVATE_KEY`: Your Solana private key (required for signing validations)
- `HUB_URL`: WebSocket URL of the DPIN hub (defaults to ws://hub.dpin.network)

## Running Locally

1. Create a `.env` file:

```bash
PRIVATE_KEY=your_solana_private_key
HUB_URL=ws://hub.dpin.network
```

2. Install dependencies:

```bash
bun install
```

3. Start the validator:

```bash
bun run dev
```

## Security Notes

- Keep your private key secure and never share it
- The private key is used only for signing validation results
- All communications with the hub are encrypted via WebSocket
- Validator earnings are sent directly to your Solana wallet

## Rewards

- Earn rewards for each successful validation
- Rewards are paid in SOL
- Higher uptime = Higher rewards
- Minimum stake required: 0.1 SOL

## Requirements

- Stable internet connection
- Solana wallet
- Docker (if running containerized)
- Node.js/Bun (if running locally)

## Support

For support, join our Discord community or open an issue on GitHub.
