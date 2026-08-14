import Database from "better-sqlite3";
import { dirname } from "node:path";
import { mkdirSync } from "node:fs";
import { config } from "./config.js";

export type SettlementStage = "PREFLIGHT" | "FDC_PREPARING" | "FDC_SUBMITTED" | "FDC_WAITING" | "PROOF_READY" | "SETTLING" | "SETTLED" | "FAILED";
export type Job = {
  id: string; tradeId: string; xrplTxHash: string; stage: SettlementStage;
  abiEncodedRequest?: string; fdcRequestTxHash?: string; votingRoundId?: number;
  settlementTxHash?: string; errorCode?: string; errorMessage?: string;
  createdAt: string; updatedAt: string;
};

mkdirSync(dirname(config.JOB_DB_PATH), { recursive: true });
const db = new Database(config.JOB_DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(`CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY, trade_id TEXT NOT NULL, xrpl_tx_hash TEXT NOT NULL UNIQUE,
  stage TEXT NOT NULL, abi_encoded_request TEXT, fdc_request_tx_hash TEXT,
  voting_round_id INTEGER, settlement_tx_hash TEXT, error_code TEXT, error_message TEXT,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
); CREATE INDEX IF NOT EXISTS jobs_trade_idx ON jobs(trade_id);`);

const map = (row: any): Job => ({ id: row.id, tradeId: row.trade_id, xrplTxHash: row.xrpl_tx_hash, stage: row.stage, abiEncodedRequest: row.abi_encoded_request ?? undefined, fdcRequestTxHash: row.fdc_request_tx_hash ?? undefined, votingRoundId: row.voting_round_id ?? undefined, settlementTxHash: row.settlement_tx_hash ?? undefined, errorCode: row.error_code ?? undefined, errorMessage: row.error_message ?? undefined, createdAt: row.created_at, updatedAt: row.updated_at });

export function createJob(job: Pick<Job, "id" | "tradeId" | "xrplTxHash">): Job {
  const now = new Date().toISOString();
  db.prepare("INSERT INTO jobs(id,trade_id,xrpl_tx_hash,stage,created_at,updated_at) VALUES(?,?,?,?,?,?)").run(job.id, job.tradeId, job.xrplTxHash, "PREFLIGHT", now, now);
  return getJob(job.id)!;
}
export function getJob(id: string) { const row = db.prepare("SELECT * FROM jobs WHERE id=?").get(id); return row ? map(row) : undefined; }
export function findByTx(hash: string) { const row = db.prepare("SELECT * FROM jobs WHERE xrpl_tx_hash=?").get(hash); return row ? map(row) : undefined; }
export function listActiveJobs() { return (db.prepare("SELECT * FROM jobs WHERE stage NOT IN ('SETTLED','FAILED')").all() as any[]).map(map); }
export function updateJob(id: string, changes: Partial<Job>) {
  const current = getJob(id); if (!current) throw new Error("Job not found");
  const next = { ...current, ...changes, updatedAt: new Date().toISOString() };
  db.prepare(`UPDATE jobs SET stage=?,abi_encoded_request=?,fdc_request_tx_hash=?,voting_round_id=?,settlement_tx_hash=?,error_code=?,error_message=?,updated_at=? WHERE id=?`).run(next.stage, next.abiEncodedRequest ?? null, next.fdcRequestTxHash ?? null, next.votingRoundId ?? null, next.settlementTxHash ?? null, next.errorCode ?? null, next.errorMessage ?? null, next.updatedAt, id);
  return getJob(id)!;
}

