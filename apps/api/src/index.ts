import server from "./app";
import { connectDB as MongoDBConnect } from "./database/mongo.db";
import redis from "./database/redis.db";
import { connectPostgresWithRetry } from "./database/postgres.db";

async function run() {
    try {
        await MongoDBConnect();
        await redis.connect();
        await connectPostgresWithRetry();
    
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => console.log(`Listening in port ${PORT}...`));
    } catch (error) {
        console.error("Failed to start the server:", error);
        process.exit(1);
    }
}

run();

