import Redis from "ioredis";

export const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
});

redis.on("connect", () => console.log("Redis connected successfully."));
redis.on("ready", () => console.log("Redis ready."));
redis.on("error", (err) => console.error("Redis Client Error:", err));
redis.on("close", () => console.warn("Redis connection closed."));
