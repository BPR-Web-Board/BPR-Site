#!/usr/bin/env node

/**
 * Remove Old Photos Script
 *
 * Run this to remove all images from posts published before a certain date:
 * WP_USERNAME=your-wp-username WP_APP_PASSWORD="abcd efgh ijkl mnop qrst uvwx" node scripts/remove-old-photos.js --before 2020-01-01 --apply
 * 
 * Run this to test connection:
 * WP_USERNAME=your-wp-username WP_APP_PASSWORD="abcd efgh ijkl mnop qrst uvwx" node scripts/remove-old-photos.js --before 2020-01-01
 */

const WORDPRESS_URL = (
  process.env.WORDPRESS_URL || "https://brownpoliticalreview.org/"
).replace(/\/+$/, "");
const API = `${WORDPRESS_URL}/wp-json/wp/v2`;
const PER_PAGE = 100;

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { before: null, apply: false, deleteMedia: false };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--before") opts.before = args[++i];
    else if (args[i] === "--apply") opts.apply = true;
    else if (args[i] === "--delete-media") opts.deleteMedia = true;
  }

  if (!opts.before || isNaN(Date.parse(opts.before))) {
    console.error("Pass a valid cutoff date: --before YYYY-MM-DD");
    process.exit(1);
  }
  return opts;
}

function authHeader() {
  const user = process.env.WP_USERNAME;
  const pass = process.env.WP_APP_PASSWORD;
  if (!user || !pass) {
    console.error("WP_USERNAME and WP_APP_PASSWORD must be set.");
    process.exit(1);
  }
  return "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
}

async function wp(path, auth, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`${options.method || "GET"} ${path} → ${res.status} ${await res.text()}`);
  }
  return { data: await res.json(), headers: res.headers };
}

// Confirm the credentials work and the account can edit posts / delete media
async function checkConnection(opts, auth) {
  console.log(`Connecting to ${WORDPRESS_URL}...`);

  let user;
  try {
    ({ data: user } = await wp("/users/me?context=edit", auth));
  } catch (err) {
    if (/→ (401|403)/.test(err.message)) {
      console.error("Login failed: check WP_USERNAME and WP_APP_PASSWORD.");
    } else {
      console.error("Could not reach the WordPress API:", err.message);
    }
    process.exit(1);
  }

  const caps = user.capabilities || {};
  const required = ["edit_others_posts", "edit_published_posts"];
  if (opts.deleteMedia) required.push("delete_others_posts");
  const missing = required.filter((cap) => !caps[cap]);

  console.log(`Connected as ${user.name} (${(user.roles || []).join(", ") || "no role"})`);
  if (missing.length) {
    console.error(`This account is missing permissions: ${missing.join(", ")}`);
    console.error("   Use an Editor or Administrator account.");
    process.exit(1);
  }
  console.log("Account has permission to edit posts" + (opts.deleteMedia ? " and delete media\n" : "\n"));
}

// Fetch every post published before the cutoff, with raw (editable) content
async function getOldPosts(before, auth) {
  const posts = [];
  const beforeIso = new Date(before).toISOString();
  let page = 1;
  let totalPages = 1;

  do {
    const { data, headers } = await wp(
      `/posts?before=${encodeURIComponent(beforeIso)}&per_page=${PER_PAGE}&page=${page}&context=edit&status=any`,
      auth
    );
    posts.push(...data);
    totalPages = Number(headers.get("x-wp-totalpages")) || 1;
    page++;
  } while (page <= totalPages);

  return posts;
}

// Remove Gutenberg image/gallery blocks, figures with images, and stray <img> tags
function stripImages(html) {
  return html
    .replace(/<!-- wp:(image|gallery)[\s\S]*?<!-- \/wp:\1 -->\s*/g, "")
    .replace(/<figure[^>]*>(?:(?!<\/figure>)[\s\S])*?<img[\s\S]*?<\/figure>\s*/gi, "")
    .replace(/\[caption[^\]]*\][\s\S]*?\[\/caption\]\s*/gi, "")
    .replace(/<a[^>]*>\s*<img[^>]*>\s*<\/a>/gi, "")
    .replace(/<img[^>]*>/gi, "");
}

async function getAttachedImages(postId, auth) {
  const { data } = await wp(
    `/media?parent=${postId}&media_type=image&per_page=${PER_PAGE}`,
    auth
  );
  return data.map((m) => m.id);
}

async function main() {
  const opts = parseArgs();
  const auth = authHeader();

  await checkConnection(opts, auth);

  console.log(`Finding posts published before ${opts.before} on ${WORDPRESS_URL}...`);
  if (!opts.apply) console.log("Dry run: nothing will be changed. Pass --apply to update.\n");

  const posts = await getOldPosts(opts.before, auth);
  console.log(`Found ${posts.length} posts.\n`);

  let changed = 0;
  let mediaCount = 0;

  for (const post of posts) {
    const raw = post.content.raw || "";
    const newContent = stripImages(raw);
    const hasFeatured = post.featured_media > 0;
    const contentChanged = newContent !== raw;
    const mediaIds = opts.deleteMedia ? await getAttachedImages(post.id, auth) : [];
    if (hasFeatured && opts.deleteMedia && !mediaIds.includes(post.featured_media)) {
      mediaIds.push(post.featured_media);
    }

    if (!hasFeatured && !contentChanged && mediaIds.length === 0) continue;

    changed++;
    const title = post.title.raw || post.title.rendered;
    console.log(
      `• [${post.date.slice(0, 10)}] #${post.id} ${title}` +
        `${hasFeatured ? " | featured image" : ""}` +
        `${contentChanged ? " | inline images" : ""}` +
        `${mediaIds.length ? ` | delete media ${mediaIds.join(",")}` : ""}`
    );

    mediaCount += mediaIds.length;
    if (!opts.apply) continue;

    try {
      // Update the post first so it never points at deleted media
      if (hasFeatured || contentChanged) {
        await wp(`/posts/${post.id}`, auth, {
          method: "POST",
          body: JSON.stringify({ featured_media: 0, content: newContent }),
        });
      }
      for (const id of mediaIds) {
        await wp(`/media/${id}?force=true`, auth, { method: "DELETE" });
      }
    } catch (err) {
      console.error(`  Failed on post #${post.id}: ${err.message}`);
    }
  }

  console.log(
    `\n${opts.apply ? "Updated" : "Would update"} ${changed} posts` +
      (opts.deleteMedia ? `, ${opts.apply ? "deleted" : "would delete"} ${mediaCount} media files.` : ".")
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
