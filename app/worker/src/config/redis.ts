import Redis from "ioredis";

import { z } from "zod";

import { logger } from "./logger";



// validate url form env
const RedisEnvConfig = z.object({

    REDIS_URL: z.string().url("Invalid Redis URL format"),

});


function getRedisConfig() {

    const env = RedisEnvConfig.parse(process.env);

    return env.REDIS_URL;

}


// redis instance
export const redis = new Redis(getRedisConfig(), {

    maxRetriesPerRequest: null, // null for now, will change

    enableReadyCheck: true,

    enableOfflineQueue: true,

    retryStrategy(times) {

        const delay = Math.min(times * 50, 2000);

        return delay;

    },

});


//connect handlers
redis.on("connect", () => {

    logger.info("Connected to Redis");

});

redis.on("error", (err) => {

    logger.error({ err }, "Redis connection error");

});

redis.on("close", () => {

    logger.warn("Redis connection closed");

});

redis.on("reconnecting", (delay: number) => {

    logger.info({ delay }, "Reconnecting to Redis");

});