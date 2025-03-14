import { FastifyInstance } from 'fastify';
import { Queue } from 'bullmq';
import { BadRequest } from 'http-errors';

export async function routeArchiveJob(instance: FastifyInstance) {
  const bulkReplyQueue = new Queue("bulkReplyQueue", {
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
    },
  });

  instance.route({
    method: "POST",
    url: "/jobs/:jobId/archive",
    handler: async (req, reply) => {
      const { jobId } = req.params as { jobId: string };
      if (!jobId) {
        throw new BadRequest("Job id is required");
      }
      const job = await bulkReplyQueue.getJob(jobId);
      if (!job) {
        throw new BadRequest("Job not found");
      }
      const updatedData = { ...job.data, archived: true };
      await job.updateData(updatedData);
      reply.send({ success: true });
    },
  });
}
