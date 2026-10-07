# Architecture and deployment

## Components

- `contracts/ClauseLens.py`: contract-owned watch state, baseline profiles, compare/watch writes, public read methods, URL input checks, GenLayer web + LLM execution, and narrow equivalence.
- `frontend/`: Next.js 16 / React 19 responsive interface, EIP-1193 wallet connection, direct GenLayerJS calls, transaction lifecycle, results, and plain-text demo routes.
- `packages/sdk/`: typed Bradbury client helpers for watch creation/checks, comparisons, reads, and receipts.
- No backend service or local classifier participates in verdicts.

## State and bounds

- Watch profiles contain at most 12 claims; each claim carries a fixed category, normalized key, polarity, and compact value.
- Web evidence is capped at 12,000 characters after GenLayer fetch; it is not persisted.
- Rubrics are limited to 500 characters, URLs to 500 characters, watches to 20 per owner, and per-watch history to six receipts.
- Owner receipt lookup retains the latest 20 IDs. A receipt older than that is pruned only if it is no longer referenced by any retained watch history; per-watch history stays at six entries, so retained receipt state is bounded by the 20-watch cap.
- No deletion or watch pause operation is implemented in this MVP.

## Deployment

1. Verify the current Bradbury configuration against [official network docs](https://docs.genlayer.com/developers/networks) and `genlayer network list`.
2. Set the CLI’s active network to `testnet-bradbury`; inspect the command’s confirmation details before approving a wallet transaction.
3. Run `genlayer deploy` from the repo root. `deploy/deployScript.ts` deploys `contracts/ClauseLens.py` and prints the receipt-derived address and transaction only after an accepted execution.
4. Put that verified contract address in `frontend/.env.local` as `NEXT_PUBLIC_CONTRACT_ADDRESS`.
5. Build and host the frontend on a public HTTPS origin, set `NEXT_PUBLIC_DEMO_BASE_URL` to that origin, and rebuild. Validators cannot fetch localhost.
6. Run the Compare scenarios against the deployed public fixtures, then record real contract, transaction, and explorer links in README and portal submission copy.

The deployment and hosting steps have **not** been executed for this workspace. They require a wallet approval, an identified public repository/hosting target, and action-time confirmation. There are no fabricated deployment artifacts in the project.

## Transaction lifecycle

The browser distinguishes preparing, wallet confirmation, submitted/consensus pending, accepted, and failure. It reads the owner’s latest persisted receipt only after `FINISHED_WITH_RETURN`. A consensus decision that ends in contract execution error is shown as a failure, never as an accepted adjudication.
