import { Pool } from "pg";
import { BulkReplyWorkerService } from "./BulkReplyWorkerService";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
};

const workerConcurrency = 2;
const ticketConcurrencyLimit = 10;
const artificialMaxDelaySeconds = 10;

const bulkReplyWorkerService = new BulkReplyWorkerService(
    pool,
    redisConfig,
    workerConcurrency,
    ticketConcurrencyLimit,
    artificialMaxDelaySeconds,
);

export const index = bulkReplyWorkerService.getWorker();
