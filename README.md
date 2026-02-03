# KenneDyne Spot - Forex Education & Trading Platform

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

This project can be deployed to any hosting platform that supports Node.js and npm:

- **Netlify**: Connect your GitHub repository and deploy with automatic builds
- **Vercel**: Similar to Netlify, optimized for React/Vite projects
- **Traditional hosting**: Build the project locally and upload to your host

Basic deployment steps:
```sh
npm run build
# Upload the dist/ folder to your hosting provider
```

## Custom Domain Setup

To connect a custom domain:
1. Set up DNS records with your domain registrar pointing to your hosting provider
2. Configure your hosting provider to use the custom domain
3. Update the canonical URL and site metadata in `index.html`

## Performance Optimizations

This project includes several performance optimizations to prevent freezing and ensure smooth operation:

### Freeze Prevention Features
- **Memory leak prevention**: Proper cleanup of event listeners in carousels and components
- **Resource-aware animations**: Reduced blur effects on mobile and low-end devices
- **Content visibility optimization**: Sections use `content-visibility: auto` for better rendering performance
- **Tab visibility handling**: Auto-play features pause when the tab is hidden

### Development Tools
- **Performance Monitor**: Press `Ctrl+Shift+P` to toggle a real-time performance monitor (development only)
- **Freeze Watchdog**: Automatically detects main thread freezes and logs warnings (development only)

### Best Practices Implemented
- Glass morphism effects optimized for mobile performance
- Image loading with error handling and fallbacks
- Intersection Observer for performance-aware features
- Proper cleanup of timers and event listeners

## Database and Storage Provider Abstraction

This project uses abstraction layers to remain provider-agnostic:

### Database Repository (`src/services/resourcesRepository.ts`)
- Abstracts database operations for courses, ebooks, and materials
- Currently implemented with Supabase, easily extensible to other providers
- Centralized interface for all CRUD operations

### Storage Service (`src/services/storageService.ts`)
- Abstracts file storage operations (upload, delete, public URLs)
- Automatically detects available storage provider
- Falls back to NoopStorageProvider when no storage is configured
- Supports direct URL input for any storage provider

### Migration Support
- "Migrate Local Data" feature works with any configured database provider
- Safely transfers static content to the database
- Optional feature that can be removed if not needed

### Switching Providers
To change database or storage providers:
1. Implement the respective interface in the service files
2. Update the factory functions to return your provider
3. No changes needed in UI components or hooks

## Troubleshooting

### Blog Posts Not Loading ("Posts Not Found")

If blog posts show "Post Not Found" errors:

1. **Check Database Console** - Run these queries in your database console:
   ```sql
   -- Check if post exists and is published
   SELECT slug, title, published, published_at, status 
   FROM blog_posts 
   WHERE slug = 'your-post-slug';
   
   -- Check for duplicate slugs
   SELECT slug, COUNT(*) 
   FROM blog_posts 
   GROUP BY slug 
   HAVING COUNT(*) > 1;
   
   -- Check for scheduled posts
   SELECT slug, title, published_at, NOW() as current_time
   FROM blog_posts 
   WHERE published_at > NOW();
   ```

2. **Common Issues**:
   - Post not published (`published = false`)
   - Scheduled for future (`published_at > now()`)
   - Slug mismatch (check URL vs database slug)
   - RLS policy blocking access
   - Missing relationships (authors, categories)

3. **Check Browser Console** - Look for detailed error logs when accessing posts
