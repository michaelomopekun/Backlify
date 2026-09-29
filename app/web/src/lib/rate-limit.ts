import { redis } from "shared/config/redis";
import { logger } from "shared/config/logger";
import { NextRequest, NextResponse } from "next/server";

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  retryAfterSeconds?: number;
}

// In-memory fallback if Redis is unavailable
interface MemoryBucket {
  count: number;
  resetAt: number;
}
const memoryStore = new Map<string, MemoryBucket>();

/**
 * Clean memory store periodically (every 5 minutes)
 */
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of memoryStore.entries()) {
      if (bucket.resetAt <= now) {
        memoryStore.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

/**
 * Sliding window rate limit using Redis with fallback to in-memory store.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const prefixedKey = `ratelimit:${key}`;

  try {
    // Attempt Redis INCR with TTL
    const pipeline = redis.pipeline();
    pipeline.incr(prefixedKey);
    pipeline.ttl(prefixedKey);
    const results = await pipeline.exec();

    if (results && results[0] && results[1]) {
      const [errIncr, countVal] = results[0];
      const [errTtl, ttlVal] = results[1];

      if (!errIncr && typeof countVal === "number") {
        const count = countVal;
        let ttl = typeof ttlVal === "number" ? ttlVal : -1;

        // If key was newly created (ttl == -1), set the expiration
        if (ttl === -1) {
          await redis.expire(prefixedKey, windowSeconds);
          ttl = windowSeconds;
        }

        const remaining = Math.max(0, limit - count);
        const allowed = count <= limit;

        return {
          allowed,
          limit,
          remaining,
          resetSeconds: ttl > 0 ? ttl : windowSeconds,
          retryAfterSeconds: allowed ? undefined : ttl > 0 ? ttl : windowSeconds,
        };
      }
    }
  } catch (redisError) {
    logger.warn({ error: redisError, key: prefixedKey }, "Redis rate limiter error, falling back to memory");
  }

  // Fallback: In-memory window rate limit
  const now = Date.now();
  const bucket = memoryStore.get(prefixedKey);

  if (!bucket || bucket.resetAt <= now) {
    memoryStore.set(prefixedKey, {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    });
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      resetSeconds: windowSeconds,
    };
  }

  bucket.count += 1;
  const remaining = Math.max(0, limit - bucket.count);
  const allowed = bucket.count <= limit;
  const resetSeconds = Math.ceil((bucket.resetAt - now) / 1000);

  return {
    allowed,
    limit,
    remaining,
    resetSeconds,
    retryAfterSeconds: allowed ? undefined : resetSeconds,
  };
}

/**
 * Extracts a reliable client IP address from request headers.
 */
export function getClientIp(req: NextRequest | Request): string {
  const headers = req.headers;
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "127.0.0.1";
}

/**
 * Standard HTTP 429 response builder with rate limit headers.
 */
export function rateLimitResponse(
  result: RateLimitResult,
  customMessage?: string
): NextResponse {
  const retryAfter = result.retryAfterSeconds ?? result.resetSeconds;
  return NextResponse.json(
    {
      success: false,
      error:
        customMessage ||
        `Rate limit exceeded. Too many requests. Please wait ${retryAfter} second${retryAfter === 1 ? "" : "s"} before trying again.`,
      retryAfterSeconds: retryAfter,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(result.resetSeconds),
      },
    }
  );
}

/**
 * Attaches rate limit tracking headers to successful responses.
 */
export function attachRateLimitHeaders(res: NextResponse, result: RateLimitResult): NextResponse {
  res.headers.set("X-RateLimit-Limit", String(result.limit));
  res.headers.set("X-RateLimit-Remaining", String(result.remaining));
  res.headers.set("X-RateLimit-Reset", String(result.resetSeconds));
  return res;
}
