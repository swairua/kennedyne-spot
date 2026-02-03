import { Plugin } from 'vite';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SITE_URL = process.env.VITE_SITE_URL || 'https://kennedynespot.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og/og-default.jpg`;

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  featured_image_url: string | null;
  published_at: string | null;
}

function toAbsoluteUrl(input: string | null | undefined): string {
  if (!input) return DEFAULT_OG_IMAGE;
  if (/^https?:\/\//i.test(input)) return input;
  return `${SITE_URL}${input.startsWith('/') ? input : `/${input}`}`;
}

export function blogOgPlugin(): Plugin {
  return {
    name: 'blog-og-plugin',
    apply: 'build',
    closeBundle: async () => {
      console.log('[blogOgPlugin] Starting build-time OG tag generation...');
      
      const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dbtyzloscmhaskjlbyvl.supabase.co';
      const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRidHl6bG9zY21oYXNramxieXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNTM3NzAsImV4cCI6MjA3MjkyOTc3MH0.klxb83dKGK6FkdpqkNOBmyIUKKxPilNtl4VqxToe_QU';
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Fetch all published blog posts
      const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('slug, title, excerpt, meta_title, meta_description, og_title, og_description, og_image_url, featured_image_url, published_at')
        .eq('published', true)
        .eq('status', 'published');
      
      if (error) {
        console.error('[blogOgPlugin] Error fetching posts:', error);
        return;
      }
      
      if (!posts || posts.length === 0) {
        console.log('[blogOgPlugin] No published posts found');
        return;
      }
      
      console.log(`[blogOgPlugin] Found ${posts.length} published posts`);
      
      // Read the main index.html template from dist
      const distPath = path.resolve(process.cwd(), 'dist');
      const templatePath = path.join(distPath, 'index.html');
      
      if (!fs.existsSync(templatePath)) {
        console.error('[blogOgPlugin] dist/index.html not found');
        return;
      }
      
      const template = fs.readFileSync(templatePath, 'utf-8');
      
      // Generate static HTML for each blog post
      for (const post of posts as BlogPost[]) {
        const ogTitle = post.og_title || post.meta_title || post.title;
        const ogDescription = post.og_description || post.meta_description || post.excerpt || '';
        const ogImage = toAbsoluteUrl(post.og_image_url || post.featured_image_url);
        const ogUrl = `${SITE_URL}/blog/${post.slug}`;
        const publishedTime = post.published_at || new Date().toISOString();
        
        // Replace OG meta tags in the template
        let html = template
          // Title tag
          .replace(/<title[^>]*>.*?<\/title>/i, `<title>${escapeHtml(ogTitle)} | KenneDyne spot</title>`)
          // Meta description
          .replace(/<meta name="description"[^>]*>/i, `<meta name="description" content="${escapeHtml(ogDescription)}" />`)
          // OG tags
          .replace(/<meta property="og:title"[^>]*>/i, `<meta property="og:title" content="${escapeHtml(ogTitle)}" />`)
          .replace(/<meta property="og:description"[^>]*>/i, `<meta property="og:description" content="${escapeHtml(ogDescription)}" />`)
          .replace(/<meta property="og:image"[^>]*>/i, `<meta property="og:image" content="${ogImage}" />`)
          .replace(/<meta property="og:url"[^>]*>/i, `<meta property="og:url" content="${ogUrl}" />`)
          .replace(/<meta property="og:type"[^>]*>/i, `<meta property="og:type" content="article" />`)
          // Twitter tags
          .replace(/<meta name="twitter:image"[^>]*>/i, `<meta name="twitter:image" content="${ogImage}" />`)
          // Canonical URL
          .replace(/<link rel="canonical"[^>]*>/i, `<link rel="canonical" href="${ogUrl}" />`);
        
        // Add article-specific tags if not present
        if (!html.includes('og:type')) {
          html = html.replace('</head>', `  <meta property="og:type" content="article" />\n</head>`);
        }
        if (!html.includes('article:published_time')) {
          html = html.replace('</head>', `  <meta property="article:published_time" content="${publishedTime}" />\n</head>`);
        }
        if (!html.includes('twitter:title')) {
          html = html.replace('</head>', `  <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />\n</head>`);
        }
        if (!html.includes('twitter:description')) {
          html = html.replace('</head>', `  <meta name="twitter:description" content="${escapeHtml(ogDescription)}" />\n</head>`);
        }
        
        // Create directory and write file
        const blogDir = path.join(distPath, 'blog', post.slug);
        fs.mkdirSync(blogDir, { recursive: true });
        fs.writeFileSync(path.join(blogDir, 'index.html'), html);
        
        console.log(`[blogOgPlugin] Generated: /blog/${post.slug}/index.html`);
      }
      
      console.log('[blogOgPlugin] Build-time OG tag generation complete!');
    }
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default blogOgPlugin;
