import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import cache from "./utils/cache.js";
import pubsub from "./utils/pubsub.js";
import rateLimiter from "./utils/rateLimiter.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import commitRoutes from "./routes/commitRoutes.js";
import versionRoutes from "./routes/versionRoutes.js";

const app = express();

// DB and Redis connections
await connectDB();
await connectRedis();

// Initialize utilities (will be called from server.js)
export const initializeUtils = async () => {
  await cache.init();
  await pubsub.init();
  await rateLimiter.init();
};

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
    ],
    credentials: true,
  }),
);

// Rate limiting - 100 requests per minute per IP
app.use('/api', rateLimiter.middleware({
  maxRequests: 100,
  windowSeconds: 60,
  keyGenerator: (req) => `${req.ip}:${req.path}`
}));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/commits", commitRoutes);
app.use("/api/versions", versionRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Server Error",
  });
});

export default app;