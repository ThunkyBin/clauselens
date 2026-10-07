# GenLayer Builder Program — Project submission draft

**Project:** ClauseLens — Trustless Semantic Change Adjudication

**Category:** Projects / developer contribution

**Status:** Submission draft; deployment and public links not yet available.

## One-line description

ClauseLens uses GenLayer validator consensus to determine whether public API, SaaS, pricing, SLA, and policy documents changed in meaning—not just in markup.

## Problem

Hash-based monitors alert on every page edit, including harmless copy changes, but cannot reliably prioritize changes to quotas, uptime commitments, data handling, permitted use, and API compatibility. Agents and developers need evidence-backed signals about obligations that affect a dependency.

## Solution

ClauseLens offers two flows: Compare two public HTTPS documents for a repeatable adjudication, or register a source as a watch and establish/check a consensus-backed baseline. The contract stores compact normalized claims, fingerprints, and bounded receipts—not full web pages.

## Why GenLayer is necessary

The core result depends on interpreting mutable real-world web content and comparing meaning. A conventional deterministic contract cannot fetch current web evidence or settle naturally varying language-model outputs. ClauseLens places that judgment in an Intelligent Contract and makes validators independently fetch/analyze the source before an on-chain state transition.

## Intelligent Contract and equivalence

The leader fetches each source and asks for a bounded structured result. Validators independently repeat source reads and analysis. Acceptance requires exact verdict and changed-category agreement, severity within an 8-point tolerance, exact normalized candidate claims, and matching content fingerprints. Free-form summaries are not consensus-critical. Disagreement leaves state unchanged.

## Novelty, complexity, and impact

- **Novelty:** a reusable semantic-change adjudication primitive for evolving web policies, rather than another price prediction or generic chatbot.
- **Complexity:** mutable web evidence, structured extraction, prompt-injection boundary, fail-closed disagreement, compact storage, wallet transaction UX, public fixtures, and adversarial tests.
- **Impact:** supports developers and autonomous agents tracking dependencies whose terms, quotas, privacy rules, or usage policies can change.

## Security and verification

The repository includes a threat model, narrow consensus design, URL checks, source caps, a Windows direct-mode test workaround, and direct tests for watches, ownership, malformed model JSON, injection fixture behavior, baseline rotation, and validator disagreement. See `docs/TEST_REPORT.md` for the actual test/build/deployment status.

## Evidence (refresh after release)

- GitHub: https://github.com/ThunkyBin/clauselens (public source; initial push is the next release step)
- Live demo: https://thunkybin.github.io/clauselens/ (GitHub Pages workflow configured; deployment pending)
- Bradbury contract: **not deployed**
- Deployment transaction / explorer: **none**
- Direct test report: see `docs/TEST_REPORT.md`; update after the final test run.

## Reviewer demo

See `submission/REVIEWER_QUICKSTART.md` and `docs/DEMO_SCRIPT.md`. Expected outcomes are examples, not substitutes for transaction results.

## Future milestones

Multi-source evidence; agent SDK/webhooks and policy responses; receipt adapters for dispute workflows; bridge-verifiable receipts; public policy registry and reputation/history.
