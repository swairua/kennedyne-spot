
# Fix Three Critical Issues

## Issue Summary

Based on your screenshots and my investigation, there are three distinct issues to fix:

| Issue | Screenshot | Location | Root Cause |
|-------|------------|----------|------------|
| **1. Browser Regex Error** | Image 1 | Blog Editor | Complex dynamic regex patterns crash Safari/Edge |
| **2. Unclickable Social Links** | Image 2 | Contact Page Footer | Button component `asChild` pattern has CSS click target issues |
| **3. Truncated Feedback** | Image 3 | Admin Leads | `line-clamp-2` and small details summary hide full text |

---

## Issue 1: Browser Compatibility Error (Safari/Edge)

**Error**: "Invalid regular expression: invalid group specifier name"

**Root Cause**: The RichTextEditor uses dynamic `RegExp` constructors with complex patterns that can fail in older Safari/Edge browsers. While the patterns don't use named capture groups directly, the complex nesting and character class combinations can trigger parsing issues.

**Current Code** (problematic):
```typescript
const figureRegex = new RegExp(
  `<figure[^>]*>[\\s\\S]*?<img[^>]*src=["']${escapedSrc}["'][^>]*>[\\s\\S]*?<\\/figure>`,
  'g'
);
```

**Solution**: Replace complex regex with simpler string-based search or use safer regex patterns, wrapped in try/catch.

### Changes to `src/components/editor/RichTextEditor.tsx`:

```typescript
// Replace handleImageUpdate with safer string-based approach
const handleImageUpdate = useCallback((updatedHtml: string) => {
  if (!editorRef.current || !originalImageSrc) {
    toast.error('Could not update image');
    return;
  }

  try {
    const currentMarkdown = editorRef.current.getMarkdown();
    
    // Use indexOf-based search instead of regex for better browser compatibility
    const srcIndex = currentMarkdown.indexOf(originalImageSrc);
    if (srcIndex === -1) {
      toast.error('Could not find the image to update');
      return;
    }
    
    // Find the figure start and end around this image
    let figureStart = currentMarkdown.lastIndexOf('<figure', srcIndex);
    let figureEnd = currentMarkdown.indexOf('</figure>', srcIndex);
    
    if (figureStart === -1 || figureEnd === -1) {
      toast.error('Could not find the image container to update');
      return;
    }
    
    figureEnd += '</figure>'.length;
    
    const newMarkdown = 
      currentMarkdown.substring(0, figureStart) + 
      updatedHtml + 
      currentMarkdown.substring(figureEnd);
    
    editorRef.current.setMarkdown(newMarkdown);
    onChange(newMarkdown);
    
    // Reset state
    setIsEditMode(false);
    setEditingImage(null);
    setOriginalImageSrc('');
    setIsImageModalOpen(false);

    toast.success('Image updated successfully');
  } catch (error) {
    console.error('Failed to update image:', error);
    toast.error('Failed to update image');
  }
}, [onChange, originalImageSrc]);
```

---

## Issue 2: Unclickable Social Links in Contact Page

**Problem**: The "Follow Our Educational Content" buttons (Telegram, YouTube, Twitter/X, Instagram) are not clickable.

**Root Cause**: The `Button` component with `asChild` prop combined with the `<a>` tag might have CSS issues where `pointer-events-none` from the `[&_svg]` class selector or the `transform` property creates a stacking context issue.

**Current Code**:
```tsx
<Button variant="outline" size="lg" asChild>
  <a {...getExternalLinkProps(LINKS.telegram.kenneDynespot)}>
    {t('social_telegram')}
  </a>
</Button>
```

**Solution**: Ensure proper clickability by adding explicit pointer-events and z-index to the anchor tags, or restructure to avoid the `asChild` pattern for these specific links.

### Changes to `src/pages/Contact.tsx`:

```tsx
{/* Social Links - Fixed for proper clickability */}
<div className="flex flex-wrap justify-center gap-4">
  <a 
    {...getExternalLinkProps(LINKS.telegram.kenneDynespot)}
    className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-lg text-base font-medium border border-border bg-card/50 hover:bg-card hover:text-card-foreground backdrop-blur-sm shadow-card transition-all duration-300 cursor-pointer"
  >
    <Send className="h-4 w-4" />
    {t('social_telegram')}
  </a>
  {/* Similar for YouTube, Twitter, Instagram */}
