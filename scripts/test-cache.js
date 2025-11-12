#!/usr/bin/env node

/**
 * Cache Test Script
 *
 * Run this to verify your Redis cache is working properly
 *
 * Usage: node scripts/test-cache.js
 */

const { createClient } = require("redis");

async function testCache() {
  console.log("🧪 Testing Redis Cache Connection...\n");

  // Check environment variables
  const redisUrl = process.env.REDIS_URL;
  const revalidationSecret = process.env.REVALIDATION_SECRET;

  console.log("📋 Environment Variables:");
  console.log("  REDIS_URL:", redisUrl ? "✅ Set" : "❌ Not set");
  console.log(
    "  REVALIDATION_SECRET:",
    revalidationSecret ? "✅ Set" : "❌ Not set"
  );
  console.log();

  if (!redisUrl) {
    console.log("⚠️  REDIS_URL not set. Cache will use memory-only mode.");
    console.log(
      "   For production, set REDIS_URL in your environment variables.\n"
    );
    return;
  }

  // Try to connect to Redis
  let client;
  try {
    console.log("🔌 Connecting to Redis...");
    client = createClient({ url: redisUrl });

    client.on("error", (err) => {
      console.error("❌ Redis Client Error:", err.message);
    });

    await client.connect();
    console.log("✅ Successfully connected to Redis!\n");

    // Test basic operations
    console.log("🧪 Testing cache operations...");

    // Set a test value
    const testKey = "wp:test:connection";
    const testValue = {
      message: "Cache is working!",
      timestamp: new Date().toISOString(),
    };

    await client.setEx(testKey, 60, JSON.stringify(testValue));
    console.log("  ✅ SET operation successful");

    // Get the test value
    const retrieved = await client.get(testKey);
    if (retrieved && JSON.parse(retrieved).message === testValue.message) {
      console.log("  ✅ GET operation successful");
    } else {
      console.log("  ❌ GET operation failed");
    }

    // Check existing cache keys
    const keys = await client.keys("wp:*");
    console.log(`  ℹ️  Found ${keys.length} cached items in Redis\n`);

    // Clean up test key
    await client.del(testKey);

    console.log("✨ All tests passed! Your Redis cache is ready.\n");

    // Display cache statistics
    const info = await client.info("memory");
    const usedMemory = info.match(/used_memory_human:([^\r\n]+)/);
    if (usedMemory) {
      console.log("📊 Redis Memory Usage:", usedMemory[1]);
    }

    await client.quit();
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("\n💡 Troubleshooting:");
    console.log(
      "  1. Check if Redis URL format is correct: redis://username:password@hostname:port"
    );
    console.log("  2. Verify Redis server is running and accessible");
    console.log("  3. Check firewall/network settings");
    console.log(
      "  4. For Upstash, make sure you copied the connection URL correctly\n"
    );

    if (client) {
      try {
        await client.quit();
      } catch (e) {
        // Ignore
      }
    }
  }
}

testCache().catch(console.error);
