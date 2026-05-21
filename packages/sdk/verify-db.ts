import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not defined");
  }
  const adapter = new PrismaNeon({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const project = await prisma.project.findFirst({
      where: { name: "SDK Integration Test" },
    });

    if (!project) {
      console.log("No project found!");
      return;
    }

    console.log(`Found project: ${project.name} (${project.id})`);

    const logs = await prisma.log.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
    });

    console.log(`Total logs found in DB for this project: ${logs.length}`);
    for (const log of logs) {
      console.log(`- [${log.type}] ${log.message}`);
      console.log(`  Source: ${log.source}`);
      console.log(`  Fingerprint: ${log.fingerprint}`);
      if (log.stackTrace) {
        console.log(`  StackTrace (first 2 lines):`);
        console.log(log.stackTrace.split("\n").slice(0, 2).map(l => "    " + l).join("\n"));
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
