import app from "./app";
import { prisma } from "./lib/prisma";
import { redis } from "./lib/redis";

let isShuttingDown = false;

async function main() {
  const port = process.env.PORT || 5000;

  try {
    await prisma.$connect();
    console.log("Connected to the database successfully.");

    const server = app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });

    // Graceful shutdown handler
    const shutdown = async (signal: string) => {
      if (isShuttingDown) return;
      isShuttingDown = true;
      console.log(`\n${signal} received. Shutting down gracefully...`);

      const forceExit = setTimeout(() => {
        console.error("Forcing shutdown after timeout.");
        process.exit(1);
      }, 10_000);
      forceExit.unref();

      try {
        await new Promise<void>((resolve, reject) =>
          server.close((err) => (err ? reject(err) : resolve())),
        );
        console.log("HTTP server closed.");
      } catch (err) {
        console.error("Error closing HTTP server:", err);
      }

      try {
        await prisma.$disconnect();
        console.log("Database connection closed.");
      } catch (err) {
        console.error("Error disconnecting from database:", err);
      }

      try {
        await redis.quit();
        console.log("Redis connection closed.");
      } catch (err) {
        console.error("Error disconnecting from Redis:", err);
      }

      clearTimeout(forceExit);
      process.exit(0);
    };

    // Docker/Kubernetes send SIGTERM; Ctrl+C sends SIGINT
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // Catch unhandled errors so the process doesn't die silently
    process.on("unhandledRejection", (reason) => {
      console.error("Unhandled Rejection:", reason);
      process.exit(1);
    });

    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
    await prisma.$disconnect().catch(() => {});
    await redis.quit().catch(() => {});
    process.exit(1);
  }
}

main();
