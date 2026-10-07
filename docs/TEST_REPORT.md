# Test report

Last verified: 7 October 2026 (local Windows environment).

## Results

| Check | Status | Evidence |
| --- | --- | --- |
| GenVM lint | **Pass** | `genvm-lint check contracts/ClauseLens.py` — 3 checks passed; ClauseLens schema validated (9 methods: 3 writes, 6 views). `PYTHONIOENCODING=utf-8` is needed for this Windows console. |
| Direct tests | **Pass** | `python -m pytest tests/direct/test_clauselens.py -v` — 15 passed (final run after consensus, URL, prompt, and receipt-retention hardening). |
| Windows direct harness | **Workaround included** | genlayer-test 0.29.2 unlinks a still-open fd-0 temp file, which Windows rejects; `tests/direct/conftest.py` defers only those temp unlinks until pytest session end. |
| Frontend typecheck | **Pass** | `npm run lint --workspace frontend` — `tsc --noEmit` completed successfully after clean `npm ci`. |
| Frontend production build | **Pass** | `npm run build --workspace frontend` — static Next.js export built with `/clauselens` base path; root page and all five plain-text demo fixtures generated in `frontend/out`. |
| GitHub Pages deployment | **Pass** | Workflow `Deploy ClauseLens to GitHub Pages` completed successfully; public site loads and `/demo/api-terms-v1.txt` returns HTTP 200 with `text/plain; charset=utf-8`. The deployed UI states that the contract is not configured. |
| Dependency audit | **Pass** | `npm audit` and `npm audit --omit=dev` — zero vulnerabilities after removing unused boilerplate wallet/UI packages and updating lockfile. |
| Studio integration | Not run | Requires a running GenLayer Studio endpoint. |
| Bradbury deployment smoke test | Not run | Requires wallet signing and action-time approval. |

The 15 direct tests cover baseline creation/state, local URL rejection, duplicate/owner checks, watch adjudication and baseline rotation, Compare receipts, validator disagreement, malformed model JSON, unavailable sources, receipt pruning, and the injection fixture boundary. They use mocked web/LLM responses: they verify contract logic, not model accuracy or live Bradbury behavior.
