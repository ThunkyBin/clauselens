# Reviewer quickstart

## Before a live review

The source repository is public. GitHub Pages builds the frontend at `https://thunkybin.github.io/clauselens/`; verify that the Pages workflow has completed before sharing it. The ClauseLens contract still needs a real Bradbury deployment, its address added as the `NEXT_PUBLIC_CONTRACT_ADDRESS` repository variable, and a funded test wallet. Do not describe the app as live on-chain until the deployment transaction succeeds.

## Five-minute path

1. Open the live ClauseLens URL and connect an EVM wallet on GenLayer Bradbury.
2. Open Demo Lab and load **Editorial rewrite**. Submit it; wait for the real transaction to be accepted. Inspect the receipt for `NON_MATERIAL`.
3. Load **Quota cut**; submit and inspect the reduced request quota evidence.
4. Load **Agent use banned**; inspect the policy category and verdict.
5. Load **Prompt injection**; check that the hostile web text is treated as evidence, not instruction.
6. Open the accepted transaction in the Bradbury explorer and the repository's `contracts/ClauseLens.py`, `docs/CONSENSUS_DESIGN.md`, and direct tests.

If a source is unavailable, validators disagree, or the wallet rejects the transaction, the UI must show that state. Do not substitute a screenshot, expected label, or local mock for a live receipt.
