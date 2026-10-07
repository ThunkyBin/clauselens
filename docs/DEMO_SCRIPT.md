# Five-minute demonstration

Prerequisites: a deployed Bradbury ClauseLens contract, a public HTTPS frontend, a funded Bradbury test wallet, and `NEXT_PUBLIC_DEMO_BASE_URL` pointing at the hosted app.

1. Open the landing page and show the source → validators → equivalence → on-chain receipt flow.
2. Connect a wallet and verify Bradbury; inspect the configured contract in the status panel.
3. In Demo Lab, load **Editorial rewrite** and submit Compare. Wait for accepted consensus, then inspect the receipt and transaction.
4. Load **Quota cut**; point out the reduced monthly request value in the on-chain evidence.
5. Load **Agent use banned**; inspect the prohibited-use category and breaking decision.
6. Load **Prompt injection**; show that the hostile sentence is displayed only as untrusted source text and the contract still requires validator agreement.
7. Switch to **Create a watch**, register a public terms URL, then use **Check for changes** to append a bounded history entry.
8. Open the explorer transaction and GitHub CI/direct tests.

Do not claim a fixture's expected verdict is a live result until the actual transaction returns accepted and the contract receipt is read. A wallet rejection or unavailable source is a useful explicit failure state, not something to hide.
