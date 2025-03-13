import { createServer } from "http";
import { Server } from "socket.io";
import { JobNotificationSocket } from "./jobNotificationSocket";

const PORT = Number(process.env.WS_PORT) || 8080;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});

new JobNotificationSocket(io);
