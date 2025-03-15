import { Worker, Job } from "bullmq";
import { Pool, PoolClient } from "pg";
import { isTicketUnresolved } from "../queries/tickets.queries";
import { addMessageToTicket } from "../queries/messages.queries";
import pLimit from "p-limit";

interface BulkReplyJobData {
  ticketIds: number[];
  senderType: 'customer' | 'operator';
  senderId: string;
  text: string;
}

interface BulkReplyProgress {
  success: number;
  error: number;
  total: number;
}

export class BulkReplyWorkerService {
  private worker: Worker;
  private pool: Pool;
  private concurrencyLimit: number;
  private limit: ReturnType<typeof pLimit>;
  private artificialDelaySeconds: number;

  constructor(
    pool: Pool,
    redisConfig: { host: string; port: number },
    concurrencyLimit = 10,
    artificialDelaySeconds = 0
  ) {
    this.pool = pool;
    this.concurrencyLimit = concurrencyLimit;
    this.limit = pLimit(this.concurrencyLimit);
    this.artificialDelaySeconds = artificialDelaySeconds;

    this.worker = new Worker("bulkReplyQueue", this.processJob.bind(this), {
      connection: redisConfig,
    });

    this.registerEvents();
  }

  private registerEvents() {
    this.worker.on("completed", (job: Job) => {
      console.log(`Bulk reply job ${job.id} completed.`);
    });

    this.worker.on("failed", (job: Job<any, any, string> | undefined, err: Error, prev: string) => {
        console.error(`Bulk reply job ${job?.id} failed: ${err.message} (previous state: ${prev})`);
    });
  }

  private async getDbClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  private async delay(seconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  private async processTicket(ticketId: number, job: Job<BulkReplyJobData>, progress: BulkReplyProgress): Promise<void> {
    const client = await this.getDbClient();
    try {
      // artificial delay for testing purposes
      if (this.artificialDelaySeconds > 0) {
        await this.delay(Math.random() * (this.artificialDelaySeconds - 1) + 1);
      }
      const [{ ok }] = await isTicketUnresolved.run({ ticketId }, client);
      if (ok) {
        const messages = await addMessageToTicket.run(
          { ticketId, text: job.data.text, senderType: job.data.senderType, senderId: job.data.senderId },
          client
        );
        if (messages.length === 1) {
          progress.success++;
        } else {
          progress.error++;
        }
      } else {
        progress.error++;
      }
    } catch (err) {
      console.error(`Error processing ticket ${ticketId}:`, err);
      progress.error++;
    } finally {
      client.release();
      await job.updateProgress({ ...progress });
    }
  }

  private async processJob(job: Job<BulkReplyJobData>): Promise<void> {
    const { ticketIds } = job.data;
    const total = ticketIds.length;
    const progress: BulkReplyProgress = { success: 0, error: 0, total };
    const tasks = ticketIds.map(ticketId =>
      this.limit(() => this.processTicket(ticketId, job, progress))
    );
    await Promise.all(tasks);
  }

  public getWorker(): Worker {
    return this.worker;
  }
}
