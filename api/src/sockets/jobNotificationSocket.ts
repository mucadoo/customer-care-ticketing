import { Server, Socket } from "socket.io";
import { Queue, QueueEvents, Job } from "bullmq";

export enum JobEvents {
  INITIAL_JOB_LIST = "initialJobList",
  JOB_CREATED = "jobCreated",
  JOB_UPDATE = "jobUpdate",
}

export interface QueueConfig {
  name: string;
  connection: { host: string; port: number };
}

export class JobNotificationSocket {
  private io: Server;
  private queues: Map<string, Queue> = new Map();
  private queueEvents: Map<string, QueueEvents> = new Map();

  constructor(io: Server, queueConfigs: QueueConfig[]) {
    this.io = io;
    queueConfigs.forEach(config => {
      const queue = new Queue(config.name, { connection: config.connection });
      const events = new QueueEvents(config.name, { connection: config.connection });
      this.queues.set(config.name, queue);
      this.queueEvents.set(config.name, events);
      this.registerQueueEvents(config.name, queue, events);
    });
    this.initializeSocket();
  }

  private initializeSocket(): void {
    this.io.on("connection", (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);
      socket.on("subscribeSender", async (senderId: string) => {
        console.log(`Socket ${socket.id} subscribed to senderId: ${senderId}`);
        socket.join(senderId);
        for (const [name, queue] of this.queues) {
          try {
            const jobs = await queue.getJobs(["completed", "failed", "active", "waiting"], 0, -1);
            const senderJobs = jobs
                .filter(job => job.data.senderId === senderId)
                .map(job => this.formatJobData(job, name));
            socket.emit(JobEvents.INITIAL_JOB_LIST, { queue: name, jobs: senderJobs });
          } catch (err) {
            console.error(`Error fetching initial jobs for queue ${name}:`, err);
          }
        }
      });
    });
  }

  private registerQueueEvents(queueName: string, queue: Queue, events: QueueEvents): void {
    events.on("progress", async ({ jobId, data }) => {
      console.log(`Queue ${queueName} - Job ${jobId} progress:`, data);
      await this.broadcastToSender(queue, jobId, { event: "progress", progress: data });
    });

    events.on("completed", async ({ jobId, returnvalue }) => {
      console.log(`Queue ${queueName} - Job ${jobId} completed`);
      await this.broadcastToSender(queue, jobId, { event: "completed", result: returnvalue });
    });

    events.on("failed", async ({ jobId, failedReason }) => {
      console.log(`Queue ${queueName} - Job ${jobId} failed: ${failedReason}`);
      await this.broadcastToSender(queue, jobId, { event: "failed", failedReason });
    });

    events.on("waiting", async ({ jobId }) => {
      console.log(`Queue ${queueName} - Job ${jobId} is waiting (created)`);
      const job = await queue.getJob(jobId);
      if (!job) return;
      const { senderId } = job.data;
      if (!senderId) return;
      const message = this.formatJobData(job, queueName);
      this.io.to(senderId).emit(JobEvents.JOB_CREATED, message);
    });
  }

  private formatJobData(job: Job, queueName: string) {
    return {
      queue: queueName,
      jobId: job.id,
      name: job.name,
      createdAt: new Date(job.timestamp),
      completedAt: job.finishedOn ? new Date(job.finishedOn) : null,
      progress: job.progress,
      state: job.finishedOn
          ? "completed"
          : job.failedReason
              ? "failed"
              : job.processedOn
                  ? "active"
                  : "waiting",
      result: job.returnvalue,
      failedReason: job.failedReason,
    };
  }

  private async broadcastToSender(queue: Queue, jobId: string, eventData: { event: string; progress?: any; result?: any; failedReason?: string; }) {
    const job = await queue.getJob(jobId);
    if (!job) return;
    const { senderId } = job.data;
    if (!senderId) return;
    const message = { ...this.formatJobData(job, queue.name), ...eventData };
    this.io.to(senderId).emit(JobEvents.JOB_UPDATE, message);
  }
}
