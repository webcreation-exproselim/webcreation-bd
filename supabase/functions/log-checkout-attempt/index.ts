import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutAttemptRequest {
  api_key: string;
  phone: string;
  name?: string;
  ip?: string;
  device_id?: string;
  cart_total?: number;
  cart_items?: { name: string; price: number; quantity: number; product_id?: number }[];
  reason: 'phone_blur' | 'validation_error' | 'page_exit' | 'payment_failed';
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: CheckoutAttemptRequest = await req.json();
    const { api_key, phone, name, ip, device_id, cart_total, cart_items, reason } = body;

    console.log('[log-checkout-attempt] Request:', { api_key: api_key?.substring(0, 8) + '...', phone, reason });

    // Validate required fields
    if (!api_key || !phone || !reason) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: api_key, phone, reason' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate API key and get merchant
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id, is_active, incomplete_auto_block_threshold, incomplete_time_window_minutes')
      .eq('api_key', api_key)
      .single();

    if (merchantError || !merchant) {
      console.error('[log-checkout-attempt] Invalid API key:', merchantError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if merchant subscription is active
    if (!merchant.is_active) {
      console.log('[log-checkout-attempt] Merchant subscription inactive');
      return new Response(
        JSON.stringify({ success: false, error: 'Subscription inactive' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize phone number (remove spaces, +880, etc.)
    const normalizedPhone = phone.replace(/[\s\-\+]/g, '').replace(/^880/, '0').replace(/^0088/, '0');

    // Get thresholds from merchant settings or use defaults
    const blockThreshold = merchant.incomplete_auto_block_threshold || 5;
    const timeWindowMinutes = merchant.incomplete_time_window_minutes || 60;
    const oneHourAgo = new Date(Date.now() - timeWindowMinutes * 60 * 1000).toISOString();

    // Count recent attempts from same phone, IP, and device
    const [phoneAttempts, ipAttempts, deviceAttempts] = await Promise.all([
      // Phone attempts
      supabase
        .from('incomplete_orders')
        .select('id', { count: 'exact', head: true })
        .eq('merchant_id', merchant.id)
        .eq('phone_number', normalizedPhone)
        .gte('created_at', oneHourAgo),
      
      // IP attempts (only if IP provided)
      ip ? supabase
        .from('incomplete_orders')
        .select('id', { count: 'exact', head: true })
        .eq('merchant_id', merchant.id)
        .eq('ip_address', ip)
        .gte('created_at', oneHourAgo) : Promise.resolve({ count: 0 }),
      
      // Device attempts (only if device_id provided)
      device_id ? supabase
        .from('incomplete_orders')
        .select('id', { count: 'exact', head: true })
        .eq('merchant_id', merchant.id)
        .eq('device_fingerprint', device_id)
        .gte('created_at', oneHourAgo) : Promise.resolve({ count: 0 })
    ]);

    const phoneCount = phoneAttempts.count || 0;
    const ipCount = (ipAttempts as any).count || 0;
    const deviceCount = (deviceAttempts as any).count || 0;
    const maxAttempts = Math.max(phoneCount, ipCount, deviceCount);

    console.log('[log-checkout-attempt] Attempt counts:', { phoneCount, ipCount, deviceCount, maxAttempts });

    // Determine risk level based on attempt counts
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let isSuspicious = false;

    if (maxAttempts >= blockThreshold) {
      riskLevel = 'high';
      isSuspicious = true;
    } else if (maxAttempts >= Math.floor(blockThreshold * 0.6)) {
      riskLevel = 'medium';
    }

    // Insert the incomplete order record
    const { error: insertError } = await supabase
      .from('incomplete_orders')
      .insert({
        merchant_id: merchant.id,
        phone_number: normalizedPhone,
        customer_name: name || null,
        ip_address: ip || null,
        device_fingerprint: device_id || null,
        cart_total: cart_total || null,
        cart_items: cart_items || null,
        failure_reason: reason,
        is_suspicious: isSuspicious,
        is_converted: false
      });

    if (insertError) {
      console.error('[log-checkout-attempt] Insert error:', insertError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to log attempt' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[log-checkout-attempt] Success:', { riskLevel, isSuspicious, attempts: maxAttempts + 1 });

    return new Response(
      JSON.stringify({
        success: true,
        risk_level: riskLevel,
        attempts_count: maxAttempts + 1,
        is_suspicious: isSuspicious,
        message: isSuspicious 
          ? 'Multiple failed attempts detected - marked as suspicious'
          : 'Attempt logged successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[log-checkout-attempt] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
