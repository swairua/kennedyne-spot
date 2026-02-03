# GA4 Data Collection & SEO Canonical URL - Testing Guide

This guide walks you through testing the GA4 initialization and SEO canonical URL fixes implemented in this project.

---

## Phase 1: GA4 Data Collection Testing

### Test 1: Check GA4 is Loading Correctly

**Steps:**
1. Open the website in a **private/incognito window** (to ensure clean state without cookies)
2. Open **Developer Tools** (F12 or right-click → Inspect)
3. Go to the **Console** tab
4. You should see debug logs starting with `[GA4]`:
   ```
   [GA4] Consent mode initialized { gaId: 'G-L86MZHQMN2', ... }
   [GA4] Configuration applied { gaId: 'G-L86MZHQMN2' }
   [GA4] GA script injected into head { gaId: 'G-L86MZHQMN2' }
   [GA4] GA script loaded successfully { gaId: 'G-L86MZHQMN2' }
   ```

**Expected Result:**
- ✅ All GA4 initialization logs appear without errors
- ✅ No red error messages in the console related to GA script loading

---

### Test 2: Verify GA Script is Loaded (Network Tab)

**Steps:**
1. Keep Developer Tools open
2. Go to the **Network** tab
3. Reload the page
4. Filter for "gtag" or "google"
5. Look for a request to: `https://www.googletagmanager.com/gtag/js?id=G-L86MZHQMN2`

**Expected Result:**
- ✅ Request shows **Status 200** (successful load)
- ✅ Size is roughly **15-20 KB** (or larger with content)

---

### Test 3: Check dataLayer is Initialized

**Steps:**
1. In the **Console** tab, paste this command:
   ```javascript
   window.dataLayer
   ```
2. Press Enter

**Expected Result:**
- ✅ You should see an array with objects like:
   ```javascript
   [
     Array(2),  // [["consent", "default", {...}]]
     Array(2),  // [["js", Date]]
     Array(2),  // [["config", "G-L86MZHQMN2", {...}]]
     ...
   ]
   ```

---

### Test 4: Check gtag Function is Available

**Steps:**
1. In the **Console**, paste:
   ```javascript
   typeof window.gtag
   ```
2. Press Enter

**Expected Result:**
- ✅ Should show: `"function"`

---

### Test 5: Test Cookie Banner Interaction

**Steps:**
1. With Developer Tools **Console** open, look for logs starting with `[Consent]`
2. The cookie banner should appear at the bottom of the page
3. Click **"Customize"** to expand settings
4. Toggle the **"Analytics Cookies"** switch on
5. Click **"Save Preferences"**
6. Watch the console for logs:

**Expected Console Logs:**
```
[Consent] Saving settings { analytics: true, ... }
[GA Consent] Updating consent mode v2 { analytics_storage: "granted", ... }
[GA Consent] Consent updated via gtag function
```

**Expected Result:**
- ✅ Logs appear showing consent was updated
- ✅ Cookie banner closes after saving
- ✅ No error messages

---

### Test 6: Monitor Page View Tracking

**Steps:**
1. With Developer Tools **Console** open
2. Keep the page loaded for ~5 seconds after consent is granted
3. Look for logs like:
   ```
   [GA4] page_view event sent { 
     page_title: "KenneDyne spot | ...", 
     page_location: "https://kennedynespot.com/", 
     page_path: "/" 
   }
   ```

4. **Navigate to a different page** (e.g., click on "About" in the menu)
5. You should see another page_view log with the new path

**Expected Result:**
- ✅ Page view logs appear in console when navigating
- ✅ Page path changes correctly on each navigation
- ✅ No error messages

---

### Test 7: Check Google Analytics Real-Time (Optional but Important)

⚠️ **This requires access to your Google Analytics account**

