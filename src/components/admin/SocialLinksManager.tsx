import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, GripVertical, MessageCircle, Send, Youtube, Twitter, Instagram, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSocialLinks, updateSocialLinks, SocialLink } from '@/hooks/useSocialLinks';

const SOCIAL_TYPES = [
  { value: 'telegram', label: 'Telegram', icon: Send },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'x', label: 'Twitter/X', icon: Twitter },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'other', label: 'Other', icon: Globe },
];

export function SocialLinksManager() {
  const { toast } = useToast();
  const { socialLinks: initialLinks, loading } = useSocialLinks();
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && initialLinks) {
      setLinks(initialLinks);
    }
  }, [initialLinks, loading]);

  const handleAddLink = () => {
    setLinks([...links, { name: '', href: '', type: 'telegram' }]);
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleUpdateLink = (index: number, field: keyof SocialLink, value: string) => {
    const updatedLinks = [...links];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    
    // Auto-fill name based on type if name is empty
    if (field === 'type' && !updatedLinks[index].name) {
      const typeConfig = SOCIAL_TYPES.find(t => t.value === value);
      if (typeConfig) {
        updatedLinks[index].name = typeConfig.label;
      }
    }
    
    setLinks(updatedLinks);
  };

  const handleSave = async () => {
    // Validate links
    const validLinks = links.filter(link => link.href.trim() !== '');
    
    if (validLinks.some(link => !link.href.startsWith('http'))) {
      toast({
        title: 'Invalid URL',
        description: 'All URLs must start with http:// or https://',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    const result = await updateSocialLinks(validLinks);
    setSaving(false);

    if (result.success) {
      toast({
        title: 'Success',
        description: 'Social links saved successfully',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to save social links',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Social Media Links
        </CardTitle>
        <CardDescription>
          Configure the social media links displayed in the footer. These links will be visible to all visitors.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {links.map((link, index) => {
          const TypeIcon = SOCIAL_TYPES.find(t => t.value === link.type)?.icon || Globe;
          
          return (
            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Select
                    value={link.type}
                    onValueChange={(value) => handleUpdateLink(index, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOCIAL_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Display Name</Label>
                  <Input
                    value={link.name}
                    onChange={(e) => handleUpdateLink(index, 'name', e.target.value)}
                    placeholder="e.g., Telegram Channel"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label className="text-xs text-muted-foreground">URL</Label>
                  <Input
                    value={link.href}
                    onChange={(e) => handleUpdateLink(index, 'href', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveLink(index)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleAddLink}>
            <Plus className="h-4 w-4 mr-2" />
            Add Social Link
          </Button>
          
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
