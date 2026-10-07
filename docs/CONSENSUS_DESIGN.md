# Consensus design

ClauseLens uses GenLayer as the decision-maker, not as an execution log for an off-chain classification. Every write that creates a baseline, checks a watch, or compares two sources enters the contract’s explicit validator equivalence function.

```mermaid
sequenceDiagram
  participant U as User / agent
  participant IC as ClauseLens Intelligent Contract
  participant L as Leader
  participant V as Validators
  participant S as Contract state
  U->>IC: create_watch / check_watch / compare_documents
  IC->>L: execute non-deterministic task
  L->>L: fetch public HTTPS evidence; cap text; extract claims / adjudicate
  IC->>V: verify leader result
  V->>V: independently fetch sources and repeat analysis
  V->>IC: agree only on critical fields
  IC->>IC: verdict exact; categories exact; severity delta ≤ 8; claims + fingerprints exact
  alt Equivalence succeeds
    IC->>S: persist compact baseline / receipt
    IC-->>U: accepted result
  else Disagreement or execution error
    IC-->>U: no accepted state update
  end
```

## Critical fields

| Field | Rule | Reason |
| --- | --- | --- |
| `verdict` | exact enum match | Discrete product decision |
| `changed_categories` | sorted, deduplicated exact match | Restricts which policy dimension changed |
| `severity` | absolute difference ≤ 8 on 0–100 scale | Allows small evaluator variance without masking large severity gaps |
| normalized candidate `claims` | exact match after category/key/polarity/value normalization | Prevents leader from rotating baseline to a materially different extraction |
| source fingerprint(s) | exact match | Prevents validators from adjudicating different page versions during a mutable-source race |
| summary / action prose / evidence excerpts | not compared byte-for-byte | Natural-language variation is non-authoritative; fixed decisions and claims carry consensus |

Baseline creation has no verdict: both sides independently extract and compare the normalized claims and page fingerprint. Watch checks compare the stored profile with a freshly fetched candidate. Compare mode has each side fetch both documents, build the baseline profile, and evaluate the candidate. Storage mutation occurs only after `run_nondet_unsafe` returns. `UNAVAILABLE` does not replace a watch baseline.

## Trade-offs

Exact normalized-claim matching can reduce liveness if validators choose different claim keys or value normalization. The bounded claim schema, explicit examples, and exact candidate fingerprint reduce drift. An accepted decision is not a guarantee of legal correctness; it is a reproducible, consensus-backed interpretation of public evidence.
