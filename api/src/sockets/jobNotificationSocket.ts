import { Server, Socket } from "socket.io";
import { Queue, QueueEvents } from "bullmq";

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;

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
      socket.on("subscribeSender", async (senderId: string) => {
        console.log(`Socket ${socket.id} subscribed to senderId: ${senderId}`);
        socket.join(senderId);

        try {
          const jobs = await this.bulkReplyQueue.getJobs(
            ["completed", "failed", "active", "waiting"],
            0,
            -1
          );
          const senderJobs = jobs
            .filter(job => job.data.senderId === senderId)
            .map(job => this.formatJobData(job));
          socket.emit("initialJobList", senderJobs);
        } catch (err) {
          console.error("Error fetching initial jobs:", err);
        }
      });
    });

    this.bulkReplyQueueEvents.on("progress", async ({ jobId, data }) => {
      console.log(`Job ${jobId} progress: ${data}`);
      await this.emitJobUpdate(jobId, { event: "progress", progress: typeof data === "number" ? data : 0 });
    });

    this.bulkReplyQueueEvents.on("completed", async ({ jobId, returnvalue }) => {
      console.log(`Job ${jobId} completed`);
      await this.emitJobUpdate(jobId, { event: "completed", result: returnvalue });
    });

    this.bulkReplyQueueEvents.on("failed", async ({ jobId, failedReason }) => {
      console.log(`Job ${jobId} failed: ${failedReason}`);
      await this.emitJobUpdate(jobId, { event: "failed", failedReason });
    });

    this.bulkReplyQueueEvents.on("waiting", async ({ jobId }) => {
      console.log(`Job ${jobId} is waiting (created)`);
      const job = await this.bulkReplyQueue.getJob(jobId);
      if (!job) return;
      const jobData = this.formatJobData(job);
      this.io.to(job.data.senderId).emit("jobCreated", jobData);
    });
  }

  private formatJobData(job: any) {
    return {
      jobId: job.id,
      name: job.name,
      createdAt: new Date(job.timestamp),
      completedAt: job.finishedOn ? new Date(job.finishedOn) : null,
      progress: typeof job.progress === "number" ? job.progress : 0,
      state: job.finishedOn
        ? "completed"
        : job.failedReason
          ? "failed"
          : job.processedOn
            ? "active"
            : "waiting",
      result: job.returnvalue,
      failedReason: job.failedReason,
      archived: job.data.archived || false,
    };
  }

  private async emitJobUpdate(jobId: string, extraData: Partial<{ event: string; progress?: number; result?: any; failedReason?: string; }>) {
    const job = await this.bulkReplyQueue.getJob(jobId);
    if (!job) return;
    const { senderId } = job.data;
    if (!senderId) return;
    const jobData = this.formatJobData(job);
    const message = { ...jobData, ...extraData };
    this.io.to(senderId).emit("jobUpdate", message);
  }
}
