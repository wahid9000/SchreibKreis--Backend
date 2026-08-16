import { PrismaClient } from "../prisma/generated/prisma/client";
import app from "./app";
import { prisma } from "./lib/prisma";

async function main() {
  const port = process.env.PORT || 5000;

  try {
    await prisma.$connect();
    console.log("Connected to the database successfully.");

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
