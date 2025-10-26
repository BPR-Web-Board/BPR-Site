// Description: Caching layer for WordPress API calls
// Provides Redis caching with in-memory fallback to reduce API calls

import { createClient, RedisClientType } from "redis";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheConfig {
  defaultTTL: number; // Default TTL in milliseconds
  maxSize: number; // Maximum number of entries in memory cache
  enableRedis: boolean; // Whether to use Redis
  redisUrl: string | undefined; // Redis connection URL
}

class WordPressCache {
  private memoryCache = new Map<string, CacheEntry<unknown>>();
  private config: CacheConfig;
  private redisClient: RedisClientType | null = null;
  private redisConnecting: boolean = false;
  private redisConnectionFailed: boolean = false;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes default
      maxSize: 1000, // Maximum 1000 entries
      enableRedis: typeof window === "undefined" && !!process.env.REDIS_URL,
      redisUrl: process.env.REDIS_URL,
      ...config,
    };

    // Initialize Redis if enabled
    if (this.config.enableRedis && this.config.redisUrl) {
      this.initRedis();
    }
  }

  /**
   * Initialize Redis connection
   */
  private async initRedis(): Promise<void> {
    if (
      this.redisConnecting ||
      this.redisClient ||
      this.redisConnectionFailed
    ) {
      return;
    }

    this.redisConnecting = true;

    try {
      this.redisClient = createClient({
        url: this.config.redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            // Retry every 3 seconds for up to 10 times
            if (retries > 10) {
              console.error("Redis: Max reconnection attempts reached");
              return new Error("Max reconnection attempts reached");
            }
            return 3000;
          },
        },
      });

      this.redisClient.on("error", (err) => {
        console.error("Redis Client Error:", err);
        this.redisConnectionFailed = true;
      });

      this.redisClient.on("connect", () => {
        console.log("Redis: Connected successfully");
        this.redisConnectionFailed = false;
      });

      this.redisClient.on("reconnecting", () => {
        console.log("Redis: Reconnecting...");
      });

      await this.redisClient.connect();
      console.log("Redis: Client initialized");
    } catch (error) {
      console.error("Redis: Failed to initialize:", error);
      this.redisClient = null;
      this.redisConnectionFailed = true;
    } finally {
      this.redisConnecting = false;
    }
  }

  /**
   * Get Redis client instance
   */
  private async getRedisClient(): Promise<RedisClientType | null> {
    if (!this.config.enableRedis || this.redisConnectionFailed) {
      return null;
    }

    if (!this.redisClient && !this.redisConnecting) {
      await this.initRedis();
    }

    return this.redisClient;
  }

  /**
   * Generate a cache key from function name and parameters
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private generateKey(functionName: string, params: any = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }, {} as any);

    return `wp:${functionName}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Check if a cache entry is still valid
   */
  private isValid(entry: CacheEntry<unknown>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Get data from cache (tries Redis first, then memory cache)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get<T>(functionName: string, params: any = {}): Promise<T | null> {
    const key = this.generateKey(functionName, params);

    // Try Redis first
    const redis = await this.getRedisClient();
    if (redis) {
      try {
        const cached = await redis.get(key);
        if (cached) {
          console.log(`Redis Cache HIT for ${functionName}`);
          return JSON.parse(cached);
        }
      } catch (error) {
        console.error("Redis GET error:", error);
        // Fall through to memory cache
      }
    }

    // Fall back to memory cache
    const entry = this.memoryCache.get(key);

    if (!entry || !this.isValid(entry)) {
      this.memoryCache.delete(key);
      return null;
    }

    console.log(`Memory Cache HIT for ${functionName}`);
    return entry.data as T;
  }

  /**
   * Set data in cache (stores in both Redis and memory)
   */
  async set<T>(
    functionName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: any = {},
    data: T,
    ttl?: number
  ): Promise<void> {
    const key = this.generateKey(functionName, params);
    const ttlMs = ttl || this.config.defaultTTL;
    const ttlSeconds = Math.floor(ttlMs / 1000);

    // Store in Redis
    const redis = await this.getRedisClient();
    if (redis) {
      try {
        await redis.setEx(key, ttlSeconds, JSON.stringify(data));
        console.log(`Redis Cache SET for ${functionName}`);
      } catch (error) {
        console.error("Redis SET error:", error);
        // Continue to memory cache even if Redis fails
      }
    }

    // Also store in memory cache as fallback
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    };

    // Implement LRU eviction if cache is full
    if (this.memoryCache.size >= this.config.maxSize) {
      const firstKey = this.memoryCache.keys().next().value;
      if (firstKey) {
        this.memoryCache.delete(firstKey);
      }
    }

    this.memoryCache.set(key, entry);
  }

  /**
   * Clear cache for a specific function or all cache
   */
  async clear(functionName?: string): Promise<void> {
    // Clear Redis cache
    const redis = await this.getRedisClient();
    if (redis) {
      try {
        if (functionName) {
          const pattern = `wp:${functionName}:*`;
          const keys = await redis.keys(pattern);
          if (keys.length > 0) {
            await redis.del(keys);
            console.log(
              `Redis: Cleared ${keys.length} keys for ${functionName}`
            );
          }
        } else {
          // Clear all WordPress cache keys
          const keys = await redis.keys("wp:*");
          if (keys.length > 0) {
            await redis.del(keys);
            console.log(`Redis: Cleared all ${keys.length} cache keys`);
          }
        }
      } catch (error) {
        console.error("Redis CLEAR error:", error);
      }
    }

    // Clear memory cache
    if (functionName) {
      // Clear entries for specific function
      const keysToDelete: string[] = [];
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(`wp:${functionName}:`)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach((key) => this.memoryCache.delete(key));
    } else {
      // Clear all cache
      this.memoryCache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    let validEntries = 0;
    let expiredEntries = 0;

    for (const entry of this.memoryCache.values()) {
      if (this.isValid(entry)) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    let redisStats = null;
    const redis = await this.getRedisClient();
    if (redis) {
      try {
        const keys = await redis.keys("wp:*");
        redisStats = {
          totalKeys: keys.length,
          connected: true,
        };
      } catch {
        redisStats = {
          connected: false,
          error: "Failed to get Redis stats",
        };
      }
    }

    return {
      memory: {
        totalEntries: this.memoryCache.size,
        validEntries,
        expiredEntries,
        hitRate: validEntries / this.memoryCache.size || 0,
      },
      redis: redisStats,
    };
  }

  /**
   * Clean up expired entries from memory cache
   */
  cleanup(): void {
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isValid(entry)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.memoryCache.delete(key));
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    if (this.redisClient) {
      try {
        await this.redisClient.quit();
        console.log("Redis: Disconnected");
      } catch (error) {
        console.error("Redis: Error disconnecting:", error);
      }
      this.redisClient = null;
    }
  }
}

