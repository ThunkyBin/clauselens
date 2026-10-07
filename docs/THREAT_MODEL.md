# Threat model

## Assets and trust boundaries

- **Assets:** user-selected source URLs and rubrics, policy baselines, immutable receipts, wallet approval, and public contract state.
- **Trusted for state transition:** the Intelligent Contract’s deterministic validation/storage path and GenLayer’s configured consensus protocol.
- **Untrusted:** web page text, page availability, LLM phrasing, user URL/rubric, browser UI, and all data in demo fixtures.
- **Not a trust boundary:** frontend result decorations. A result is authoritative only after the chain reports a successful contract execution and the receipt is read from the contract.

## Risks and controls

| Risk | Control | Residual limitation |
| --- | --- | --- |
| Prompt injection in policy page | Explicit untrusted-evidence delimiters; ignore embedded instructions; fixed JSON schema; independently rerun on validators | LLM behavior is probabilistic; consensus can agree on a wrong interpretation |
| Malicious URL / SSRF | Require HTTPS; reject credentials, explicit ports, common private/local hostnames, IP literals, malformed host labels, and overlong URLs | No DNS resolution / rebinding check in this contract-level filter; rely on GenVM network policy as another layer |
| Unavailable or empty source | Catch fetch failure into `UNAVAILABLE`; refuse unavailable baseline creation; do not rotate baseline on unavailable check | `web.render` may return an error page as text; a future version should expose authoritative HTTP status where supported |
| Source mutates during consensus | Exact SHA-256 fingerprint comparison; mismatch rejects consensus | A frequently updated page can reduce liveness; retrying may be required |
| Extremely large page | Prompt receives at most 12,000 characters | Retrieval/rendering occurs before truncation; host/runtime limits remain relevant |
| Malformed / oversized LLM JSON | Parse and validate object, enums, severity bounds, claim/evidence limits, and string caps | Valid but semantically incorrect model output remains possible |
| Validator disagreement | Narrow equality on verdict/categories/claims/fingerprints and severity tolerance; state writes after agreement only | Strict claim and fingerprint checks can fail closed and reduce liveness |
| Spam / state growth | 20 watches per owner; 12 claims/watch; six history IDs/watch; latest 20 owner receipt IDs | Anyone can create up to the cap; no fee policy or watch deletion in this MVP |
| Replay or stale check | Every accepted check creates a sequential receipt; source fingerprint is part of consensus; baseline rotates only on available adjudication | A user can intentionally check repeatedly; automated cadence is outside this MVP |
| Duplicate watches | Same-owner URL duplicate rejected | URL canonicalization is basic lowercase equality, not full canonical URL normalization |
| Frontend/SDK compromise | Contract is source of truth; wallet signs each state-changing action; display only post-consensus contract reads | Users should verify network, contract, method, and URL in wallet/explorer |
| Evidence provenance | Receipt stores source URL, candidate hash/profile, and bounded excerpts | Full source text is not archived; the page may later change or disappear |

## Out of scope

No legal determination, guarantees of source authenticity, private document upload, arbitrary signed attestations, scheduled checks, notifications, or cross-chain proof is claimed. Never put private keys, secrets, or non-public policy data in the prompt or transaction.