**Steps:**
1. Go to [Google Analytics 4 Dashboard](https://analytics.google.com)
2. Select your "KenneDyne spot" property
3. Go to **Reports** → **Real-time**
4. **Don't close the Real-Time page**
5. Go back to your website and **ensure cookie consent is granted**
6. **Refresh the website page** or **navigate to different pages**
7. Watch the Real-Time dashboard - within 1-2 minutes you should see:
   - New sessions appearing
   - Page paths showing up
   - User activity logs

**Expected Result:**
- ✅ Real-time dashboard shows activity from your website
- ✅ Page paths appear in the "Top pages" section
- ✅ Sessions are active and visible

---

### Test 8: Use Google Tag Assistant (Browser Extension)

**Setup:**
1. Install [Google Tag Assistant](https://chrome.google.com/webstore/detail/tag-assistant/oleeedimhjhmjgbjornhfhjgercnmpnl) extension (for Chrome)
2. Go back to your website
3. Click the **Tag Assistant** icon in your browser toolbar
4. A panel should open showing:
   - ✅ GA4 (Google Analytics 4) - Status should be **"OK"** (green)
   - ✅ Installation status details

**Expected Result:**
- ✅ GA4 shows as properly installed and configured
- ✅ No warnings or errors about missing GA setup

---

## Phase 2: SEO Canonical URL Testing

### Test 9: Check Canonical URLs in Page Source

**Steps:**
1. Go to your website homepage: https://kennedynespot.com/
2. Right-click → **View Page Source** (or Ctrl+U)
3. Press Ctrl+F to search for `canonical`
4. You should see:
   ```html
   <link rel="canonical" href="https://kennedynespot.com/" />
   ```

**Expected Result:**
- ✅ Canonical URL shows `https://kennedynespot.com/` (with trailing slash for root)

---

### Test 10: Check Canonical on Other Pages

**Steps:**
1. Navigate to: https://kennedynespot.com/about
2. Right-click → **View Page Source**
3. Search for `canonical`
4. You should see:
   ```html
   <link rel="canonical" href="https://kennedynespot.com/about" />
   ```

**Expected Result:**
- ✅ Canonical URL shows `https://kennedynespot.com/about` (NO trailing slash)
- ✅ Canonical is self-referential (points to the current page)

---

### Test 11: Check Trailing Slash Consistency

**Steps:**
Test several pages and verify trailing slash pattern:

| Page | Expected Canonical | Trailing Slash? |
|------|-------------------|-----------------|
| Home | `https://kennedynespot.com/` | ✅ Yes |
| About | `https://kennedynespot.com/about` | ❌ No |
| Services | `https://kennedynespot.com/services` | ❌ No |
| Blog | `https://kennedynespot.com/blog` | ❌ No |
| Contact | `https://kennedynespot.com/contact` | ❌ No |

**Expected Result:**
- ✅ All canonical URLs follow the same pattern
- ✅ Root (/) has trailing slash
- ✅ All other paths do NOT have trailing slashes

---

### Test 12: Check OG and Twitter Meta Tags Match Canonical

**Steps:**
1. Go to any page (e.g., /about)
2. View Page Source
3. Search for `og:url`:
   ```html
   <meta property="og:url" content="https://kennedynespot.com/about" />
   ```

4. Search for `twitter:url`:
   ```html
   <meta name="twitter:url" content="https://kennedynespot.com/about" />
   ```

**Expected Result:**
- ✅ `og:url` matches canonical URL
- ✅ `twitter:url` matches canonical URL
- ✅ All three (canonical, og:url, twitter:url) are identical

---

### Test 13: Submit URLs to Google Search Console (Optional but Recommended)

⚠️ **This requires access to your Google Search Console account**

**Steps:**
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property (kennedynespot.com)
3. Use the **URL Inspection Tool** (top search bar)
4. Test key pages:
   - `https://kennedynespot.com/` (home)
   - `https://kennedynespot.com/about`
   - `https://kennedynespot.com/blog`

5. For each URL:
   - Click the URL bar
   - Paste the URL
   - Press Enter
   - Look for **Canonical URL** section

**Expected Result:**
- ✅ Canonical URL matches the URL you tested
- ✅ No "Duplicate without user-selected canonical" warnings
- ✅ Status shows "URL is on Google" or similar (if already indexed)
- ✅ No critical errors

---

### Test 14: Check robots.txt and Sitemaps

**Steps:**
1. Visit: `https://kennedynespot.com/robots.txt`
2. Verify it contains sitemap references:
   ```
   Sitemap: https://kennedynespot.com/sitemap-index.xml
   Sitemap: https://kennedynespot.com/sitemap.xml
   Sitemap: https://kennedynespot.com/sitemap-blog.xml
   ```

**Expected Result:**
- ✅ robots.txt loads successfully
- ✅ All sitemap references are present
- ✅ Query parameter blocking rules are in place

---

## Debugging Checklist

If tests fail, use this checklist:

### GA4 Not Loading?
- [ ] Verify `VITE_GA_MEASUREMENT_ID` is set to `G-L86MZHQMN2` in environment
- [ ] Check console for `[GA4]` debug logs - look for errors
- [ ] Verify the GA script URL is correct: `https://www.googletagmanager.com/gtag/js?id=G-L86MZHQMN2`
- [ ] Check if browser extensions (ad blockers) are blocking GA - test in incognito mode
- [ ] Check if firewall/network is blocking googletagmanager.com

### Page Views Not Tracking?
- [ ] Verify consent was granted (check "Analytics Cookies" toggle in banner)
- [ ] Check localStorage for `consent_state`: 
  ```javascript
  localStorage.getItem('consent_state')
  // Should show: {"analytics":true,"marketing":...}
  ```
- [ ] Check if `analytics_storage` in consent is set to `"granted"`:
  ```javascript
  window.dataLayer.filter(e => e.event === 'consent_changed')
  ```

### Canonical URLs Wrong?
- [ ] Verify `src/utils/seoHelpers.ts` has `normalizeTrailingSlash` function
- [ ] Check that `createCanonicalUrl` is being used in all page components
- [ ] Verify page component is passing `canonical` prop to `<SEOHead>`
- [ ] Check browser console for SEO logs: `[SEOHead] Canonical URL set`

### Still Having Issues?
1. Check the browser console for **any error messages**
2. Check the Network tab for **failed requests** (look for red 404s, 403s)
3. Try **clearing cache and cookies**, then reload
4. Try a **different browser** to rule out browser-specific issues
5. Check `.env` file to ensure all required environment variables are set

---

## Next Steps After Testing

1. **After confirming GA4 is working:**
   - Monitor your Google Analytics dashboard for 24-48 hours to confirm data collection
   - Set up any custom events you need for conversion tracking

2. **After confirming SEO canonical is fixed:**
   - Submit your sitemaps to Google Search Console
   - Request re-crawl of affected pages in Search Console
   - Monitor for "Duplicate without user-selected canonical" errors (should now be resolved)

3. **Ongoing Monitoring:**
   - Set up email alerts in Google Analytics for anomalies
   - Monitor Search Console for crawl errors and coverage issues
   - Check real-time dashboard weekly for normal traffic patterns

---

## Summary of Changes Made

### GA4 Improvements:
✅ Enhanced GA initialization with proper logging  
✅ Added consent mode v2 support with persistent consent state  
✅ Implemented retry logic for page view tracking  
✅ Added error handling for GA script loading  
✅ Improved debugging with detailed console logs  

### SEO Improvements:
✅ Standardized canonical URL generation with trailing slash consistency  
✅ Updated all page components to use normalized canonical URLs  
✅ Enhanced SEOHead component with fallback canonical generation  
✅ Verified og:url and twitter:url match canonical  
✅ Improved index.html with proper default meta tags  

