import { Server, Socket } from "socket.io";
import { Queue, QueueEvents } from "bullmq";

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;

interface BroadcastEventData {
  jobId: string;
  event: string;
  progress?: number;
  result?: any;
  failedReason?: string;
}

export class JobNotificationSocket {
  private bulkReplyQueue: Queue;
  private bulkReplyQueueEvents: QueueEvents;

  constructor(private io: Server) {
    this.bulkReplyQueue = new Queue("bulkReplyQueue", {
      connection: { host: REDIS_HOST, port: REDIS_PORT },
    });
    this.bulkReplyQueueEvents = new QueueEvents("bulkReplyQueue", {
      connection: { host: REDIS_HOST, port: REDIS_PORT },
    });
    this.initialize();
  }

  private initialize(): void {
    this.io.on("connection", (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);
      socket.on("subscribeSeller", (sellerId: string) => {
        console.log(`Socket ${socket.id} subscribed to sellerId: ${sellerId}`);
        socket.join(sellerId);
      });
    });

    this.bulkReplyQueueEvents.on("progress", async ({ jobId, data }) => {
      console.log(`Job ${jobId} progress: ${data}`);
      const progressValue: number = typeof data === "number" ? data : 0;
      await this.broadcastToSeller({ event: "progress", jobId, progress: progressValue });
    });

    this.bulkReplyQueueEvents.on("completed", async ({ jobId, returnvalue }) => {
      console.log(`Job ${jobId} completed`);
      await this.broadcastToSeller({ event: "completed", jobId, result: returnvalue });
    });

    this.bulkReplyQueueEvents.on("failed", async ({ jobId, failedReason }) => {
      console.log(`Job ${jobId} failed: ${failedReason}`);
      await this.broadcastToSeller({ event: "failed", jobId, failedReason });
    });
  }

  private async broadcastToSeller(eventData: BroadcastEventData): Promise<void> {
    const job = await this.bulkReplyQueue.getJob(eventData.jobId);
    if (!job) return;
    const { sellerId } = job.data;
    if (!sellerId) return;
    const message = { ...eventData, sellerId };
    this.io.to(sellerId).emit("jobUpdate", message);
  }
}
