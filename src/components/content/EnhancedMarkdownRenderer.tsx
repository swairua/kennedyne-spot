import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkSmartypants from 'remark-smartypants';
import remarkToc from 'remark-toc';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';
import { cn } from '@/lib/utils';
import {
  Callout, CodeBlock, Figure, FAQ, HowTo, KPI, CTABlock, VideoEmbed
} from './ContentBlocks';
import { getInternalLinkProps } from '@/constants/links';
import { TableOfContents, ReadingProgressBar } from './TableOfContents';
import { extractHeadings } from '@/utils/contentFormatter';

interface EnhancedMarkdownRendererProps {
  content: string;
  showTOC?: boolean;
  showProgress?: boolean;
  className?: string;
  components?: Record<string, React.ComponentType<any>>;
}

// Wrapper component to handle markdown rendering
const MarkdownRendererWrapper: React.FC<{
  content: string;
  components: Record<string, React.ComponentType<any>>;
}> = ({ content, components }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[
        remarkGfm,
        [remarkToc, { maxDepth: 3, tight: true }]
      ]}
      rehypePlugins={[
        rehypeRaw,
        rehypeSlug,
        [rehypeAutolinkHeadings, {
          behavior: 'wrap',
          properties: {
            className: 'anchor-link'
          }
        }],
        [rehypeExternalLinks, {
          target: '_blank',
          rel: 'noopener noreferrer'
        }]
      ]}
      components={components}
      unwrapDisallowed={true}
    >
      {content}
    </ReactMarkdown>
  );
};

export const EnhancedMarkdownRenderer: React.FC<EnhancedMarkdownRendererProps> = ({
  content,
  showTOC = true,
  showProgress = true,
  className,
  components: customComponents = {}
}) => {
  const headings = React.useMemo(() => extractHeadings(content), [content]);

  // Custom components for markdown rendering
  const components = {
    // Enhanced headings with auto-linking
    h1: ({ children, id, ...props }: any) => (
      <h1 
        id={id} 
        className="scroll-mt-20 text-4xl font-bold tracking-tight text-foreground mb-6"
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ children, id, ...props }: any) => (
      <h2 
        id={id} 
        className="scroll-mt-20 text-xl sm:text-2xl lg:text-3xl font-semibold mt-8 mb-4 first:mt-0"
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, id, ...props }: any) => (
      <h3 
        id={id} 
        className="scroll-mt-20 text-lg sm:text-xl lg:text-2xl font-semibold mt-6 mb-3"
        {...props}
      >
        {children}
      </h3>
    ),
    h4: ({ children, id, ...props }: any) => (
      <h4 
        id={id} 
        className="scroll-mt-20 text-base sm:text-lg lg:text-xl font-semibold mt-4 mb-2"
        {...props}
      >
        {children}
      </h4>
    ),

    // Enhanced paragraphs
    p: ({ children, ...props }: any) => {
      // Check if paragraph contains only a block-level element (like Figure)
      const childArray = React.Children.toArray(children);

      // If paragraph contains only one child that's a React component (block-level like Figure),
      // render it without the paragraph wrapper to avoid nesting violations
      const hasOnlyBlockElement = childArray.length === 1 &&
        React.isValidElement(childArray[0]) &&
        typeof childArray[0].type !== 'string'; // Custom components, not HTML elements

      if (hasOnlyBlockElement) {
        return childArray[0];
      }

      // Otherwise render normal paragraph
      return (
        <p className="text-base leading-7 text-foreground/90 mb-4" {...props}>
          {children}
        </p>
      );
    },

    // Enhanced lists
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc list-inside space-y-2 mb-4 text-foreground/90" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="list-decimal list-inside space-y-2 mb-4 text-foreground/90" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="ml-4" {...props}>
        {children}
      </li>
    ),

    // Enhanced blockquotes
    blockquote: ({ children, ...props }: any) => (
      <blockquote 
        className="border-l-4 border-primary pl-6 py-2 my-6 italic text-foreground/80 bg-muted/50 rounded-r-lg"
        {...props}
      >
        {children}
      </blockquote>
    ),

    // Enhanced code blocks
    pre: ({ children, ...props }: any) => {
      const codeElement = React.Children.only(children) as React.ReactElement;
      const code = codeElement.props.children;
      const language = codeElement.props.className?.replace('language-', '') || 'text';
      
      return (
        <CodeBlock 
          code={code} 
          language={language} 
          showCopyButton={true}
          showLineNumbers={false}
        />
      );
    },
    code: ({ children, className, ...props }: any) => {
      // Inline code
      if (!className) {
        return (
          <code 
            className="bg-muted px-2 py-1 rounded text-sm font-mono text-foreground"
            {...props}
          >
            {children}
          </code>
        );
      }
      // Block code (handled by pre component)
      return <code className={className} {...props}>{children}</code>;
    },

    // Enhanced images
    img: ({ src, alt, title, ...props }: any) => {
      // For images with explicit sizing/alignment (from HTML), render as-is
      if (props.className || props.width || props.height || props.style) {
        return (
          <img 
            src={src} 
            alt={alt || ''} 
            title={title}
            className={props.className}
            width={props.width}
            height={props.height}
            style={props.style}
            loading={props.loading || 'lazy'}
            decoding={props.decoding || 'async'}
          />
        );
      }
      
      // For markdown images, use Figure component
      return (
        <Figure 
          src={src} 
          alt={alt || ''} 
          caption={title}
        />
      );
    },

    // Enhanced links
    a: ({ href, children, ...props }: any) => {
      const isInternal = href?.startsWith('/') || href?.startsWith('#');
      const linkProps = isInternal ? getInternalLinkProps(href) : { href };
      return (
        <a
          {...linkProps}
          className={cn(
            "text-primary hover:text-primary-hover underline decoration-2 underline-offset-2 transition-colors",
            isInternal ? "font-medium" : "font-normal"
          )}
          {...(isInternal ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
          {...props}
        >
          {children}
        </a>
      );
    },

    // Enhanced tables
    table: ({ children, ...props }: any) => (
      <div className="my-6 overflow-x-auto">
        <table className="w-full border-collapse border border-border" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }: any) => (
      <thead className="bg-muted" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }: any) => (
      <tbody {...props}>
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }: any) => (
      <tr className="border-b border-border" {...props}>
        {children}
      </tr>
    ),
    th: ({ children, ...props }: any) => (
      <th className="border border-border px-4 py-2 text-left font-semibold" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }: any) => (
      <td className="border border-border px-4 py-2" {...props}>
        {children}
      </td>
    ),

    // Custom components
    ...customComponents
  };

  return (
    <div className="relative">
      {showProgress && <ReadingProgressBar />}

      <div className={cn("flex gap-8", className)}>
        {/* Main content */}
        <article className="flex-1 min-w-0">
          <div className={cn(
            "prose prose-lg max-w-none",
            "prose-headings:scroll-mt-20",
            "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
            "prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm",
            "prose-pre:bg-transparent prose-pre:p-0",
            "prose-img:rounded-lg prose-img:border",
            "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/50",
            "prose-table:border-collapse prose-table:border prose-table:border-border",
            "prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-4 prose-th:py-2",
            "prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2"
          )}>
            <MarkdownRendererWrapper
              content={content}
              components={components}
            />
          </div>
        </article>

        {/* Table of Contents */}
        {showTOC && headings.length > 0 && (
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <TableOfContents 
              headings={headings} 
              sticky={true} 
              showProgress={true}
            />
          </aside>
        )}
      </div>
    </div>
  );
};
