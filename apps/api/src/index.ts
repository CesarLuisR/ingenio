import server from "./app";
import { connectDB as MongoDBConnect } from "./database/mongo.db";
import redis from "./database/redis.db";
import { clearDatabase, connectPostgresWithRetry } from "./database/postgres.db";
import { createUsers } from "./lib/utils/createUsers";

async function run() {
    try {
        await MongoDBConnect();
        await redis.connect();
        await connectPostgresWithRetry();

        // dev env
        if (process.env.NODE_ENV !== "production") {
            await clearDatabase();
            await redis.flushAll();
            await createUsers();
        }
    
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => console.log(`Listening in port ${PORT}...`));
    } catch (error) {
        console.error("Failed to start the server:", error);
        process.exit(1);
    }
}

run();

