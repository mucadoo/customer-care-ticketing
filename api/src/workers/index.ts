import { Pool } from "pg";
import { BulkReplyWorkerService } from "./BulkReplyWorkerService";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
};

const concurrencyLimit = 10;
const artificialDelaySeconds = 10;

const bulkReplyWorkerService = new BulkReplyWorkerService(
  pool,
  redisConfig,
  concurrencyLimit,
  artificialDelaySeconds
);

export const index = bulkReplyWorkerService.getWorker();
