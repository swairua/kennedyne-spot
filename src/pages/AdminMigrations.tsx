import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, AlertTriangle, CheckCircle, Loader2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Migration {
  id: string;
  name: string;
  description: string;
  sql: string;
  status: 'pending' | 'applied' | 'failed';
  createdAt: string;
}

const MIGRATIONS: Migration[] = [
  {
    id: '001',
    name: '001_add_blog_cta_fields.sql',
    description: 'Add CTA (Call-to-Action) fields to blog_posts table',
    sql: `
-- Add CTA columns to blog_posts table if they don't exist
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS cta_type VARCHAR(20) DEFAULT 'whatsapp',
ADD COLUMN IF NOT EXISTS cta_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS cta_url TEXT,
ADD COLUMN IF NOT EXISTS cta_enabled BOOLEAN DEFAULT true;

-- Add constraints
ALTER TABLE blog_posts
ADD CONSTRAINT valid_cta_type CHECK (cta_type IN ('whatsapp', 'link', 'email', 'phone'));

-- Add comments for clarity
COMMENT ON COLUMN blog_posts.cta_type IS 'Type of CTA: whatsapp, link, email, phone (default: whatsapp)';
COMMENT ON COLUMN blog_posts.cta_title IS 'Button text for the CTA (e.g., "Contact on WhatsApp")';
COMMENT ON COLUMN blog_posts.cta_url IS 'URL or phone number for the CTA destination';
COMMENT ON COLUMN blog_posts.cta_enabled IS 'Whether to show the CTA on this post (default: true)';
    `,
    status: 'pending',
    createdAt: '2025-01-19'
  }
];

export default function AdminMigrations() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [selectedMigration, setSelectedMigration] = useState<Migration | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);

  const handleCopySql = async (sql: string) => {
    try {
      await navigator.clipboard.writeText(sql);
      toast({
        title: 'Copied',
        description: 'SQL copied to clipboard. You can now paste it in Supabase SQL Editor.',
      });
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy SQL to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleRunMigration = async (migration: Migration) => {
    if (!window.confirm(
      `Are you sure you want to run migration: ${migration.name}?\n\nThis will modify the database structure.`
    )) {
      return;
    }

    setRunning(true);
    try {
      // For safety, we recommend running migrations directly in Supabase SQL editor
      // This is a placeholder for future implementation with proper RLS and auth
      toast({
        title: 'Instructions',
        description: `Please run this migration in your Supabase SQL Editor:\n\n${migration.sql}`,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to run migration',
        variant: 'destructive',
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="outline"
          onClick={() => navigate('/admin')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Database Migrations</h1>
          <p className="text-muted-foreground">
            Manage and apply database schema migrations to your Supabase database.
          </p>
        </div>

        <Alert className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <strong>Important:</strong> Database migrations modify your schema. Always test in a development environment first.
            Back up your database before running migrations in production.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {MIGRATIONS.map((migration) => (
            <Card key={migration.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {migration.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {migration.description}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {migration.status === 'applied' ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        Applied
                      </div>
                    ) : migration.status === 'failed' ? (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        Failed
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">Pending</div>
                    )}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Created: {migration.createdAt}
                </p>
              </CardHeader>
              <Separator />
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto max-h-40 overflow-y-auto">
                    <pre>{migration.sql}</pre>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      onClick={() => handleCopySql(migration.sql)}
                      variant="outline"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy SQL
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedMigration(migration);
                        setShowSqlModal(true);
                      }}
                    >
                      View Full SQL
                    </Button>
                    <Button
                      size="sm"
                      disabled={running || migration.status === 'applied'}
                      onClick={() => handleRunMigration(migration)}
                    >
                      {running ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        'Run Migration'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
          <CardHeader>
            <CardTitle>How to Run Migrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Option 1: Supabase SQL Editor (Recommended)</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Go to your Supabase dashboard</li>
                <li>Navigate to SQL Editor</li>
                <li>Click "New Query"</li>
                <li>Copy the SQL from above and paste it</li>
                <li>Click "Run"</li>
              </ol>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Option 2: Using CLI</h4>
              <div className="bg-muted p-3 rounded font-mono text-sm overflow-x-auto">
                <code>node scripts/run-migration.js 001_add_blog_cta_fields.sql</code>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Requires SUPABASE_SERVICE_ROLE_KEY environment variable set.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
