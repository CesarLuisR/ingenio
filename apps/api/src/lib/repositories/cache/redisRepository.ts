import { CacheRepository } from ".";
import redis from "../../../database/redis.db";

export default class RedisRepository implements CacheRepository {
    async get(key: string): Promise<string | null> {
        return await redis.get(key);
    }

    async set(key: string, value: string): Promise<void> {
        await redis.set(key, value);
    }
}