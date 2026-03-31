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
        // Try multiple User-Agent / header combos since FB CDN is picky
        const attempts = [
          {
            'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
          },
          {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          },
          {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.facebook.com/',
          },
        ];

        let imgRes: Response | null = null;
        for (const hdrs of attempts) {
          const res = await fetch(imageUrl, { headers: hdrs, redirect: 'follow' });
          const ct = res.headers.get('content-type') || '';
          if (res.ok && ct.startsWith('image/')) {
            imgRes = res;
            break;
          }
          // consume body so connection is released
          await res.arrayBuffer();
          console.log('Attempt failed:', res.status, ct);
        }

        if (!imgRes) {
          console.error('All image download attempts failed for:', imageUrl);
          return null;
        }

        const ct = imgRes.headers.get('content-type') || 'image/jpeg';
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

    image = await uploadRemoteImage(image);

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
