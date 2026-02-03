import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Copy, Plus, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

interface MarkdownGuideProps {
  onInsert?: (text: string) => void;
}

const MarkdownGuide = ({ onInsert }: MarkdownGuideProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('basics');

  const examples = {
    basics: [
      {
        category: "Headings",
        items: [
          { 
            syntax: "# Main Title", 
            description: "H1 - Use once per article",
            example: "# Complete Trading Guide"
          },
          { 
            syntax: "## Section Heading", 
            description: "H2 - Major sections",
            example: "## Risk Management Basics"
          },
          { 
            syntax: "### Subsection", 
            description: "H3 - Subsections",
            example: "### Setting Stop Losses"
          },
          { 
            syntax: "#### Minor Heading", 
            description: "H4 - Minor headings",
            example: "#### Quick Tips"
          },
        ]
      },
      {
        category: "Text Formatting",
        items: [
          { 
            syntax: "**Bold text**", 
            description: "Emphasize important points",
            example: "**Always** use stop losses"
          },
          { 
            syntax: "*Italic text*", 
            description: "Subtle emphasis or terms",
            example: "*Risk management* is crucial"
          },
          { 
            syntax: "***Bold and italic***", 
            description: "Strong emphasis",
            example: "***Never*** risk more than 2%"
          },
          { 
            syntax: "~~Strikethrough~~", 
            description: "Show corrections or outdated info",
            example: "~~Old strategy~~ Updated approach"
          },
          { 
            syntax: "`Inline code`", 
            description: "Technical terms or values",
            example: "Set `lot_size = 0.01`"
          },
        ]
      },
    ],
    lists: [
      {
        category: "Unordered Lists",
        items: [
          { 
            syntax: "- First item\n- Second item\n- Third item", 
            description: "Simple bullet points",
            example: "- Check market news\n- Analyze charts\n- Place trades"
          },
          { 
            syntax: "* Alternative bullet\n* Another item", 
            description: "Alternative bullet style",
            example: "* EUR/USD analysis\n* GBP/JPY setup"
          },
          { 
            syntax: "- Main item\n  - Nested item\n  - Another nested\n    - Deeply nested", 
            description: "Nested lists with indentation",
            example: "- Trading strategies\n  - Scalping\n  - Day trading\n    - 1-hour charts\n    - 4-hour charts"
          },
        ]
      },
      {
        category: "Ordered Lists",
        items: [
          { 
            syntax: "1. First step\n2. Second step\n3. Third step", 
            description: "Numbered steps or procedures",
            example: "1. Open trading platform\n2. Analyze market conditions\n3. Execute trade"
          },
          { 
            syntax: "1. Main step\n   1. Sub-step\n   2. Another sub-step\n2. Next main step", 
            description: "Nested numbered lists",
            example: "1. Pre-market analysis\n   1. Check economic calendar\n   2. Review overnight news\n2. Market session trading"
          },
        ]
      },
      {
        category: "Task Lists",
        items: [
          { 
            syntax: "- [ ] Unchecked item\n- [x] Checked item\n- [ ] Another task", 
            description: "Interactive checkboxes",
            example: "- [x] Set up trading account\n- [x] Complete risk assessment\n- [ ] Start live trading"
          },
        ]
      },
    ],
    media: [
      {
        category: "Links",
        items: [
          { 
            syntax: "[Link text](https://example.com)", 
            description: "Basic link format",
            example: "[Trading Platform](https://platform.example.com)"
          },
          { 
            syntax: "[Link with title](https://example.com \"Hover title\")", 
            description: "Link with tooltip on hover",
            example: "[MetaTrader 5](https://mt5.com \"Download MT5 Platform\")"
          },
          { 
            syntax: "[Reference link][1]\n\n[1]: https://example.com \"Reference\"", 
            description: "Reference-style links",
            example: "[Trading guide][guide]\n\n[guide]: https://example.com/guide \"Complete Guide\""
          },
          { 
            syntax: "<https://example.com>", 
            description: "Automatic link",
            example: "<https://tradingview.com>"
          },
        ]
      },
      {
        category: "Images",
        items: [
          { 
            syntax: "![Alt text](image.jpg)", 
            description: "Basic image insertion",
            example: "![Chart Analysis](chart-analysis.jpg)"
          },
          { 
            syntax: "![Alt text](image.jpg \"Caption\")", 
            description: "Image with caption",
            example: "![EUR/USD Chart](chart.jpg \"Daily EUR/USD Analysis\")"
          },
          { 
            syntax: "[![Alt text](image.jpg)](https://link.com)", 
            description: "Clickable image link",
            example: "[![Trading Platform](platform.jpg)](https://platform.com)"
          },
        ]
      },
    ],
    advanced: [
      {
        category: "Code Blocks",
        items: [
          { 
            syntax: "```javascript\nfunction calculateRisk() {\n  return balance * 0.02;\n}\n```", 
            description: "Syntax highlighted code",
            example: "```python\ndef calculate_position_size(balance, risk_percent):\n    return balance * (risk_percent / 100)\n```"
          },
          { 
            syntax: "```\nPlain text code block\nNo syntax highlighting\n```", 
            description: "Plain code block",
            example: "```\nBuy EUR/USD at 1.1000\nStop Loss: 1.0950\nTake Profit: 1.1100\n```"
          },
        ]
      },
      {
        category: "Tables",
        items: [
          { 
            syntax: "| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |", 
            description: "Basic table structure",
            example: "| Pair | Entry | Stop Loss | Take Profit |\n|------|-------|-----------|-------------|\n| EUR/USD | 1.1000 | 1.0950 | 1.1100 |\n| GBP/JPY | 150.00 | 149.50 | 151.00 |"
          },
          { 
            syntax: "| Left | Center | Right |\n|:-----|:------:|------:|\n| L1   |   C1   |    R1 |\n| L2   |   C2   |    R2 |", 
            description: "Table with alignment",
            example: "| Currency | Price | Change |\n|:---------|:-----:|-------:|\n| EUR/USD  | 1.1000 | +0.50% |\n| GBP/JPY  | 150.00 | -0.25% |"
          },
        ]
      },
      {
        category: "Quotes & Callouts",
        items: [
          { 
            syntax: "> This is a blockquote\n> It can span multiple lines", 
            description: "Blockquotes for emphasis",
            example: "> Risk management is not about avoiding losses,\n> it's about controlling them."
          },
          { 
            syntax: "> **Warning:** Important information\n> \n> This is a warning callout", 
            description: "Warning callouts",
            example: "> **Risk Warning:** Trading forex involves substantial risk\n> \n> Only trade with money you can afford to lose."
          },
          { 
            syntax: "> 💡 **Tip:** Pro trading advice\n> \n> Use multiple timeframes for analysis", 
            description: "Tip callouts with emojis",
            example: "> 💡 **Pro Tip:** Always wait for confirmation\n> \n> Don't rush into trades based on single signals."
          },
        ]
      },
      {
        category: "Dividers & Breaks",
        items: [
          { 
            syntax: "---", 
            description: "Horizontal rule / section break",
            example: "## Trading Strategy\n\nContent here...\n\n---\n\n## Risk Management"
          },
          { 
            syntax: "***", 
            description: "Alternative horizontal rule",
            example: "Market analysis section\n\n***\n\nTrading signals section"
          },
          { 
            syntax: "Text with  \nline break", 
            description: "Force line break (two spaces + enter)",
            example: "First line of trade setup  \nSecond line continues here"
          },
        ]
      },
    ]
  };

  const allItems = useMemo(() => {
    return Object.values(examples).flat().flatMap(category => 
      category.items.map(item => ({ ...item, category: category.category }))
    );
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return allItems;
    return allItems.filter(item => 
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.syntax.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.example && item.example.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, allItems]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Markdown syntax copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the text manually",
        variant: "destructive",
      });
    }
  };

  const handleInsert = (text: string) => {
    if (onInsert) {
      onInsert(text);
      toast({
        title: "Inserted!",
        description: "Markdown syntax inserted into editor",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <HelpCircle className="h-4 w-4 mr-1" />
          Markdown Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[90vh] w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Markdown Formatting Guide</DialogTitle>
          <p className="text-muted-foreground">
            Master markdown syntax to create beautiful, well-formatted blog content
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search markdown syntax, descriptions, or examples..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basics">Basics</TabsTrigger>
              <TabsTrigger value="lists">Lists</TabsTrigger>
              <TabsTrigger value="media">Media & Links</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[60vh] mt-4">
              {searchTerm ? (
                /* Search Results */
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Search Results ({filteredItems.length})</h3>
                  <div className="grid gap-4">
                    {filteredItems.map((item, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-sm font-medium">{item.description}</CardTitle>
                              <Badge variant="outline" className="text-xs">{item.category}</Badge>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(item.syntax)}
                                className="h-8 w-8 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              {onInsert && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleInsert(item.syntax)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-xs font-medium text-muted-foreground mb-2">Syntax</h4>
                              <code className="bg-muted/50 p-3 rounded text-xs font-mono block whitespace-pre-wrap border">
                                {item.syntax}
                              </code>
                            </div>
                            {item.example && (
                              <div>
                                <h4 className="text-xs font-medium text-muted-foreground mb-2">Rendered Output</h4>
                                <div className="bg-background p-3 rounded border text-xs prose prose-sm max-w-none">
                                  <ReactMarkdown>{item.example}</ReactMarkdown>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                /* Tabbed Content */
                <>
                  {Object.entries(examples).map(([tabKey, sections]) => (
                    <TabsContent key={tabKey} value={tabKey} className="mt-0">
                      <div className="space-y-6">
                        {sections.map((section, sectionIndex) => (
                          <div key={sectionIndex} className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">{section.category}</h3>
                            <div className="grid gap-4">
                              {section.items.map((item, itemIndex) => (
                                <Card key={itemIndex} className="overflow-hidden">
                                  <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                      <CardTitle className="text-sm font-medium">{item.description}</CardTitle>
                                      <div className="flex gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleCopy(item.syntax)}
                                          className="h-8 w-8 p-0"
                                        >
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                        {onInsert && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleInsert(item.syntax)}
                                            className="h-8 w-8 p-0"
                                          >
                                            <Plus className="h-3 w-3" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="pt-0">
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="text-xs font-medium text-muted-foreground mb-2">Syntax</h4>
                                        <code className="bg-muted/50 p-3 rounded text-xs font-mono block whitespace-pre-wrap border">
                                          {item.syntax}
                                        </code>
                                      </div>
                                      {item.example && (
                                        <div>
                                          <h4 className="text-xs font-medium text-muted-foreground mb-2">Rendered Output</h4>
                                          <div className="bg-background p-3 rounded border text-xs prose prose-sm max-w-none">
                                            <ReactMarkdown>{item.example}</ReactMarkdown>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </>
              )}
            </ScrollArea>
          </Tabs>
          
          {/* Pro Tips */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">💡 Pro Tips for Great Content</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1 grid md:grid-cols-2 gap-x-4">
                <li>• Use H2-H4 headings for clear structure</li>
                <li>• Keep paragraphs short (2-3 sentences)</li>
                <li>• Use lists to break down complex ideas</li>
                <li>• Add descriptive alt text to all images</li>
                <li>• Include code examples for technical content</li>
                <li>• Use blockquotes for important warnings</li>
                <li>• Preview your content before publishing</li>
                <li>• Test all links and verify they work</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MarkdownGuide;