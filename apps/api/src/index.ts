import server from "./app";
import { connectDB as MongoDBConnect } from "./database/mongo.db";
import redis from "./database/redis.db";

async function run() {
    await MongoDBConnect();
    await redis.connect();
    
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Listening in port ${PORT}...`));
}

run();

