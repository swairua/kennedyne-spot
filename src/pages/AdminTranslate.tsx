import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Download, Loader2 } from 'lucide-react';
import { translateObject, generateTypeScriptCode, TranslationProgress } from '@/utils/bulkTranslate';
import { siteTranslations } from '@/content/siteTranslations';
import { translations } from '@/i18n/translations';
import { useToast } from '@/hooks/use-toast';

export default function AdminTranslate() {
  const { toast } = useToast();
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState<TranslationProgress | null>(null);
  const [result, setResult] = useState<string>('');
  const [translationType, setTranslationType] = useState<'site' | 'ui'>('site');

  const startTranslation = async (type: 'site' | 'ui') => {
    setIsTranslating(true);
    setProgress(null);
    setResult('');
    setTranslationType(type);

    try {
      const sourceObject = type === 'site' ? siteTranslations.fr : translations.en;
      const sourceLang = type === 'site' ? 'fr' : 'en';
      const targetLanguages: Array<'es' | 'de' | 'ru'> = ['es', 'de', 'ru'];
      
      const translatedObjects: Record<string, any> = {};

      for (const targetLang of targetLanguages) {
        toast({
          title: `Starting ${targetLang.toUpperCase()} translation`,
          description: `Translating ${type === 'site' ? 'site content' : 'UI strings'} from ${sourceLang.toUpperCase()} to ${targetLang.toUpperCase()}...`,
        });

        const translated = await translateObject(
          sourceObject,
          targetLang,
          sourceLang,
          (prog) => {
            setProgress({
              ...prog,
              current: `[${targetLang.toUpperCase()}] ${prog.current}`
            });
          }
        );

        translatedObjects[targetLang] = translated;

        toast({
          title: `${targetLang.toUpperCase()} translation complete`,
          description: `Completed with ${progress?.errors.length || 0} errors`,
        });
      }

      // Generate TypeScript code
      const code = generateTypeScriptCode(translatedObjects as any, type);
      setResult(code);

      toast({
        title: 'All translations complete!',
        description: 'Copy the generated code and paste it into the appropriate file.',
      });
    } catch (error: any) {
      console.error('Translation error:', error);
      toast({
        title: 'Translation failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast({
      title: 'Copied to clipboard',
      description: 'Paste the code into the appropriate file',
    });
  };

  const downloadAsFile = () => {
    const filename = translationType === 'site' 
      ? 'siteTranslations_generated.ts' 
      : 'translations_generated.ts';
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const progressPercentage = progress 
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bulk Translation Tool</h1>
        <p className="text-muted-foreground">
          Translate site content and UI strings to Spanish, German, and Russian using AI
        </p>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>How it works</AlertTitle>
        <AlertDescription>
          This tool uses the auto-translate-content edge function to translate all content.
          The process takes 15-50 minutes depending on the amount of text. 
          Once complete, copy the generated code and paste it into the appropriate file.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="site" className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="site">Site Content (siteTranslations.ts)</TabsTrigger>
          <TabsTrigger value="ui">UI Strings (translations.ts)</TabsTrigger>
        </TabsList>

        <TabsContent value="site">
          <Card>
            <CardHeader>
              <CardTitle>Translate Site Content</CardTitle>
              <CardDescription>
                Translates all site content from French to Spanish, German, and Russian.
                Source: <code>siteTranslations.fr</code> → Target: <code>es, de, ru</code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge>~289 fields</Badge>
                  <Badge variant="outline">~867 API calls</Badge>
                  <Badge variant="outline">~15-30 minutes</Badge>
                </div>
                <Button 
                  onClick={() => startTranslation('site')}
                  disabled={isTranslating}
                  size="lg"
                >
                  {isTranslating && translationType === 'site' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    'Start Translation'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ui">
          <Card>
            <CardHeader>
              <CardTitle>Translate UI Strings</CardTitle>
              <CardDescription>
                Translates all UI strings from English to Spanish, German, and Russian.
                Source: <code>translations.en</code> → Target: <code>es, de, ru</code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge>~500 strings</Badge>
                  <Badge variant="outline">~1500 API calls</Badge>
                  <Badge variant="outline">~25-50 minutes</Badge>
                </div>
                <Button 
                  onClick={() => startTranslation('ui')}
                  disabled={isTranslating}
                  size="lg"
                >
                  {isTranslating && translationType === 'ui' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    'Start Translation'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Progress Display */}
      {isTranslating && progress && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Translation Progress</CardTitle>
            <CardDescription>
              {progress.completed} of {progress.total} fields translated ({progressPercentage}%)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progressPercentage} className="w-full" />
            <div className="text-sm text-muted-foreground font-mono">
              {progress.current}
            </div>
            {progress.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{progress.errors.length} errors occurred</AlertTitle>
                <AlertDescription>
                  <div className="max-h-32 overflow-y-auto text-xs mt-2">
                    {progress.errors.map((err, idx) => (
                      <div key={idx} className="mb-1">
                        <strong>{err.path}:</strong> {err.error}
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Result Display */}
      {result && !isTranslating && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Translation Complete!
                </CardTitle>
                <CardDescription>
                  Copy the generated code below and paste it into{' '}
                  <code>src/content/{translationType === 'site' ? 'siteTranslations.ts' : 'i18n/translations.ts'}</code>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  Copy Code
                </Button>
                <Button onClick={downloadAsFile} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={result}
              readOnly
              className="font-mono text-xs h-96"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
