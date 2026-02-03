import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

interface TranslateRequest {
  text: string;
  targetLang: 'fr' | 'es' | 'de' | 'ru';
  sourceLang?: string;
}

const LANG_MAP: Record<string, string> = {
  'fr': 'French',
  'es': 'Spanish', 
  'de': 'German',
  'ru': 'Russian',
  'en': 'English'
};

async function translateWithLovableAI(text: string, targetLang: string, sourceLang = 'en'): Promise<string> {
  if (!LOVABLE_API_KEY) {
    console.error('LOVABLE_API_KEY not configured');
    return text;
  }

  const targetLanguage = LANG_MAP[targetLang] || targetLang;
  const sourceLanguage = LANG_MAP[sourceLang] || sourceLang;

  const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. 
Preserve all Markdown formatting (headings, links, lists, bold, italic, code blocks, etc.).
Return ONLY the translated text without any additional commentary, quotes, or decoration.

Text to translate:
${text}`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (response.status === 429) {
      throw new Error('RATE_LIMIT');
    }
    if (response.status === 402) {
      throw new Error('PAYMENT_REQUIRED');
    }
    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI_GATEWAY_ERROR');
    }

    const data = await response.json();
    const translated = data.choices?.[0]?.message?.content?.trim();
    
    if (!translated) {
      console.error('No translation returned from AI');
      return text;
    }

    return translated;
  } catch (error: any) {
    console.error('Translation error:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, targetLang, sourceLang = 'en' }: TranslateRequest = await req.json();

    if (!text || !targetLang) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: text, targetLang' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Translating from ${sourceLang} to ${targetLang}, text length: ${text.length}`);

    const translatedText = await translateWithLovableAI(text, targetLang, sourceLang);

    console.log(`Translation complete, result length: ${translatedText.length}`);

    return new Response(
      JSON.stringify({ translatedText, targetLang }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Translation error:', error);
    
    if (error.message === 'RATE_LIMIT') {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (error.message === 'PAYMENT_REQUIRED') {
      return new Response(
        JSON.stringify({ error: 'AI credits exhausted. Please add credits to your workspace.' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: error.message || 'Translation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
