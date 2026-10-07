import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";

export const CLAUSE_CATEGORIES = [
  "PRICING", "RATE_LIMIT", "SLA", "AUTHENTICATION", "DATA_USAGE", "PRIVACY",
  "PROHIBITED_USE", "TERMINATION", "DEPRECATION", "API_BEHAVIOR",
  "SECURITY_REQUIREMENT", "OTHER",
] as const;

export type ClauseCategory = (typeof CLAUSE_CATEGORIES)[number];
export type Verdict = "NO_CHANGE" | "NON_MATERIAL" | "MATERIAL" | "BREAKING" | "UNAVAILABLE";
export type ClauseLensReceipt = {
  id: string;
  kind: "COMPARE" | "WATCH_CHECK";
  result: {
    verdict: Verdict;
    severity: number;
    changed_categories: ClauseCategory[];
    summary: string;
    recommended_action: string;
    evidence: Array<{ category: ClauseCategory; before: string; after: string }>;
  };
  [key: string]: unknown;
};

function decodeValue(value: unknown): unknown {
  if (value instanceof Map) {
    return Object.fromEntries(Array.from(value.entries(), ([key, item]) => [String(key), decodeValue(item)]));
  }
  if (Array.isArray(value)) return value.map(decodeValue);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, decodeValue(item)]));
  }
  return value;
}

export function createClauseLensClient(account?: `0x${string}`) {
  const client = createClient({ chain: testnetBradbury, ...(account ? { account } : {}) } as never) as any;
  const address = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}` | undefined;
  if (!address) throw new Error("NEXT_PUBLIC_CONTRACT_ADDRESS is not configured");

  const write = (functionName: string, args: unknown[]) =>
    client.writeContract({ address, functionName, args, value: 0n });
  const read = async (functionName: string, args: unknown[] = []) =>
    decodeValue(await client.readContract({ address, functionName, args }));

  return {
    address,
    raw: client,
    createWatch: (name: string, url: string, documentType: string, rubric: string, categories: ClauseCategory[]) =>
      write("create_watch", [name, url, documentType, rubric, categories.join(",")]),
    checkWatch: (watchId: string) => write("check_watch", [watchId]),
    compareDocuments: (baselineUrl: string, candidateUrl: string, documentType: string, rubric: string, categories: ClauseCategory[]) =>
      write("compare_documents", [baselineUrl, candidateUrl, documentType, rubric, categories.join(",")]),
    getWatch: (watchId: string) => read("get_watch", [watchId]),
    getWatchCount: (owner: string) => read("get_watch_count", [owner]),
    getOwnerWatches: (owner: string) => read("get_owner_watches", [owner]),
    getWatchHistory: (watchId: string) => read("get_watch_history", [watchId]),
    getReceipt: (receiptId: string) => read("get_receipt", [receiptId]),
    getLatestReceipt: (owner: string) => read("get_latest_receipt", [owner]),
  };
}
