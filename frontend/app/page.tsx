"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, CircleHelp, Clock3, ExternalLink, FileDiff, FileText, Fingerprint, Github, LockKeyhole, Menu, Plus, RefreshCw, ShieldCheck, Sparkles, Wallet, X } from "lucide-react";
import { createClauseLensClient, type ClauseCategory, type ClauseLensReceipt } from "@clauselens/sdk";
import { ExecutionResult, TransactionStatus } from "genlayer-js/types";

type InjectedProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, listener: (...args: any[]) => void) => void;
  removeListener?: (event: string, listener: (...args: any[]) => void) => void;
};
function getInjectedProvider() {
  return (window as unknown as { ethereum?: InjectedProvider }).ethereum;
}

const categories: ClauseCategory[] = ["PRICING", "RATE_LIMIT", "SLA", "AUTHENTICATION", "DATA_USAGE", "PRIVACY", "PROHIBITED_USE", "TERMINATION", "DEPRECATION", "API_BEHAVIOR", "SECURITY_REQUIREMENT", "OTHER"];
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";
const explorerBase = "https://explorer-bradbury.genlayer.com";
const demoBase = process.env.NEXT_PUBLIC_DEMO_BASE_URL ?? "";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const examples = [
  { title: "Editorial rewrite", slug: "api-terms-v2-cosmetic", expected: "NON_MATERIAL", color: "#a6efca" },
  { title: "Quota cut", slug: "api-terms-v3-material", expected: "MATERIAL", color: "#ffcc7a" },
  { title: "Agent use banned", slug: "api-terms-v4-breaking", expected: "BREAKING", color: "#ff9b92" },
  { title: "Prompt injection", slug: "api-terms-injection", expected: "No predicted result", color: "#c4b5fd" },
];

type Watch = { id: string; name: string; url: string; document_type: string; baseline_profile?: { claims?: Array<{ category: string; key: string; value: string; polarity: string }> }; latest?: ClauseLensReceipt; status: string };

function shortAddress(address: string) { return `${address.slice(0, 6)}…${address.slice(-4)}`; }

