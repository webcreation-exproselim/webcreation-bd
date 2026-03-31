import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'URL required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching OG data for:', url);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html',
        'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8',
      },
      redirect: 'follow',
    });

    const html = await response.text();

    const getMetaContent = (property: string): string | null => {
      const ogMatch = html.match(new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'))
        || html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`, 'i'));
      if (ogMatch) return ogMatch[1];
      const nameMatch = html.match(new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'))
        || html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${property}["']`, 'i'));
      if (nameMatch) return nameMatch[1];
      return null;
    };

    const title = getMetaContent('og:title') || getMetaContent('twitter:title') || (() => {
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      return titleMatch ? titleMatch[1].trim() : null;
    })();

    const description = getMetaContent('og:description') || getMetaContent('twitter:description') || getMetaContent('description');
    let image: string | null = getMetaContent('og:image') || getMetaContent('twitter:image');

    // Download image and re-upload to Supabase storage so browsers can load it
    if (image) {
      try {
        console.log('Downloading OG image to re-upload...');
        const imgRes = await fetch(image, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' },
        });
        if (imgRes.ok) {
          const ct = imgRes.headers.get('content-type') || 'image/jpeg';
          const buf = new Uint8Array(await imgRes.arrayBuffer());
          const ext = ct.includes('png') ? 'png' : ct.includes('webp') ? 'webp' : 'jpg';
          const name = `stories/og-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

          const sb = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
          );

          const { error: upErr } = await sb.storage
            .from('payment-screenshots')
            .upload(name, buf, { contentType: ct, upsert: true });

          if (!upErr) {
            const { data: pub } = sb.storage.from('payment-screenshots').getPublicUrl(name);
            image = pub.publicUrl;
            console.log('Re-uploaded image:', image);
          } else {
            console.error('Upload failed:', upErr.message);
          }
        }
      } catch (e) {
        console.error('Image re-upload error:', e);
      }
    }

    return new Response(JSON.stringify({
      title: title || null,
      description: description || null,
      image: image || null,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('OG scrape error:', error);
    return new Response(JSON.stringify({
      title: null, description: null, image: null,
      error: error instanceof Error ? error.message : 'Failed to fetch',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