</div>
```

Alternatively, add explicit styles to force clickability:

```tsx
<Button variant="outline" size="lg" asChild className="relative z-10">
  <a 
    {...getExternalLinkProps(LINKS.telegram.kenneDynespot)}
    className="cursor-pointer"
    style={{ pointerEvents: 'auto' }}
  >
    {t('social_telegram')}
  </a>
</Button>
```

---

## Issue 3: Truncated Feedback Messages in Admin Leads

**Problem**: Customer feedback (Experience, Goals, Message) is cut off and hard to read completely.

**Root Cause**: 
- `line-clamp-2` class limits visible text to 2 lines
- The `<details>` summary for "View Goals"/"View Message" isn't prominent enough
- Users may not realize they need to expand to see full content

**Current Code**:
```tsx
<span className="text-xs line-clamp-2">{lead.experience}</span>
```

**Solution**: Make expanded view the default or show more content initially, with a clear "show more/less" toggle.

### Changes to `src/pages/AdminLeadsEnhanced.tsx`:

1. Remove `line-clamp-2` from Experience field or increase to `line-clamp-4`
2. Make the details/summary more prominent with better styling
3. Add a "Read more" indicator when text is truncated

```tsx
{/* Experience - Show more by default */}
{lead.experience && (
  <div>
    <span className="text-xs font-medium text-muted-foreground">Experience: </span>
    <span className="text-xs whitespace-pre-wrap">{lead.experience}</span>
  </div>
)}

{/* Expandable Details - More prominent styling */}
{(lead.type === 'mentorship' && lead.goals) || (lead.type === 'contact' && lead.message) ? (
  <details className="text-sm group" open>
    <summary className="text-xs font-medium text-primary cursor-pointer hover:text-primary/80 flex items-center gap-1">
      <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
      {lead.type === 'mentorship' ? 'Goals' : 'Message'}
    </summary>
    <div className="mt-2 p-3 bg-muted/50 rounded-md text-xs max-h-48 overflow-y-auto">
      <span className="whitespace-pre-wrap break-words">
        {lead.type === 'mentorship' ? lead.goals : lead.message}
      </span>
    </div>
  </details>
) : null}
```

---

## Files to Modify

| File | Issue | Changes |
|------|-------|---------|
| `src/components/editor/RichTextEditor.tsx` | #1 | Replace regex with string-based search, add try/catch |
| `src/pages/Contact.tsx` | #2 | Fix button/link clickability with explicit styles |
| `src/pages/AdminLeadsEnhanced.tsx` | #3 | Remove line-clamp, default-open details, add scroll |

---

## Technical Details

### Issue 1 - Regex Compatibility

The Safari/Edge regex error occurs because:
1. Dynamic `RegExp()` constructor with complex patterns can fail
2. Character class `[\\s\\S]` combined with nested brackets triggers parser issues
3. Some older browsers don't handle lazy quantifiers `*?` well in complex patterns

The fix uses `indexOf()` and `substring()` which are 100% cross-browser compatible.

### Issue 2 - Button asChild Click Issues

The Radix UI `Slot` component (used by `asChild`) merges props correctly, but:
1. The `[&_svg]:pointer-events-none` in button styles can interfere
2. Transform and backdrop-blur create new stacking contexts
3. Some browsers need explicit `cursor: pointer` on anchor tags

### Issue 3 - Content Visibility

The truncation causes:
1. Important customer context to be hidden
2. Users missing the expandable "View Goals" summary
3. No indication that content continues beyond visible area

Making `<details open>` the default ensures full visibility while still allowing collapse.

---

## Expected Results

After implementation:

1. **Safari/Edge users** can access the blog editor without regex errors
2. **Social media buttons** on Contact page are fully clickable
3. **Admin staff** can read complete customer feedback without needing to click expand
