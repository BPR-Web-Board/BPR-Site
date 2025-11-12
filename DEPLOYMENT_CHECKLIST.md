# 🚀 Quick Deployment Checklist

## What I Need to Provide to You

### 1. Redis Connection URL (Required)

Choose **ONE** of these options:

#### Option A: Vercel KV (Easiest - if deploying to Vercel)

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Create Database** → **KV (Redis)**
3. Vercel automatically sets `KV_URL` for you
4. ✅ No additional configuration needed!

#### Option B: Upstash (Works with any hosting)

1. Sign up at [upstash.com](https://upstash.com/) (FREE tier available)
2. Create a new Redis database
3. Copy the **Redis URL** (looks like: `redis://default:password@hostname.upstash.io:6379`)
4. 📋 **I need to set**: `REDIS_URL=<your-redis-url>`

#### Option C: Skip Redis for now

- App will work with in-memory cache only
- ⚠️ Not recommended for production (cache resets on each deployment)

### 2. Revalidation Secret (Required for auto cache clearing)

Generate a secure token:

```bash
openssl rand -base64 32
```

Example output: `xK9mP2vN8qR3tL7wE5yU1aF6bH4cG0dS9jI8kM3nV=`

📋 **I need to set**: `REVALIDATION_SECRET=<your-generated-token>`

---

## Environment Variables Summary

Add these to your hosting platform (Vercel, Railway, etc.):

```env
# Existing (already have)
WORDPRESS_URL=https://brownpoliticalreview.org/

# New - Redis Cache (REQUIRED)
REDIS_URL=redis://default:password@hostname:port
# OR if using Vercel KV, this is set automatically as KV_URL

# New - Webhook Security (REQUIRED)
REVALIDATION_SECRET=your-secure-random-token-here

# Optional - Cache tuning (use defaults if unsure)
CACHE_TTL=300000
CACHE_MAX_SIZE=1000
```

---

## After Deployment

### Test Cache is Working

1. **Visit your homepage** and check browser network tab
2. **Refresh the page** - should be much faster (using cache)
3. **Check deployment logs** for:
   ```
   ✅ Redis: Connected successfully
   ✅ Redis Cache SET for getAllPosts
   ✅ Redis Cache HIT for getAllPosts
   ```

### Set Up WordPress Auto-Cache-Clearing (Optional but Recommended)

When WordPress content updates, automatically clear cache:

**Webhook URL**:

```
https://your-domain.com/api/revalidate?secret=YOUR_REVALIDATION_SECRET&type=posts
```

**Method**: POST

Add this to WordPress:

- Use a plugin like [WP Webhooks](https://wordpress.org/plugins/wp-webhooks/)
- Or add code to `functions.php` (see REDIS_SETUP.md for code)

### Manual Cache Clear (anytime)

```bash
curl -X POST "https://your-domain.com/api/revalidate?secret=YOUR_SECRET&type=all"
```

---

## Expected Performance

| Before                         | After                           |
| ------------------------------ | ------------------------------- |
| Page loads: 2-5 seconds        | Page loads: 200-500ms           |
| WordPress calls: Every request | WordPress calls: Once per 5 min |
| Can handle: 50 users           | Can handle: 1000+ users         |

---

## Questions Checklist

- [ ] Which Redis provider are you using? (Vercel KV / Upstash / Other / None)
- [ ] Do you have the Redis URL?
- [ ] Have you generated a revalidation secret?
- [ ] Where are you deploying? (Vercel / Railway / Other)

---

## Need Help?

See the full guide: [REDIS_SETUP.md](./REDIS_SETUP.md)

For issues, check the **Troubleshooting** section in REDIS_SETUP.md
