import { createServer } from "http";
import { Server } from "socket.io";
import {JobNotificationSocket, QueueConfig} from "./jobNotificationSocket";

const PORT = Number(process.env.WS_PORT) || 8080;
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});

const queues: QueueConfig[] = [
  {
    name: "bulkReplyQueue",
    connection: { host: process.env.REDIS_HOST || "localhost", port: Number(process.env.REDIS_PORT) || 6379 },
  },
];

new JobNotificationSocket(io, queues);
