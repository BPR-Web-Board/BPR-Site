<p align="center">
  <img src="public/logo/logo.svg" alt="Brown Political Review" width="280" />
</p>

# BPR Site

The public website for [Brown Political Review](https://brownpoliticalreview.org).

Editors write and publish in WordPress. This project is the Next.js site that readers see. It loads articles from the WordPress API.

| | |
| --- | --- |
| Public site | `brownpoliticalreview.org` (Vercel) |
| WordPress / admin | `cms.brownpoliticalreview.org` (DigitalOcean) |

Links like `/wp-admin` on the public site send you to the CMS.

## Get started

```bash
npm install
cp .env.example .env.local
npm run dev
```

In `.env.local` (and on Vercel), set:

```bash
WORDPRESS_URL=https://cms.brownpoliticalreview.org/
```

## WordPress admin

- Login: https://cms.brownpoliticalreview.org/wp-login.php  
- Dashboard: https://cms.brownpoliticalreview.org/wp-admin/

To change files on the server, SSH in first (host and user can live in `.env.local` for your own notes — keep passwords out of git and off Vercel). WordPress lives at `/var/www/html` on the CMS droplet.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Run the site locally |
| `npm run build` | Build for production |
| `npm test` | Run tests |
| `npm run lint` | Check code style |

## More docs

- [WordPress API notes](guides/wordpressAPI.md)  
- [Style guide](guides/styles.md)  
