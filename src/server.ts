import app from "./app";
import { prisma } from "./lib/prisma";

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
      console.log(`\n${signal} received. Shutting down gracefully...`);

      // Stop accepting new connections, finish in-flight requests
      server.close(async (err) => {
        if (err) {
          console.error("Error closing HTTP server:", err);
          process.exit(1);
        }

        console.log("HTTP server closed.");

        try {
          await prisma.$disconnect();
          console.log("Database connection closed.");
          process.exit(0);
        } catch (disconnectError) {
          console.error("Error disconnecting from database:", disconnectError);
          process.exit(1);
        }
      });

      // Force exit if shutdown takes too long (e.g. stuck connections)
      setTimeout(() => {
        console.error("Forcing shutdown after timeout.");
        process.exit(1);
      }, 10_000).unref();
    };

    // Docker/Kubernetes send SIGTERM; Ctrl+C sends SIGINT
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // Catch unhandled errors so the process doesn't die silently
    process.on("unhandledRejection", (reason) => {
      console.error("Unhandled Rejection:", reason);
      shutdown("unhandledRejection");
    });

    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      shutdown("uncaughtException");
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();