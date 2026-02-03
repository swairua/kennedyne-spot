# Blog OpenGraph Metadata Fix

## Problem
When sharing blog posts on WhatsApp (or other social platforms), the default website OG tags were being used instead of the blog-specific OG tags configured in the admin panel.

## Root Cause
Your blog uses client-side rendering (React SPA). When social media crawlers (like WhatsApp's) fetch a blog URL, they don't execute JavaScript - they only read the static HTML. Since the page is rendered client-side, the initial HTML contains default website OG tags, not blog-specific ones.

## Solution Implemented

### 1. **Enabled Blog OG Plugin** (✅ Done)
Updated `vite.config.ts` to enable the `blogOgPlugin()` during production builds:
```typescript
import { blogOgPlugin } from "./vite-plugins/blogOgPlugin";

plugins: [
  react(),
  mode === 'development' && componentTagger(),
  mode === 'production' && blogOgPlugin(),  // ← Now enabled
].filter(Boolean),
```

**What this does:**
- During `npm run build`, the plugin fetches all published blog posts from your Supabase database
- Extracts the admin-configured OG tags: `og_title`, `og_description`, `og_image_url`
- Creates static HTML files at `dist/blog/{slug}/index.html` with the correct OG tags injected
- Falls back to `featured_image_url` or `og_image_url` for the social image

### 2. **Updated Netlify Configuration** (✅ Done)
Modified `netlify.toml` to ensure static blog files are served before the SPA catch-all redirect.

## How to Use

### For Admin Users
When creating or editing a blog post in the admin panel:

1. Go to **SEO Tab** → **Social Sharing** section
2. Fill in:
   - **Open Graph Title**: The title shown when shared (defaults to post title)
   - **Open Graph Description**: The description shown when shared (defaults to excerpt)
   - **Open Graph Image URL**: The image shown in the preview (defaults to featured image)
3. Save/Publish the post

The blog editor already includes a **Social Preview** section showing how your post will appear on different platforms (Facebook, Twitter, LinkedIn, WhatsApp).

### For Development/Testing
In development (`npm run dev`), blog posts won't show custom OG tags since the plugin only runs during production builds. To test:
```bash
npm run build
npm run preview
```

## What Happens During Production Build

When you deploy (or build for production):

1. **Build Process:**
   ```bash
   npm run build
   ```

2. **blogOgPlugin executes:**
   - Connects to your Supabase database
   - Fetches all published blog posts
   - For each post, generates a static HTML file:
     - `dist/blog/building-your-trading-journal-track-progress-not-just-profits/index.html`
     - With OG tags injected like:
     ```html
     <meta property="og:title" content="Building Your Trading Journal: Track Progress Not Just Profits" />
     <meta property="og:description" content="Why keeping a detailed trading journal is crucial..." />
     <meta property="og:image" content="https://kennedynespot.com/images/trading-journal.jpg" />
     ```

3. **Deployment:**
   - Static files are uploaded to Netlify
   - When WhatsApp/social crawlers fetch `/blog/building-your-trading-journal-...`, they get the static HTML with correct OG tags
   - Regular visitors still get the React app experience

## Verification Checklist

- [ ] Blog posts have `og_title`, `og_description`, and `og_image_url` filled in admin
- [ ] Build command runs successfully: `npm run build`
- [ ] No errors in build log related to blogOgPlugin
- [ ] Deploy to production (Netlify)
- [ ] Test sharing: Copy blog URL → Paste in WhatsApp chat → See preview update
- [ ] Use [Meta Link Debugger](https://www.facebook.com/tools/debug/sharing/) or [Open Graph Checker](https://www.opengraph.xyz/) to verify OG tags

## Environment Variables (Optional)

The plugin uses these optional environment variables on Netlify:

- `VITE_SITE_URL`: Your site URL (defaults to `https://kennedynespot.com`)
- `VITE_SUPABASE_URL`: Your Supabase URL (has fallback)
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key (has fallback)

If not set, the plugin uses hardcoded fallbacks for your Supabase credentials.

## Fallback Behavior

If `og_image_url` is not set:
1. Uses `featured_image_url` if available
2. Falls back to default image: `/og/og-default.jpg`

If `og_title` is not set:
1. Uses `meta_title` if available
2. Falls back to post `title`

If `og_description` is not set:
1. Uses `meta_description` if available
2. Falls back to post `excerpt`

## Testing Social Share Preview

Use these tools to verify OG tags:
- [Facebook Sharing Debugger](https://www.facebook.com/tools/debug/sharing/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Open Graph Checker](https://www.opengraph.xyz/)

Simply paste your blog URL and it will show the OG tags being served.

## Troubleshooting

**Q: Build fails with blogOgPlugin error**
- Check that blog posts exist in your Supabase database
- Verify `published=true` and `status='published'` for target posts
- Check Netlify build logs for database connection errors

**Q: Static files created but OG tags still wrong on social platforms**
- Social platforms cache OG tags for 24+ hours
- Use the debugger tools above to bypass cache and re-scrape
- May need to clear platform cache or wait 24 hours

**Q: Plugin doesn't generate files during production build**
- Verify `npm run build` completes successfully
- Check `dist/blog/` folder exists and contains `index.html` files
- Confirm `vite.config.ts` has the plugin enabled

**Q: Only default OG image appears, not custom one**
- Verify `og_image_url` or `featured_image_url` is set in admin
- Image URL must be publicly accessible
- Ensure image URL is complete (includes https://)
