import Redis from "ioredis";

import { z } from "zod";

import { logger } from "./logger";



// validate url form env
const RedisEnvConfig = z.object({

    REDIS_URL: z.string().url("Invalid Redis URL format").optional(),

});


function getRedisConfig() {

    const env = RedisEnvConfig.parse(process.env);

    return env.REDIS_URL || "redis://localhost:6379";

}


// Define global for Redis to avoid multiple connections in Next.js HMR development mode
const globalForRedis = globalThis as unknown as {
    redis: Redis | undefined;
};

let redisInstance: Redis;

if (globalForRedis.redis) {

    redisInstance = globalForRedis.redis;

} else {

    redisInstance = new Redis(getRedisConfig(), {

        maxRetriesPerRequest: null, // null for now, will change

        enableReadyCheck: true,

        enableOfflineQueue: true,

        retryStrategy(times) {

            const delay = Math.min(times * 50, 2000);

            return delay;

        },

    });

    //connect handlers
    redisInstance.on("connect", () => {

        logger.info("Connected to Redis");

    });

    redisInstance.on("error", (err) => {

        logger.error({ err }, "Redis connection error");

    });

    redisInstance.on("close", () => {

        logger.warn("Redis connection closed");

    });

    redisInstance.on("reconnecting", (delay: number) => {

        logger.info({ delay }, "Reconnecting to Redis");

    });

    if (process.env.NODE_ENV !== "production") {

        globalForRedis.redis = redisInstance;

    }

}


export const redis = redisInstance;