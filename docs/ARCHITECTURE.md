# Architecture and deployment

## Components

- `contracts/ClauseLens.py`: contract-owned watch state, baseline profiles, compare/watch writes, public read methods, URL input checks, GenLayer web + LLM execution, and narrow equivalence.
- `frontend/`: Next.js 16 / React 19 responsive interface, EIP-1193 wallet connection, direct GenLayerJS calls, transaction lifecycle, results, and public plain-text fixtures under `frontend/public/demo/`.
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
4. Set the verified address as the GitHub repository variable `NEXT_PUBLIC_CONTRACT_ADDRESS`. The Pages workflow rebuilds the site on the next push to `main` (or a manual workflow run).
5. The public HTTPS site is https://thunkybin.github.io/clauselens/; its plain-text fixtures are hosted under `/demo/*.txt` for validator access. The current UI correctly reports that the contract is not configured.
6. After deployment, run Compare scenarios against the fixtures, then record the real contract, transaction, and explorer links in README and portal submission copy.

GitHub Pages hosting and the public source release are complete. The contract deployment and live transaction smoke test are **not** complete: deployment requires the owner’s wallet signature, and no address or transaction has been fabricated.

## Transaction lifecycle

The browser distinguishes preparing, wallet confirmation, submitted/consensus pending, accepted, and failure. It reads the owner’s latest persisted receipt only after `FINISHED_WITH_RETURN`. A consensus decision that ends in contract execution error is shown as a failure, never as an accepted adjudication.
