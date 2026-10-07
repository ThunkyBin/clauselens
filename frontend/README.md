# ClauseLens frontend

The app is a Next.js static export. Local development and production builds use the root scripts:

```powershell
npm ci
npm run dev --workspace frontend
npm run lint --workspace frontend
npm run build --workspace frontend
```

The build writes static files to `frontend/out`. For the GitHub Pages project site, the workflow sets `NEXT_PUBLIC_BASE_PATH=/clauselens` and the public fixture origin. Keep `NEXT_PUBLIC_CONTRACT_ADDRESS` empty until the real Bradbury deployment succeeds; the UI then correctly disables contract submissions and shows that deployment is pending.

Five plain-text fixtures live in `public/demo/` so validators can fetch them directly over HTTPS. They contain examples, not promised verdicts. No sample result is presented as an on-chain receipt.
