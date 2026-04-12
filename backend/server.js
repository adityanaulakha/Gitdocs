import dotenv from "dotenv";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app, { initializeUtils } from "./src/app.js";
import Document from "./src/models/Document.js";
import pubsub from "./src/utils/pubsub.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
    ],
    methods: ["GET", "POST"],
  },
});

// Initialize utilities
await initializeUtils();

// Subscribe to Redis pub/sub channels for cross-server communication
pubsub.subscribe('document-updates', (data) => {
  const { documentId, content, type, userId } = data;
  if (type === 'change') {
    io.to(`document:${documentId}`).emit("document-update", {
      documentId,
      content,
    });
  } else if (type === 'save') {
    io.to(`document:${documentId}`).emit("document-saved", {
      documentId,
      content,
      updatedAt: new Date(),
    });
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-document", (documentId) => {
    if (!documentId) return;
    const room = `document:${documentId}`;
    socket.join(room);
    socket.emit("joined-document", { documentId });
  });

  socket.on("document-change", ({ documentId, content }) => {
    if (!documentId) return;

    // Broadcast to local clients
    const room = `document:${documentId}`;
    socket.to(room).emit("document-update", {
      documentId,
      content,
    });

    // Publish to Redis for cross-server communication
    pubsub.publish('document-updates', {
      documentId,
      content,
      type: 'change'
    });
  });

  socket.on("save-document", async ({ documentId, content, userId }) => {
    if (!documentId) return;
    try {
      const document = await Document.findByIdAndUpdate(
        documentId,
        {
          content,
          updatedAt: new Date(),
          lastEditedBy: userId || null,
        },
        { new: true },
      );

      if (document) {
        // Broadcast to local clients
        io.to(`document:${documentId}`).emit("document-saved", {
          documentId,
          content: document.content,
          updatedAt: document.updatedAt,
        });

        // Publish to Redis for cross-server communication
        pubsub.publish('document-updates', {
          documentId,
          content: document.content,
          type: 'save',
          userId
        });

        // Invalidate document cache
        const cache = (await import('./src/utils/cache.js')).default;
        await cache.del(`document:${documentId}`);
      }
    } catch (error) {
      console.error("Socket save-document error:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});