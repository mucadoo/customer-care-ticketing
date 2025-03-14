import { Worker } from "bullmq";
import { Pool } from "pg";
import { isTicketUnresolved } from "../queries/tickets.queries";
import { addMessageToTicket } from "../queries/messages.queries";
import pLimit from "p-limit";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function getDb() {
  return pool.connect();
}

const concurrencyLimit = 10;
const limit = pLimit(concurrencyLimit);
const delay = (s: number) => new Promise(resolve => setTimeout(resolve, s * 1000));

const bulkReplyWorker = new Worker(
  "bulkReplyQueue",
  async (job) => {
    const { ticketIds, senderType, senderId, text } = job.data;
    const total = ticketIds.length;
    let successCount = 0;
    let errorCount = 0;

    const processTicket = async (ticketId: number) => {
      const client = await getDb();
      try {
        const [{ ok }] = await isTicketUnresolved.run({ ticketId }, client);
        if (ok) {
          await delay(5);
          const messages = await addMessageToTicket.run(
            { ticketId, text, senderType, senderId },
            client
          );
          if (messages.length === 1) {
            successCount++;
          } else {
            errorCount++;
          }
        } else {
          successCount++;
        }
      } catch (err) {
        console.error(`Error processing ticket ${ticketId}:`, err);
        errorCount++;
      } finally {
        client.release();
      }
      await job.updateProgress({ success: successCount, error: errorCount, total });
    };

    const tasks = ticketIds.map((ticketId: number) =>
      limit(() => processTicket(ticketId))
    );
    await Promise.all(tasks);
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
    },
  }
);

bulkReplyWorker.on("completed", (job) => {
  console.log(`Bulk reply job ${job.id} completed.`);
});

bulkReplyWorker.on("failed", (job, err) => {
  console.error(`Bulk reply job ${job?.id} failed: ${err.message}`);
});