// Create a singleton instance
export const cache = new WordPressCache({
  defaultTTL: parseInt(process.env.CACHE_TTL || "300000"), // 5 minutes default
  maxSize: parseInt(process.env.CACHE_MAX_SIZE || "1000"),
  enableRedis: typeof window === "undefined" && !!process.env.REDIS_URL,
  redisUrl: process.env.REDIS_URL,
});

/**
 * Cache wrapper for WordPress API functions
 */
export function withCache<T extends unknown[], R>(
  functionName: string,
  fn: (...args: T) => Promise<R>,
  ttl?: number
) {
  return async (...args: T): Promise<R> => {
    // Generate cache key from function name and arguments
    const cacheKey = args.length > 0 ? args : {};

    // Try to get from cache first
    const cached = await cache.get<R>(functionName, cacheKey);
    if (cached !== null) {
      console.log(`Cache HIT for ${functionName}`);
      return cached;
    }

    console.log(`Cache MISS for ${functionName}`);

    // Execute the function and cache the result
    try {
      const result = await fn(...args);
      await cache.set(functionName, cacheKey, result, ttl);
      return result;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  };
}

/**
 * Cache invalidation helpers
 */
export const cacheInvalidation = {
  // Invalidate all post-related caches
  invalidatePosts: async () => {
    await cache.clear("getAllPosts");
    await cache.clear("getPostById");
    await cache.clear("getPostBySlug");
    await cache.clear("getPostsByCategory");
    await cache.clear("getPostsByCategorySlug");
    await cache.clear("getPostsByTag");
    await cache.clear("getPostsByTagSlug");
    await cache.clear("getPostsByAuthor");
    await cache.clear("getPostsByAuthorSlug");
  },

  // Invalidate category-related caches
  invalidateCategories: async () => {
    await cache.clear("getAllCategories");
    await cache.clear("getCategoryById");
    await cache.clear("getCategoryBySlug");
  },

  // Invalidate tag-related caches
  invalidateTags: async () => {
    await cache.clear("getAllTags");
    await cache.clear("getTagById");
    await cache.clear("getTagBySlug");
  },

  // Invalidate author-related caches
  invalidateAuthors: async () => {
    await cache.clear("getAllAuthors");
    await cache.clear("getAuthorById");
    await cache.clear("getAuthorBySlug");
  },

  // Invalidate media-related caches
  invalidateMedia: async () => {
    await cache.clear("getFeaturedMediaById");
  },

  // Invalidate all caches
  invalidateAll: async () => {
    await cache.clear();
  },
};

// Clean up expired entries every 5 minutes
if (typeof window === "undefined") {
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000);
}

export default cache;
