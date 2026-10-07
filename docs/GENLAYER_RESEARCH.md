# GenLayer implementation research

Research was completed against the current official developer docs and upstream boilerplate on 7 October 2026. Re-check these network and SDK details before a future deployment; GenLayer evolves quickly.

## Findings applied

- **Consensus is the product boundary.** The leader result is not sufficient. The contract uses `gl.vm.run_nondet_unsafe(leader, validator)` so the validator independently re-fetches the URL and repeats the structured extraction/adjudication. It compares verdict, normalized changed-category set, severity within an 8-point band, candidate claims, and source fingerprints. It intentionally ignores summary prose. See [Equivalence Principle](https://docs.genlayer.com/developers/intelligent-contracts/equivalence-principle).
- **LLM output is constrained.** Calls use `gl.nondet.exec_prompt(..., response_format="json")`; contract-side normalization rejects malformed objects, unknown verdicts/categories, out-of-range severity, and oversized lists. See [Calling LLMs](https://docs.genlayer.com/developers/intelligent-contracts/features/calling-llms).
- **Web access is nondeterministic.** `gl.nondet.web.render(url, mode="text")` is inside the leader and validator functions passed to the consensus primitive. Page text is truncated to 12,000 characters after retrieval; only claims and fingerprints enter persistent state. See [Web Access](https://docs.genlayer.com/developers/intelligent-contracts/features/web-access) and [Non-determinism](https://docs.genlayer.com/developers/intelligent-contracts/features/non-determinism).
- **Untrusted content needs explicit handling.** Prompts delimit source evidence and instruct validators to ignore embedded task instructions; the output is a fixed schema. See [Prompt Injection](https://docs.genlayer.com/developers/intelligent-contracts/security-and-best-practices/prompt-injection).
- **Testing is layered.** Current official boilerplate uses `genlayer-py`, `genlayer-test`, GenVM lint, direct-mode unit tests, and optional Studio integration. The app follows that layout; this report distinguishes the tests actually run from the Studio test not yet run. See [Testing Intelligent Contracts](https://docs.genlayer.com/developers/intelligent-contracts/testing) and the [official boilerplate](https://github.com/genlayerlabs/genlayer-project-boilerplate).
- **Bradbury values verified for this build:** chain ID `4221`, native symbol `GEN`, RPC `https://rpc-bradbury.genlayer.com`, explorer `https://explorer-bradbury.genlayer.com`. See [official network configuration](https://docs.genlayer.com/developers/networks).

## Design consequences

1. The decisive LLM judgment and state update happen in the Intelligent Contract; frontend and SDK only submit intent and display accepted state.
2. `NO_CHANGE` / `NON_MATERIAL` / `MATERIAL` / `BREAKING` are contract-validated enum outputs. `UNAVAILABLE` preserves the existing watch baseline.
3. Public page changes during consensus are handled conservatively: source fingerprints are critical, so validators must observe the same content. A mismatch fails equivalence instead of silently using a stale/new mixed result.
4. Common local URL forms are rejected before external fetch. This is defense-in-depth, not a complete DNS-rebinding or private-network control; see the threat model.
5. A strict, structured candidate claim profile may reject semantically identical-but-differently-extracted answers. That favors avoiding an incorrect baseline rotation over liveness. Retry or manual review is the fallback.

## References

- [GenLayer developer documentation](https://docs.genlayer.com/developers)
- [When to use GenLayer](https://docs.genlayer.com/developers/intelligent-contracts/when-to-use-genlayer)
- [GenLayerJS](https://github.com/genlayerlabs/genlayer-js)
- [GenLayer design repository](https://github.com/genlayer-foundation/genlayer-design)
