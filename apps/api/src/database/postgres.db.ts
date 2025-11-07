import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function connectPostgresWithRetry(
    retries = 10,
    delayMs = 2000
): Promise<void> {
    for (let i = 1; i <= retries; i++) {
        try {
            await prisma.$connect();
            console.log("✅ Connected to Postgres via Prisma");
            return;
        } catch (err: any) {
            console.warn(
                `⏳ Postgres not ready (attempt ${i}/${retries}): ${err.message}`
            );
            if (i === retries) throw err;
            await new Promise((res) => setTimeout(res, delayMs));
        }
    }
}

export default prisma;
