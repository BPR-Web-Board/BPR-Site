// Description: Caching layer for WordPress API calls
// Provides in-memory and persistent caching to reduce API calls

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheConfig {
  defaultTTL: number; // Default TTL in milliseconds
  maxSize: number; // Maximum number of entries in memory cache
  enablePersistentCache: boolean; // Whether to use persistent cache
}

class WordPressCache {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes default
      maxSize: 1000, // Maximum 1000 entries
      enablePersistentCache: typeof window === "undefined", // Only in server-side
      ...config,
    };
  }

  /**
   * Generate a cache key from function name and parameters
   */
  private generateKey(functionName: string, params: any = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as any);

    return `${functionName}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Check if a cache entry is still valid
   */
  private isValid(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Get data from cache
   */
  get<T>(functionName: string, params: any = {}): T | null {
    const key = this.generateKey(functionName, params);
    const entry = this.memoryCache.get(key);

    if (!entry || !this.isValid(entry)) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set data in cache
   */
  set<T>(functionName: string, params: any = {}, data: T, ttl?: number): void {
    const key = this.generateKey(functionName, params);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
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
  clear(functionName?: string): void {
    if (functionName) {
      // Clear entries for specific function
      const keysToDelete: string[] = [];
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(`${functionName}:`)) {
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
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const entry of this.memoryCache.values()) {
      if (this.isValid(entry)) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.memoryCache.size,
      validEntries,
      expiredEntries,
      hitRate: validEntries / this.memoryCache.size || 0,
    };
  }

  /**
   * Clean up expired entries
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
}

// Create a singleton instance
export const cache = new WordPressCache({
  defaultTTL: parseInt(process.env.CACHE_TTL || "300000"), // 5 minutes default
  maxSize: parseInt(process.env.CACHE_MAX_SIZE || "1000"),
});

/**
 * Cache wrapper for WordPress API functions
 */
export function withCache<T extends any[], R>(
  functionName: string,
  fn: (...args: T) => Promise<R>,
  ttl?: number
) {
  return async (...args: T): Promise<R> => {
    // Generate cache key from function name and arguments
    const cacheKey = args.length > 0 ? args : {};

    // Try to get from cache first
    const cached = cache.get<R>(functionName, cacheKey);
    if (cached !== null) {
      console.log(`Cache HIT for ${functionName}`);
      return cached;
    }

    console.log(`Cache MISS for ${functionName}`);

    // Execute the function and cache the result
    try {
      const result = await fn(...args);
      cache.set(functionName, cacheKey, result, ttl);
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
  invalidatePosts: () => {
    cache.clear("getAllPosts");
    cache.clear("getPostById");
    cache.clear("getPostBySlug");
    cache.clear("getPostsByCategory");
    cache.clear("getPostsByCategorySlug");
    cache.clear("getPostsByTag");
    cache.clear("getPostsByTagSlug");
    cache.clear("getPostsByAuthor");
    cache.clear("getPostsByAuthorSlug");
  },

  // Invalidate category-related caches
  invalidateCategories: () => {
    cache.clear("getAllCategories");
    cache.clear("getCategoryById");
    cache.clear("getCategoryBySlug");
  },

  // Invalidate tag-related caches
  invalidateTags: () => {
    cache.clear("getAllTags");
    cache.clear("getTagById");
    cache.clear("getTagBySlug");
  },

  // Invalidate author-related caches
  invalidateAuthors: () => {
    cache.clear("getAllAuthors");
    cache.clear("getAuthorById");
    cache.clear("getAuthorBySlug");
  },

  // Invalidate media-related caches
  invalidateMedia: () => {
    cache.clear("getFeaturedMediaById");
  },

  // Invalidate all caches
  invalidateAll: () => {
    cache.clear();
  },
};

// Clean up expired entries every 5 minutes
if (typeof window === "undefined") {
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000);
}

export default cache;
