import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Block SSRF to internal/private/loopback/metadata addresses.
function isBlockedHostname(host: string): boolean {
  const h = host.toLowerCase();
  if (!h) return true;
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.internal') || h.endsWith('.local')) return true;
  // IPv6 loopback / link-local / unique-local
  if (h === '::1' || h === '[::1]' || h.startsWith('fe80') || h.startsWith('fc') || h.startsWith('fd')) return true;
  // IPv4 numeric checks
  const ipv4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = [parseInt(ipv4[1], 10), parseInt(ipv4[2], 10)];
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true; // link-local / cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a >= 224) return true; // multicast / reserved
  }
  return false;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require an authenticated user (any signed-in user) to use this scraper.
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'URL required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate URL: must be http(s) and must not target internal/private hosts.
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid URL' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return new Response(JSON.stringify({ error: 'Only http(s) URLs allowed' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (isBlockedHostname(parsed.hostname)) {
      return new Response(JSON.stringify({ error: 'Target host not allowed' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
      // SSRF guard: only allow http(s) and reject internal hosts.
      try {
        const ip = new URL(imageUrl);
        if (ip.protocol !== 'http:' && ip.protocol !== 'https:') return null;
        if (isBlockedHostname(ip.hostname)) return null;
      } catch {
        return null;
      }

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
