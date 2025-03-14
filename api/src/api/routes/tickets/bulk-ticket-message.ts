import { FastifyInstance } from "fastify";
import { Type as T } from "@sinclair/typebox";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Queue } from "bullmq";
import { BadRequest } from "http-errors";

const bulkReplyBody = T.Object({
  ticketIds: T.Array(T.Number()),
  senderType: T.Union([T.Literal("customer"), T.Literal("operator")]),
  senderId: T.String(),
  text: T.String()
});

const bulkReplyResponse = T.Object({
  jobId: T.String(),
});

export async function routeBulkReply(instance: FastifyInstance) {
  const bulkReplyQueue = new Queue("bulkReplyQueue", {
    connection: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
    },
  });

  instance.withTypeProvider<TypeBoxTypeProvider>().route({
    method: "POST",
    url: "/tickets/bulk-reply",
    schema: {
      body: bulkReplyBody,
      response: { 200: bulkReplyResponse },
    },
    handler: async (req) => {
      const { ticketIds, senderType, senderId, text } = req.body;
      if (!ticketIds || ticketIds.length === 0) {
        throw new BadRequest("No ticket IDs provided");
      }
      const jobName = `${senderType} - ${text}`;
      const job = await bulkReplyQueue.add(jobName, {
        ticketIds,
        senderType,
        senderId,
        text
      });
      return { jobId: job.id as string };
    },
  });
}
