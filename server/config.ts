import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  COSTON2_CHAIN_ID: z.coerce.number().int().default(114),
  COSTON2_RPC_URL: z.string().url(),
  COSTON2_EXPLORER_URL: z.string().url(),
  COSTON2_SYSTEMS_EXPLORER_URL: z.string().url(),
  COSTON2_FAUCET_URL: z.string().url(),
  XRPL_TESTNET_RPC: z.string().url(),
  XRPL_TESTNET_WS: z.string().url(),
  XRPL_TESTNET_EXPLORER_TX_BASE_URL: z.string().url(),
  FDC_VERIFIER_BASE_URL: z.string().url(),
  FDC_DA_LAYER_URL: z.string().url(),
  FDC_VERIFIER_API_KEY: z.string().min(1),
  FDC_RELAYER_PRIVATE_KEY: z.string().optional().default(""),
  USDT0_ADDRESS: z.string().optional().default(""),
  CLEARX_CONTRACT_ADDRESS: z.string().optional().default(""),
  CLEARX_DEPLOYMENT_BLOCK: z.coerce.number().int().nonnegative().optional().default(0),
  FDC_POLL_INTERVAL_MS: z.coerce.number().int().min(1000).default(7000),
  FDC_JOB_TIMEOUT_MS: z.coerce.number().int().min(60000).default(900000),
  JOB_DB_PATH: z.string().default("./data/clearx.sqlite"),
  FDC_START_RATE_LIMIT_PER_HOUR: z.coerce.number().int().positive().default(5),
});

export const config = envSchema.parse(process.env);
export const isConfigured = () => /^0x[0-9a-fA-F]{40}$/.test(config.CLEARX_CONTRACT_ADDRESS) && /^0x[0-9a-fA-F]{64}$/.test(config.FDC_RELAYER_PRIVATE_KEY);

