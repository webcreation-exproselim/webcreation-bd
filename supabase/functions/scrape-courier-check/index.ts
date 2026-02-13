import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const FRAUDSHIELD_BASE = 'https://fraudshield.bd';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone, api_key } = await req.json();

    if (!phone || !api_key) {
      return new Response(
        JSON.stringify({ success: false, error: 'Phone number and API key are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize BD phone number
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('880') && cleanPhone.length === 13) {
      cleanPhone = '0' + cleanPhone.substring(3);
    }
    if (cleanPhone.startsWith('1') && cleanPhone.length === 10) {
      cleanPhone = '0' + cleanPhone;
    }
    if (!/^01[0-9]{9}$/.test(cleanPhone)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid Bangladesh phone number format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate API key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: subscription, error: subError } = await supabase
      .from('courier_check_subscriptions')
      .select('*')
      .eq('api_key', api_key)
      .single();

    if (subError || !subscription) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!subscription.is_active) {
      return new Response(
        JSON.stringify({ success: false, error: 'Subscription is not active' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (subscription.plan_expires_at && new Date(subscription.plan_expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ success: false, error: 'Subscription has expired' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (subscription.requests_used >= subscription.max_requests) {
      return new Response(
        JSON.stringify({ success: false, error: 'Request limit reached' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[scrape] Scraping FraudShield for phone:', cleanPhone);

    // Step 1: GET the homepage to obtain CSRF token and session cookies
    const getResponse = await fetch(FRAUDSHIELD_BASE + '/', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!getResponse.ok) {
      console.error('[scrape] GET failed:', getResponse.status);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to access courier check service' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pageHtml = await getResponse.text();
    const cookieString = extractCookies(getResponse);

    // Extract CSRF token from Inertia data-page JSON
    let csrfToken = '';
    const dataPageMatch = pageHtml.match(/data-page="([^"]+)"/i);
    if (dataPageMatch) {
      try {
        const decoded = dataPageMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
        const pageData = JSON.parse(decoded);
        csrfToken = pageData.props?.csrfToken || '';
      } catch (_e) { /* ignore */ }
    }
    // Fallback to meta tag
    if (!csrfToken) {
      const metaMatch = pageHtml.match(/<meta\s+name=["']csrf-token["']\s+content=["']([^"']+)["']/i);
      if (metaMatch) csrfToken = metaMatch[1];
    }

    console.log('[scrape] CSRF:', csrfToken ? 'found' : 'not found');
    console.log('[scrape] Cookies:', cookieString ? 'yes' : 'no');

    // Step 2: Try multiple search approaches for the Inertia.js app
    let resultData: any = null;

    // Approach 1: Inertia.js POST request (most likely for this Laravel+Inertia app)
    const inertiaEndpoints = ['/search', '/guest/search', '/customer/check', '/api/search', '/api/customer/check', '/check'];
    for (const endpoint of inertiaEndpoints) {
      if (resultData) break;
      resultData = await tryInertiaPost(endpoint, cleanPhone, cookieString, csrfToken);
    }

    // Approach 2: Standard JSON API POST
    if (!resultData) {
      for (const endpoint of ['/api/search', '/api/check', '/api/customer/check', '/api/guest/search']) {
        if (resultData) break;
        resultData = await tryJsonApiPost(endpoint, cleanPhone, cookieString, csrfToken);
      }
    }

    // Approach 3: Standard form POST
    if (!resultData) {
      for (const endpoint of ['/search', '/', '/check']) {
        if (resultData) break;
        resultData = await tryFormPost(endpoint, cleanPhone, cookieString, csrfToken);
      }
    }

    if (!resultData) {
      console.error('[scrape] All search methods failed');
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch courier data. Please try again.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Increment requests_used
    await supabase
      .from('courier_check_subscriptions')
      .update({
        requests_used: subscription.requests_used + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    console.log('[scrape] Success:', JSON.stringify(resultData));

    return new Response(
      JSON.stringify({ success: true, data: resultData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[scrape] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ─── Helper Functions ────────────────────────────────────────

function extractCookies(response: Response): string {
  const setCookieHeaders = response.headers.getSetCookie ? response.headers.getSetCookie() : [];
  if (setCookieHeaders.length > 0) {
    return setCookieHeaders.map(c => c.split(';')[0]).join('; ');
  }
  const rawCookie = response.headers.get('set-cookie');
  if (rawCookie) {
    const parts = rawCookie.split(/,(?=\s*[a-zA-Z_]+=)/);
    return parts.map(c => c.split(';')[0].trim()).join('; ');
  }
  return '';
}

async function tryInertiaPost(endpoint: string, phone: string, cookies: string, csrfToken: string) {
  try {
    const url = FRAUDSHIELD_BASE + endpoint;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html, application/xhtml+xml',
      'X-Inertia': 'true',
      'X-Inertia-Version': '',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': FRAUDSHIELD_BASE + '/',
      'Origin': FRAUDSHIELD_BASE,
    };
    if (csrfToken) headers['X-CSRF-TOKEN'] = csrfToken;
    if (cookies) headers['Cookie'] = cookies;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ phone }),
    });

    console.log('[scrape] Inertia POST', endpoint, 'status:', response.status);
    const text = await response.text();

    if (response.ok && text.length > 50) {
      return parseResponse(text, phone);
    }
    if (response.status === 302 || response.status === 303) {
      // Follow redirect for Inertia
      const location = response.headers.get('location');
      if (location) {
        console.log('[scrape] Following redirect to:', location);
      }
    }
  } catch (e) {
    console.log('[scrape] Inertia', endpoint, 'error:', e);
  }
  return null;
}

async function tryJsonApiPost(endpoint: string, phone: string, cookies: string, csrfToken: string) {
  try {
    const url = FRAUDSHIELD_BASE + endpoint;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': FRAUDSHIELD_BASE + '/',
      'Origin': FRAUDSHIELD_BASE,
    };
    if (csrfToken) headers['X-CSRF-TOKEN'] = csrfToken;
    if (cookies) headers['Cookie'] = cookies;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ phone }),
    });

    console.log('[scrape] JSON API', endpoint, 'status:', response.status);
    const text = await response.text();

    if (response.ok && text.length > 10) {
      return parseResponse(text, phone);
    }
  } catch (e) {
    console.log('[scrape] JSON API', endpoint, 'error:', e);
  }
  return null;
}

async function tryFormPost(endpoint: string, phone: string, cookies: string, csrfToken: string) {
  try {
    const url = FRAUDSHIELD_BASE + endpoint;
    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Referer': FRAUDSHIELD_BASE + '/',
      'Origin': FRAUDSHIELD_BASE,
    };
    if (cookies) headers['Cookie'] = cookies;

    let body = `phone=${encodeURIComponent(phone)}`;
    if (csrfToken) body = `_token=${encodeURIComponent(csrfToken)}&${body}`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
      redirect: 'follow',
    });

    console.log('[scrape] Form POST', endpoint, 'status:', response.status);
    const text = await response.text();

    if (response.ok && text.length > 50) {
      return parseResponse(text, phone);
    }
  } catch (e) {
    console.log('[scrape] Form POST', endpoint, 'error:', e);
  }
  return null;
}

function parseResponse(text: string, phone: string) {
  // Try JSON first
  try {
    const json = JSON.parse(text);

    // Inertia.js response format: { component: "...", props: { ... } }
    if (json.component && json.props) {
      console.log('[scrape] Got Inertia response, component:', json.component);
      return parseInertiaProps(json.props, phone);
    }

    // Direct API JSON response
    if (json.data || json.results || json.couriers || json.customer) {
      return parseJsonResponse(json, phone);
    }

    // If we got JSON but no recognizable structure, log it
    console.log('[scrape] Unknown JSON structure, keys:', Object.keys(json));
    return null;
  } catch (_e) {
    // Not JSON — parse as HTML
  }

  // HTML parsing
  return parseHtml(text, phone);
}

function parseInertiaProps(props: any, phone: string) {
  // Look for search results in props
  const data = props.results || props.searchResults || props.customer || props.data || props;

  if (data.couriers || data.courier_history) {
    const courierData = data.couriers || data.courier_history || [];
    return buildResult(phone, courierData, data);
  }

  // Try extracting from nested structure
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (val && typeof val === 'object' && (val.couriers || val.total_orders || val.success_rate !== undefined)) {
      return buildResult(phone, val.couriers || val.courier_history || [], val);
    }
  }

  console.log('[scrape] Could not extract data from Inertia props, keys:', Object.keys(data));
  return null;
}

function parseJsonResponse(json: any, phone: string) {
  const data = json.data || json.results || json;
  const courierData = data.couriers || data.courier_history || [];
  return buildResult(phone, courierData, data);
}

function buildResult(phone: string, courierRaw: any[], data: any) {
  const couriers: { name: string; orders: number; delivered: number; returned: number; rate: number }[] = [];
  let totalOrders = 0;
  let totalDelivered = 0;
  let totalReturned = 0;

  if (Array.isArray(courierRaw)) {
    for (const c of courierRaw) {
      const name = normalizeCourierName(c.name || c.courier || c.courier_name || '');
      const orders = parseInt(c.orders || c.total || c.total_parcels || c.count || 0, 10);
      const delivered = parseInt(c.delivered || c.successful || c.successful_deliveries || c.success || 0, 10);
      const returned = parseInt(c.returned || c.failed || c.return || c.cancelled || 0, 10) || (orders - delivered);
      const rate = orders > 0 ? Math.round((delivered / orders) * 1000) / 10 : 0;

      if (name) {
        couriers.push({ name, orders, delivered, returned, rate });
        totalOrders += orders;
        totalDelivered += delivered;
        totalReturned += returned;
      }
    }
  }

  // Use provided totals if available
  if (data.total_orders) totalOrders = parseInt(data.total_orders, 10) || totalOrders;
  if (data.total_delivered) totalDelivered = parseInt(data.total_delivered, 10) || totalDelivered;
  if (data.total_returned) totalReturned = parseInt(data.total_returned, 10) || totalReturned;

  const successRate = data.success_rate !== undefined
    ? Math.round(parseFloat(data.success_rate))
    : (totalOrders > 0 ? Math.round((totalDelivered / totalOrders) * 100) : 0);

  let riskLabel = data.risk_label || data.risk || 'new_customer';
  if (riskLabel === 'new_customer' && totalOrders > 0) {
    if (successRate >= 80) riskLabel = 'trusted';
    else if (successRate >= 50) riskLabel = 'moderate';
    else riskLabel = 'risky';
  }

  return {
    phone,
    success_rate: successRate,
    total_orders: totalOrders,
    total_delivered: totalDelivered,
    total_returned: totalReturned,
    risk_label: riskLabel,
    risk_message: data.risk_message || '',
    couriers,
  };
}

function parseHtml(html: string, phone: string) {
  // Check for Inertia data-page in HTML
  const dataPageMatch = html.match(/data-page="([^"]+)"/i);
  if (dataPageMatch) {
    try {
      const decoded = dataPageMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
      const pageData = JSON.parse(decoded);
      if (pageData.props) {
        const result = parseInertiaProps(pageData.props, phone);
        if (result && result.total_orders > 0) return result;
      }
    } catch (_e) { /* ignore */ }
  }

  // Standard HTML table parsing
  const couriers: { name: string; orders: number; delivered: number; returned: number; rate: number }[] = [];
  let totalOrders = 0;
  let totalDelivered = 0;
  let totalReturned = 0;

  const tables = html.match(/<table[^>]*>([\s\S]*?)<\/table>/gi);
  if (tables) {
    for (const table of tables) {
      const rows = table.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
      if (rows) {
        for (const row of rows) {
          if (row.includes('<th')) continue;
          const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
          if (cells && cells.length >= 3) {
            const values = cells.map(c => c.replace(/<[^>]*>/g, '').trim());
            const name = normalizeCourierName(values[0]);
            if (name) {
              const orders = parseInt(values[1], 10) || 0;
              const delivered = parseInt(values[2], 10) || 0;
              const returned = cells.length >= 4 ? (parseInt(values[3], 10) || 0) : (orders - delivered);
              const rate = orders > 0 ? Math.round((delivered / orders) * 1000) / 10 : 0;
              couriers.push({ name, orders, delivered, returned, rate });
              totalOrders += orders;
              totalDelivered += delivered;
              totalReturned += returned;
            }
          }
        }
      }
    }
  }

  if (totalOrders === 0) return null;

  const successRate = totalOrders > 0 ? Math.round((totalDelivered / totalOrders) * 100) : 0;
  let riskLabel = 'new_customer';
  if (totalOrders > 0) {
    if (successRate >= 80) riskLabel = 'trusted';
    else if (successRate >= 50) riskLabel = 'moderate';
    else riskLabel = 'risky';
  }

  return { phone, success_rate: successRate, total_orders: totalOrders, total_delivered: totalDelivered, total_returned: totalReturned, risk_label: riskLabel, risk_message: '', couriers };
}

function normalizeCourierName(raw: string): string {
  const lower = (raw || '').toLowerCase().trim();
  if (lower.includes('steadfast')) return 'Steadfast';
  if (lower.includes('pathao')) return 'Pathao';
  if (lower.includes('redx') || lower.includes('red x')) return 'RedX';
  if (lower.includes('carrybee') || lower.includes('carry bee')) return 'CarryBee';
  if (lower.length > 0 && lower.length < 30) return raw.trim();
  return '';
}
