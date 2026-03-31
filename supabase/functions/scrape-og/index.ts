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

    const decodeHtml = (value: string) => value
      .replaceAll('&amp;', '&')
      .replaceAll('&quot;', '"')
      .replaceAll('&#39;', "'")
      .replaceAll('&#x27;', "'");

    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const uploadRemoteImage = async (imageUrl: string | null) => {
      if (!imageUrl) return null;

      try {
        console.log('Downloading image:', imageUrl);
        const imgRes = await fetch(imageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)',
            'Referer': 'https://www.facebook.com/',
          },
        });

        if (!imgRes.ok) {
          console.error('Image download failed with status:', imgRes.status);
          return null;
        }

        const ct = imgRes.headers.get('content-type') || '';
        if (!ct.startsWith('image/')) {
          console.error('Image download returned non-image content type:', ct);
          return null;
        }

        const buf = new Uint8Array(await imgRes.arrayBuffer());
        const ext = ct.includes('png') ? 'png' : ct.includes('webp') ? 'webp' : 'jpg';
        const name = `stories/og-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const { error: upErr } = await sb.storage
          .from('payment-screenshots')
          .upload(name, buf, { contentType: ct, upsert: true });

        if (upErr) {
          console.error('Upload failed:', upErr.message);
          return null;
        }

        const { data: pub } = sb.storage.from('payment-screenshots').getPublicUrl(name);
        console.log('Re-uploaded image:', pub.publicUrl);
        return pub.publicUrl;
      } catch (error) {
        console.error('Image re-upload error:', error);
        return null;
      }
    };

    const getFallbackScreenshot = async (pageUrl: string) => {
      try {
        const fallbackRes = await fetch(
          `https://api.microlink.io/?url=${encodeURIComponent(pageUrl)}&screenshot=true&meta=false`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)',
              'Accept': 'application/json',
            },
          }
        );

        if (!fallbackRes.ok) {
          console.error('Fallback screenshot request failed:', fallbackRes.status);
          return null;
        }

        const fallbackJson = await fallbackRes.json();
        return fallbackJson?.data?.screenshot?.url ?? null;
      } catch (error) {
        console.error('Fallback screenshot error:', error);
        return null;
      }
    };

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
    image = image ? decodeHtml(image) : null;

    let storedImage = await uploadRemoteImage(image);

    if (!storedImage) {
      console.log('Primary OG image failed, trying screenshot fallback');
      const fallbackImage = await getFallbackScreenshot(url);
      storedImage = await uploadRemoteImage(fallbackImage);
    }

    image = storedImage;

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