export default function HomePage() {
  const [mode, setMode] = useState<"compare" | "monitor">("compare");
  const [wallet, setWallet] = useState("");
  const [chainId, setChainId] = useState("");
  const [watchName, setWatchName] = useState("API terms");
  const [baselineUrl, setBaselineUrl] = useState("");
  const [candidateUrl, setCandidateUrl] = useState("");
  const [documentType, setDocumentType] = useState("API terms");
  const [rubric, setRubric] = useState("Focus on changes to price, access, allowed use, service commitments, privacy, and compatibility.");
  const [selectedCategories, setSelectedCategories] = useState<ClauseCategory[]>(["PRICING", "RATE_LIMIT", "SLA", "PROHIBITED_USE", "API_BEHAVIOR"]);
  const [watches, setWatches] = useState<Watch[]>([]);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [txHash, setTxHash] = useState("");
  const [receipt, setReceipt] = useState<ClauseLensReceipt | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const isBradbury = chainId.toLowerCase() === "0x107d" || Number(chainId) === 4221;

  async function loadWatches(address: string) {
    if (!contractAddress) return;
    try {
      const client = createClauseLensClient(address as `0x${string}`);
      const result = await client.getOwnerWatches(address);
      setWatches(Array.isArray(result) ? result as Watch[] : []);
    } catch (err) {
      console.warn("Could not read ClauseLens watches", err);
    }
  }

  async function connectWallet() {
    setErrorMessage("");
    const provider = getInjectedProvider();
    if (!provider) { setErrorMessage("No browser wallet found. Install or enable your EVM wallet first."); return; }
    try {
      const accounts = await provider.request({ method: "eth_requestAccounts" }) as string[];
      const currentChain = await provider.request({ method: "eth_chainId" }) as string;
      const address = accounts?.[0] ?? "";
      setWallet(address);
      setChainId(currentChain);
      if (address) await loadWatches(address);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Wallet connection was cancelled.");
    }
  }

  async function addBradbury() {
    const provider = getInjectedProvider();
    if (!provider) return;
    try {
      await provider.request({ method: "wallet_addEthereumChain", params: [{ chainId: "0x107d", chainName: "GenLayer Bradbury Testnet", nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 }, rpcUrls: ["https://rpc-bradbury.genlayer.com"], blockExplorerUrls: [explorerBase] }] });
      const currentChain = await provider.request({ method: "eth_chainId" }) as string;
      setChainId(currentChain);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Could not add Bradbury network.");
    }
  }

  async function submit(write: (client: ReturnType<typeof createClauseLensClient>) => Promise<unknown>, refreshWatches = false) {
    setErrorMessage(""); setReceipt(null); setTxHash("");
    if (!contractAddress) { setErrorMessage("This build has no deployed contract address yet. Configure NEXT_PUBLIC_CONTRACT_ADDRESS after Bradbury deployment."); return; }
    if (!wallet) { setErrorMessage("Connect your wallet before submitting a GenLayer transaction."); return; }
    if (!isBradbury) { setErrorMessage("Switch the wallet to GenLayer Bradbury Testnet before submitting."); return; }
    setBusy(true); setStage("Preparing transaction");
    try {
      const client = createClauseLensClient(wallet as `0x${string}`);
      setStage("Waiting for wallet confirmation");
      const hash = await write(client) as `0x${string}`;
      setTxHash(hash); setStage("Submitted · validator consensus pending");
      const transaction = await client.raw.waitForTransactionReceipt({ hash, status: TransactionStatus.ACCEPTED, retries: 120, interval: 5000 });
      if (transaction.txExecutionResultName !== ExecutionResult.FINISHED_WITH_RETURN) {
        throw new Error(`Transaction reached consensus but contract execution did not return successfully (${transaction.txExecutionResultName ?? "unknown"}).`);
      }
      setStage("Accepted by GenLayer consensus");
      const latest = await client.getLatestReceipt(wallet);
      if (latest && typeof latest === "object" && "result" in latest) setReceipt(latest as ClauseLensReceipt);
      if (refreshWatches) await loadWatches(wallet);
    } catch (err) {
      setStage("Transaction not completed");
      setErrorMessage(err instanceof Error ? err.message : "The GenLayer request failed. Check the wallet and RPC, then retry.");
    } finally { setBusy(false); }
  }

  async function checkWatch(watchId: string) {
    await submit((client) => client.checkWatch(watchId), true);
  }

  function chooseExample(slug: string) {
    const origin = demoBase || (typeof window !== "undefined" ? `${window.location.origin}${basePath}` : "https://your-public-demo-domain.example");
    setBaselineUrl(`${origin}/demo/api-terms-v1.txt`);
    setCandidateUrl(`${origin}/demo/${slug}.txt`);
    setMode("compare");
    document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    const provider = getInjectedProvider();
    if (!provider) return;
    const onChain = (id: string) => setChainId(id);
    const onAccounts = (accounts: string[]) => { const address = accounts[0] ?? ""; setWallet(address); if (address) void loadWatches(address); else setWatches([]); };
    provider.on?.("chainChanged", onChain);
    provider.on?.("accountsChanged", onAccounts);
    return () => {
      provider.removeListener?.("chainChanged", onChain);
      provider.removeListener?.("accountsChanged", onAccounts);
    };
  }, []);

  const canSubmit = Boolean(contractAddress && wallet && isBradbury && !busy);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="ClauseLens home"><span className="brand-mark"><Fingerprint size={22} /></span><span>clause<span className="brand-light">lens</span></span><span className="version">BETA</span></a>
        <nav className={mobileMenu ? "nav-links nav-open" : "nav-links"}>
          <a href="#workspace" onClick={() => setMobileMenu(false)}>Workspace</a><a href="#demo" onClick={() => setMobileMenu(false)}>Demo lab</a><a href="#protocol" onClick={() => setMobileMenu(false)}>Protocol</a><a href="https://docs.genlayer.com/developers" target="_blank" rel="noreferrer">Docs <ArrowUpRight size={14} /></a>
        </nav>
        <div className="top-actions">
          <span className="network-pill"><span className={contractAddress ? "pulse-dot live" : "pulse-dot"} />{contractAddress ? "BRADBURY · CONTRACT SET" : "BRADBURY TESTNET"}</span>
          {wallet ? <button className="wallet-button connected" onClick={() => void connectWallet()}><span className="wallet-led" />{shortAddress(wallet)}<ChevronDown size={14} /></button> : <button className="wallet-button" onClick={() => void connectWallet()}><Wallet size={15} /> Connect wallet</button>}
          <button className="menu-button" aria-label="Toggle menu" onClick={() => setMobileMenu(!mobileMenu)}>{mobileMenu ? <X size={19} /> : <Menu size={19} />}</button>
        </div>
      </header>

      <section className="hero section-wrap" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-icon"><Sparkles size={13} /></span> SEMANTIC POLICY MONITORING <span className="eyebrow-line" /></div>
          <h1>Change is easy<br />to see. <em>Meaning</em><br />isn’t.</h1>
          <p className="hero-lede">Hash monitors tell you a page changed. ClauseLens asks GenLayer validators whether the obligations actually changed — then leaves a shared on-chain receipt.</p>
          <div className="hero-cta"><a className="button button-primary" href="#workspace">Try the adjudicator <ArrowRight size={16} /></a><a className="text-link" href="#protocol">How consensus works <ArrowDown size={14} /></a></div>
          <div className="hero-footnote"><span className="verified"><Check size={12} /></span> Contract-first · Validator-verified · No off-chain verdict engine</div>
        </div>
        <div className="hero-visual" aria-label="Semantic adjudication pipeline">
          <div className="visual-topline"><span>ADJUDICATION PIPELINE</span><span className="tiny-status"><span /> READY</span></div>
          <div className="document-card"><div className="doc-icon"><FileText size={18} /></div><div><div className="doc-label">SOURCE DOCUMENT</div><div className="doc-value">API terms · public web</div></div><span className="doc-tag">HTTPS</span></div>
          <div className="flow-line"><span /></div>
          <div className="validator-card"><div className="validator-head"><div className="validator-icon"><ShieldCheck size={18} /></div><div><div className="doc-label">GENLAYER VALIDATORS</div><div className="doc-value">Independent evidence review</div></div></div><div className="validator-nodes"><span>LEADER</span><i /><span>VALIDATOR 01</span><i /><span>VALIDATOR 02</span></div></div>
          <div className="flow-line"><span /></div>
          <div className="decision-card"><div className="decision-icon"><Fingerprint size={17} /></div><div className="decision-label">SEMANTIC CONSENSUS</div><div className="decision-value">Meaning, not markup.</div><div className="decision-seal"><Check size={16} /></div></div>
          <div className="receipt-strip"><span className="receipt-led" /> ON-CHAIN DECISION RECEIPT <span className="receipt-arrow"><ArrowRight size={14} /></span></div>
          <div className="visual-grid" />
        </div>
      </section>

      <section className="signal-bar"><div className="section-wrap signal-inner"><div><span className="signal-number">01</span><span>Extract policy claims</span></div><div><span className="signal-number">02</span><span>Compare meaning independently</span></div><div><span className="signal-number">03</span><span>Commit only after consensus</span></div><a href="#protocol">Read the protocol <ArrowUpRight size={14} /></a></div></section>

      <section className="workspace-section section-wrap" id="workspace">
        <div className="section-heading"><div><div className="eyebrow">WORKSPACE <span className="eyebrow-line" /></div><h2>Put a policy to the test.</h2><p>Compare two public versions or register a URL as a policy watch.</p></div><div className="section-count"><span className="count-dot" /> {contractAddress ? "CONTRACT CONNECTED" : "CONTRACT NOT CONFIGURED"}</div></div>
        <div className="workspace-grid">
          <div className="composer panel">
            <div className="mode-tabs"><button className={mode === "compare" ? "mode-tab active" : "mode-tab"} onClick={() => { setMode("compare"); setReceipt(null); }}><FileDiff size={15} /> Compare documents</button><button className={mode === "monitor" ? "mode-tab active" : "mode-tab"} onClick={() => { setMode("monitor"); setReceipt(null); }}><RefreshCw size={15} /> Create a watch</button></div>
            <div className="form-body">
              <div className="field-row"><label className="field-label">DOCUMENT TYPE</label><select value={documentType} onChange={(e) => setDocumentType(e.target.value)}><option>API terms</option><option>Terms of service</option><option>Pricing policy</option><option>SLA</option><option>Privacy policy</option><option>API documentation</option></select></div>
              {mode === "compare" ? <>
                <label className="field-label">BASELINE URL <span>01</span></label><div className="url-field"><span className="url-icon"><FileText size={15} /></span><input value={baselineUrl} onChange={(e) => setBaselineUrl(e.target.value)} placeholder="https://docs.example.com/terms-v1" /></div>
                <div className="compare-divider"><span>COMPARE AGAINST</span><ArrowDown size={13} /></div>
                <label className="field-label">CANDIDATE URL <span>02</span></label><div className="url-field"><span className="url-icon candidate"><FileDiff size={15} /></span><input value={candidateUrl} onChange={(e) => setCandidateUrl(e.target.value)} placeholder="https://docs.example.com/terms-v2" /></div>
              </> : <>
                <label className="field-label">WATCH NAME</label><div className="url-field"><span className="url-icon"><FileText size={15} /></span><input value={watchName} onChange={(e) => setWatchName(e.target.value)} placeholder="e.g. Payments API terms" /></div>
                <label className="field-label spaced">CANONICAL SOURCE URL</label><div className="url-field"><span className="url-icon candidate"><RefreshCw size={15} /></span><input value={candidateUrl} onChange={(e) => setCandidateUrl(e.target.value)} placeholder="https://docs.example.com/terms" /></div>
              </>}
              <label className="field-label spaced">MATERIALITY RUBRIC <span className="optional">OPTIONAL CONTEXT</span></label><textarea value={rubric} onChange={(e) => setRubric(e.target.value)} rows={3} maxLength={500} />
              <div className="field-label spaced">CATEGORIES TO WATCH</div><div className="category-picker">{categories.map((category) => <button key={category} onClick={() => setSelectedCategories((previous) => previous.includes(category) ? previous.filter((item) => item !== category) : [...previous, category].slice(0, 8))} className={selectedCategories.includes(category) ? "category-chip selected" : "category-chip"}>{selectedCategories.includes(category) && <Check size={11} />}{category.replaceAll("_", " ")}</button>)}</div>
              <button className="button button-primary submit-button" disabled={!canSubmit || busy} onClick={() => mode === "compare" ? void submit((client) => client.compareDocuments(baselineUrl, candidateUrl, documentType, rubric, selectedCategories)) : void submit((client) => client.createWatch(watchName, candidateUrl, documentType, rubric, selectedCategories), true)}>{busy ? <><span className="spinner" /> {stage || "Working…"}</> : mode === "compare" ? <>Submit for consensus <ArrowRight size={15} /></> : <>Register watch on GenLayer <ArrowRight size={15} /></>}</button>
              <div className="submit-note"><LockKeyhole size={12} /> Wallet confirmation required · {contractAddress ? "Bradbury contract" : "deployment address not set"}</div>
              {!isBradbury && wallet && <div className="network-warning">Wallet is on another network. <button onClick={() => void addBradbury()}>Add / switch to Bradbury</button></div>}
              {errorMessage && <div className="error-box" role="alert">{errorMessage}</div>}
              {stage && <div className="tx-stage"><span className={busy ? "spinner small" : "stage-check"}>{!busy && <Check size={12} />}</span><div><b>{stage}</b>{txHash && <a href={`${explorerBase}/tx/${txHash}`} target="_blank" rel="noreferrer">View transaction <ExternalLink size={12} /></a>}</div></div>}
            </div>
          </div>

          <aside className="results-column">
            <div className="result-panel panel">
              <div className="panel-heading"><div><span className="eyebrow">LATEST RECEIPT</span><h3>{receipt ? "Consensus complete" : "Awaiting an adjudication"}</h3></div><div className="receipt-symbol"><Fingerprint size={20} /></div></div>
              {receipt ? <div className="receipt-result">
                <div className={`verdict verdict-${receipt.result.verdict.toLowerCase()}`}><span>{receipt.result.verdict.replaceAll("_", " ")}</span><span className="severity">SEVERITY {receipt.result.severity}</span></div>
                <p>{receipt.result.summary}</p>
                <div className="receipt-cats">{receipt.result.changed_categories?.length ? receipt.result.changed_categories.map((category) => <span key={category}>{category.replaceAll("_", " ")}</span>) : <span>No material category changed</span>}</div>
                {receipt.result.evidence?.map((item, index) => <div className="evidence-row" key={`${item.category}-${index}`}><div>{item.category.replaceAll("_", " ")}</div><span>{item.before || "—"}</span><ArrowRight size={13} /><b>{item.after || "—"}</b></div>)}
                <div className="recommended"><span>RECOMMENDED ACTION</span><p>{receipt.result.recommended_action}</p></div>
                {txHash && <a className="explorer-link" href={`${explorerBase}/tx/${txHash}`} target="_blank" rel="noreferrer">Open transaction receipt <ArrowUpRight size={14} /></a>}
              </div> : <div className="empty-receipt"><div className="empty-icon"><Clock3 size={20} /></div><p>Results appear here only after the transaction is accepted by validator consensus.</p><div className="empty-status"><span /> NO LOCAL SCORING · NO PRETEND RESULTS</div></div>}
            </div>
            <div className="contract-status panel"><div className="contract-status-icon"><Fingerprint size={17} /></div><div><div className="field-label">SOURCE OF TRUTH</div><p>{contractAddress ? `${contractAddress.slice(0, 8)}…${contractAddress.slice(-6)}` : "Waiting for Bradbury deployment"}</p></div><a href="https://docs.genlayer.com/developers/intelligent-contracts/equivalence-principle" target="_blank" rel="noreferrer" aria-label="Read equivalence docs"><CircleHelp size={16} /></a></div>
          </aside>
        </div>
        {wallet && <div className="watch-list panel"><div className="watch-list-heading"><div><div className="eyebrow">YOUR POLICY WATCHES <span className="eyebrow-line" /></div><h3>Monitoring on-chain</h3></div><span className="watch-count">{watches.length.toString().padStart(2, "0")} WATCHES</span></div>{watches.length ? <div className="watch-items">{watches.map((watch) => <div className="watch-item" key={watch.id}><div className="watch-file"><FileText size={17} /></div><div className="watch-main"><b>{watch.name}</b><span>{watch.url}</span></div><div className="watch-state"><i />{watch.status}</div><button className="icon-button" title="Check for changes" disabled={!canSubmit} onClick={() => void checkWatch(watch.id)}><RefreshCw size={15} /></button></div>)}</div> : <p className="watch-empty">No watches registered from this wallet yet. Create one above to establish a validator-agreed baseline.</p>}</div>}
      </section>

      <section className="demo-section" id="demo"><div className="section-wrap"><div className="section-heading"><div><div className="eyebrow">DEMO LAB <span className="eyebrow-line" /></div><h2>Four cases. One real contract.</h2><p>Load public fixture URLs into the compare form. No sample verdict is fabricated.</p></div><a className="text-link" href={`${basePath}/demo/api-terms-v1.txt`} target="_blank">Open baseline fixture <ArrowUpRight size={14} /></a></div><div className="demo-cards">{examples.map((example, index) => <button className="demo-card" key={example.slug} onClick={() => chooseExample(example.slug)}><div className="demo-card-top"><span className="demo-index">0{index + 1}</span><span className="demo-mark" style={{ color: example.color }}><FileDiff size={18} /></span></div><b>{example.title}</b><span className="demo-expected">{example.expected}</span><span className="demo-load">Load scenario <ArrowRight size={13} /></span></button>)}</div>{!demoBase && <p className="demo-note"><CircleHelp size={13} /> Demo URLs need a public HTTPS deployment before Bradbury validators can fetch them. Localhost is intentionally rejected by the contract.</p>}</div></section>

      <section className="protocol-section section-wrap" id="protocol"><div className="protocol-copy"><div className="eyebrow">WHY GENLAYER <span className="eyebrow-line" /></div><h2>A hash knows that.<br /><em>Consensus decides what it means.</em></h2><p>ClauseLens keeps the judgment inside its Intelligent Contract. A leader fetches the source and extracts a compact policy profile; validators independently repeat the work. They must agree on the verdict and changed categories, stay within an 8-point severity tolerance, and match the normalized candidate claims. Summary wording can differ.</p><a className="text-link" href="https://docs.genlayer.com/developers/intelligent-contracts/equivalence-principle" target="_blank" rel="noreferrer">GenLayer Equivalence Principle <ArrowUpRight size={14} /></a></div><div className="protocol-steps"><div><span>01</span><div><b>Fetch public evidence</b><p>HTTPS source content is capped, treated as untrusted, and never stored in full.</p></div><Check size={15} /></div><div><span>02</span><div><b>Independent semantic read</b><p>Each validator re-fetches and extracts structured policy claims.</p></div><Check size={15} /></div><div><span>03</span><div><b>Narrow equivalence</b><p>Discrete decisions and normalized claims must align; free-form prose is ignored.</p></div><Check size={15} /></div><div><span>04</span><div><b>Deterministic state update</b><p>Only after consensus does the contract store a compact receipt and new baseline.</p></div><Check size={15} /></div></div></section>

      <footer className="footer"><div className="section-wrap footer-inner"><a className="brand" href="#top"><span className="brand-mark"><Fingerprint size={20} /></span><span>clause<span className="brand-light">lens</span></span></a><span>Semantic policy monitoring, with shared evidence.</span><div><a href="https://github.com/genlayerlabs/genlayer-project-boilerplate" target="_blank" rel="noreferrer">Built on GenLayer <ArrowUpRight size={12} /></a><a href="https://docs.genlayer.com" target="_blank" rel="noreferrer">Protocol docs <ArrowUpRight size={12} /></a></div></div></footer>
    </main>
  );
}
