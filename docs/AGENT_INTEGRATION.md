# Agent integration

The `@clauselens/sdk` package is a thin TypeScript wrapper over the official GenLayerJS client. It submits calls and reads contract state; it does not decide outcomes.

```ts
import { createClauseLensClient } from "@clauselens/sdk";

const clauseLens = createClauseLensClient(agentWalletAddress);
const txHash = await clauseLens.createWatch(
  "Payments provider terms",
  "https://provider.example/terms",
  "Terms of service",
  "Escalate pricing, availability, data use, and automated-agent restrictions.",
  ["PRICING", "SLA", "DATA_USAGE", "PROHIBITED_USE"],
);
// The caller waits for accepted consensus, then reads contract state / receipt.
```

For a periodic action, an agent should:

1. Register its dependency’s public Terms/API URL and retain the returned watch ID.
2. On its own schedule, call `checkWatch(watchId)` and wait for accepted contract execution.
3. Read `getWatchHistory(watchId)` or `getLatestReceipt(agentWalletAddress)` and retain the receipt ID, transaction hash, source URL, verdict, categories, and evidence.
4. Apply its own safety policy: for example, pause a tool integration for `BREAKING`, request human review for `MATERIAL`, and log `NON_MATERIAL` without changing behavior.

Agent action policy remains off-chain and application-specific. ClauseLens does not automatically disable accounts or execute a downstream agent action.
