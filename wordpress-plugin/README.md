# WordPress Cache Revalidation Plugin

This WordPress plugin automatically clears your Next.js cache when WordPress content is updated.

## 📦 Installation

### Option 1: As a Plugin (Recommended)

1. **Upload the plugin:**

   - Copy `bpr-cache-revalidation.php` to your WordPress installation:

   ```
   wp-content/plugins/bpr-cache-revalidation/bpr-cache-revalidation.php
   ```

2. **Configure the plugin:**
   Edit the file and update these two lines:

   ```php
   define('BPR_WEBHOOK_URL', 'https://your-actual-domain.com/api/revalidate');
   define('BPR_WEBHOOK_SECRET', 'your-actual-secret-token');
   ```

3. **Activate:**
   - Go to WordPress Admin → Plugins
   - Find "BPR Cache Revalidation"
   - Click "Activate"

### Option 2: Add to functions.php

1. **Copy the code:**

   - Open `bpr-cache-revalidation.php`
   - Copy everything after the plugin header comments

2. **Paste into your theme:**
   - Go to: Appearance → Theme File Editor
   - Select: functions.php
   - Paste at the bottom
   - Update the WEBHOOK_URL and WEBHOOK_SECRET values
   - Save

## ⚙️ Configuration

You need two values from your Next.js deployment:

### 1. Webhook URL

Your Next.js deployment URL + `/api/revalidate`

Examples:

- Production: `https://bpr-site.vercel.app/api/revalidate`
- Custom domain: `https://brownpoliticalreview.org/api/revalidate`

### 2. Secret Token

The same value you set as `REVALIDATION_SECRET` in your Next.js environment variables.

Generate a new one:

```bash
openssl rand -base64 32
```

## 🎯 What It Does

The plugin automatically triggers cache revalidation when:

- ✅ **Posts** are created, updated, or deleted
- ✅ **Categories** are created, updated, or deleted
- ✅ **Tags** are created, updated, or deleted
- ✅ **Media** is uploaded, updated, or deleted

## 🔧 Manual Cache Clearing

After activating the plugin:

1. Go to: **Settings → BPR Cache**
2. Select cache type to clear
3. Click "Clear Cache"

Or use WP-CLI:

```bash
wp eval 'bpr_revalidate_cache("all");'
```

## 📊 Monitoring

The plugin logs all cache revalidation attempts to your WordPress error log.

To enable error logging, add to `wp-config.php`:

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

Check logs at: `wp-content/debug.log`

## 🧪 Testing

### Test if webhook is configured:

```bash
curl "https://your-domain.com/api/revalidate?secret=YOUR_SECRET"
```

Expected response:

```json
{
  "configured": true,
  "authenticated": true,
  "message": "Revalidation endpoint is ready"
}
```

### Test manual trigger:

```bash
curl -X POST "https://your-domain.com/api/revalidate?secret=YOUR_SECRET&type=all"
```

Expected response:

```json
{
  "success": true,
  "revalidated": true,
  "type": "all",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## 🐛 Troubleshooting

### Plugin shows warning

**Problem:** Webhook URL or secret not configured  
**Fix:** Edit plugin file and update `BPR_WEBHOOK_URL` and `BPR_WEBHOOK_SECRET`

### Cache not clearing

**Check:**

1. Plugin is activated
2. Webhook URL is correct (check for typos)
3. Secret token matches between WordPress and Next.js
4. Next.js app is deployed and accessible
5. Check WordPress error log for messages

### "Connection timeout" in logs

**Problem:** WordPress can't reach your Next.js app  
**Fix:**

- Verify URL is accessible from WordPress server
- Check firewall settings
- Increase timeout in plugin (change `'timeout' => 5` to higher value)

### 403/401 errors

**Problem:** Secret token mismatch  
**Fix:** Verify `BPR_WEBHOOK_SECRET` matches `REVALIDATION_SECRET` in Next.js

## 🔐 Security

- ✅ Uses secret token authentication
- ✅ Non-blocking requests (doesn't slow down WordPress)
- ✅ Validates post status before triggering
- ✅ Skips autosaves and revisions

## 📝 Customization

### Change cache type for posts:

```php
// In bpr_revalidate_on_post_update function:
bpr_revalidate_cache('all'); // Clear everything
// or
bpr_revalidate_cache('posts'); // Just posts (default)
```

### Add custom post types:

```php
function bpr_revalidate_on_custom_post($post_id, $post) {
    if ($post->post_type === 'your_custom_type') {
        bpr_revalidate_cache('posts');
    }
}
add_action('save_post_your_custom_type', 'bpr_revalidate_on_custom_post', 10, 2);
```

### Disable for specific post types:

```php
function bpr_revalidate_on_post_update($post_id, $post, $update) {
    // Skip pages
    if ($post->post_type === 'page') {
        return;
    }
    // ... rest of function
}
```

## 🚀 Performance

- Non-blocking requests (doesn't slow WordPress)
- Fires only on actual content changes
- Skips unnecessary triggers (autosaves, revisions)
- 5-second timeout prevents hanging

## 📚 More Info

- See: `../REDIS_SETUP.md` for full Next.js setup
- See: `../DEPLOYMENT_CHECKLIST.md` for environment setup

## 🆘 Support

For issues:

1. Check WordPress debug.log
2. Test webhook URL directly with curl
3. Verify environment variables match
4. Review REDIS_SETUP.md troubleshooting section
