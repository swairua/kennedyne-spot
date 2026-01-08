import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://dbtyzloscmhaskjlbyvl.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRidHl6bG9zY21oYXNramxieXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNTM3NzAsImV4cCI6MjA3MjkyOTc3MH0.klxb83dKGK6FkdpqkNOBmyIUKKxPilNtl4VqxToe_QU';
const SITE_URL = process.env.VITE_SITE_URL || 'https://kennedynespot.com';

const publicDir = path.join(process.cwd(), 'public');
const sitemapPath = path.join(publicDir, 'sitemap-blog.xml');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function generateBlogSitemap() {
  try {
    console.log('🚀 Starting blog sitemap generation...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Fetch all published blog posts
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, slug, published_at, updated_at, status, published')
      .eq('published', true)
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching blog posts:', error);
      // Create empty sitemap if query fails
      createEmptySitemap();
      return;
    }
    
    if (!posts || posts.length === 0) {
      console.warn('⚠️  No published blog posts found. Creating empty sitemap.');
      createEmptySitemap();
      return;
    }
    
    console.log(`✓ Found ${posts.length} published blog posts`);
    
    // Generate sitemap XML
    const urls = posts.map(post => {
      const lastmod = new Date(post.updated_at || post.published_at).toISOString().split('T')[0];
      return `  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>never</changefreq>
    <priority>0.8</priority>
  </url>`;
    }).join('\n');
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
    
    // Write sitemap file
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
    console.log(`✅ Blog sitemap generated successfully: ${sitemapPath}`);
    console.log(`📝 Included ${posts.length} blog posts in sitemap`);
  } catch (error) {
    console.error('❌ Unexpected error during blog sitemap generation:', error);
    createEmptySitemap();
  }
}

function createEmptySitemap() {
  const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- This sitemap is dynamically generated from blog posts in the database -->
  <!-- Blog posts will appear here once they are published -->
</urlset>`;
  
  fs.writeFileSync(sitemapPath, emptySitemap, 'utf8');
  console.log('⚠️  Empty sitemap created. Blog posts will be added once published.');
}

// Run the generation
generateBlogSitemap();
