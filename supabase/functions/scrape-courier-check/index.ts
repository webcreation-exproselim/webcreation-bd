import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone, api_key } = await req.json();

    if (!phone || !api_key) {
      console.log('[scrape-courier-check] Missing phone or api_key');
      return new Response(
        JSON.stringify({ success: false, error: 'Phone number and API key are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate BD phone number - handle +880, 880 prefixes
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    
    // Strip country code: 8801XXXXXXXXX -> 01XXXXXXXXX
    if (cleanPhone.startsWith('880') && cleanPhone.length === 13) {
      cleanPhone = '0' + cleanPhone.substring(3);
    }
    // Handle case where just 1XXXXXXXXX (10 digits, no leading 0)
    if (cleanPhone.startsWith('1') && cleanPhone.length === 10) {
      cleanPhone = '0' + cleanPhone;
    }
    
    if (!/^01[0-9]{9}$/.test(cleanPhone)) {
      console.log('[scrape-courier-check] Invalid phone format:', cleanPhone);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid Bangladesh phone number format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate API key against courier_check_subscriptions
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: subscription, error: subError } = await supabase
      .from('courier_check_subscriptions')
      .select('*')
      .eq('api_key', api_key)
      .single();

    if (subError || !subscription) {
      console.log('[scrape-courier-check] Invalid API key:', api_key);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!subscription.is_active) {
      console.log('[scrape-courier-check] Subscription not active for:', api_key);
      return new Response(
        JSON.stringify({ success: false, error: 'Subscription is not active' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check expiration
    if (subscription.plan_expires_at && new Date(subscription.plan_expires_at) < new Date()) {
      console.log('[scrape-courier-check] Subscription expired');
      return new Response(
        JSON.stringify({ success: false, error: 'Subscription has expired' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check request limits
    if (subscription.requests_used >= subscription.max_requests) {
      console.log('[scrape-courier-check] Request limit reached');
      return new Response(
        JSON.stringify({ success: false, error: 'Request limit reached' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[scrape-courier-check] Querying BD Courier API for phone:', cleanPhone);

    const bdcKey = Deno.env.get('BDCOURIER_API_KEY');
    if (!bdcKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Courier data provider is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiRes = await fetch('https://api.bdcourier.com/courier-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bdcKey}`,
      },
      body: JSON.stringify({ phone: cleanPhone }),
    });

    if (!apiRes.ok) {
      const errBody = await apiRes.text();
      console.error('[scrape-courier-check] Provider error', apiRes.status, errBody.slice(0, 500));
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch courier data. Please try again.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiJson = await apiRes.json();
    const result = mapBdCourier(apiJson, cleanPhone);


    // Increment requests_used
    await supabase
      .from('courier_check_subscriptions')
      .update({
        requests_used: subscription.requests_used + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    console.log('[scrape-courier-check] Success for phone:', cleanPhone, 'Result:', JSON.stringify(result));

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[scrape-courier-check] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function mapBdCourier(payload: any, phone: string) {
  const data = payload?.data || {};
  const couriers: { name: string; logo: string; orders: number; delivered: number; returned: number; rate: number }[] = [];

  for (const [key, val] of Object.entries<any>(data)) {
    if (key === 'summary' || !val || typeof val !== 'object') continue;
    couriers.push({
      name: val.name || key,
      logo: val.logo || '',
      orders: Number(val.total_parcel) || 0,
      delivered: Number(val.success_parcel) || 0,
      returned: Number(val.cancelled_parcel) || 0,
      rate: Number(val.success_ratio) || 0,
    });
  }

  const summary = data.summary || {};
  const totalOrders = Number(summary.total_parcel) || couriers.reduce((a, c) => a + c.orders, 0);
  const totalDelivered = Number(summary.success_parcel) || couriers.reduce((a, c) => a + c.delivered, 0);
  const totalReturned = Number(summary.cancelled_parcel) || couriers.reduce((a, c) => a + c.returned, 0);
  const successRate = summary.success_ratio !== undefined
    ? Math.round(Number(summary.success_ratio))
    : (totalOrders > 0 ? Math.round((totalDelivered / totalOrders) * 100) : 0);

  const verdict = payload?.risk_verdict || {};
  let riskLabel = 'new_customer';
  if (totalOrders > 0) {
    const level = String(verdict.level || '').toLowerCase();
    if (level === 'safe' || successRate >= 80) riskLabel = 'trusted';
    else if (level === 'review' || successRate >= 50) riskLabel = 'moderate';
    else riskLabel = 'risky';
  }

  return {
    phone,
    success_rate: successRate,
    total_orders: totalOrders,
    total_delivered: totalDelivered,
    total_returned: totalReturned,
    risk_label: riskLabel,
    risk_message: Array.isArray(verdict.reasons) ? verdict.reasons.join(' ') : (verdict.action || ''),
    couriers,
  };
}
