import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IncompleteOrder {
  id: string;
  phone_number: string;
  customer_name: string | null;
  ip_address: string | null;
  device_fingerprint: string | null;
  cart_total: number | null;
  cart_items: any[] | null;
  failure_reason: string;
  is_suspicious: boolean;
  is_converted: boolean;
  created_at: string;
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

    const body = await req.json();
    const { api_key, limit = 100 } = body;

    console.log('[get-incomplete-orders] Request:', { api_key: api_key?.substring(0, 8) + '...', limit });

    // Validate required fields
    if (!api_key) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing API key' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate API key and get merchant
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id, is_active')
      .eq('api_key', api_key)
      .single();

    if (merchantError || !merchant) {
      console.error('[get-incomplete-orders] Invalid API key:', merchantError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if merchant subscription is active
    if (!merchant.is_active) {
      console.log('[get-incomplete-orders] Merchant subscription inactive');
      return new Response(
        JSON.stringify({ success: false, error: 'Subscription inactive' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch incomplete orders
    const { data: orders, error: ordersError } = await supabase
      .from('incomplete_orders')
      .select('*')
      .eq('merchant_id', merchant.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (ordersError) {
      console.error('[get-incomplete-orders] Database error:', ordersError);
      return new Response(
        JSON.stringify({ success: false, error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate stats
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    
    const total = orders?.length || 0;
    const suspicious = orders?.filter(o => o.is_suspicious).length || 0;
    const converted = orders?.filter(o => o.is_converted).length || 0;
    const today = orders?.filter(o => o.created_at >= todayStart).length || 0;

    // Format orders for response
    const formattedOrders = (orders || []).map((order: IncompleteOrder) => {
      // Calculate time ago
      const createdAt = new Date(order.created_at);
      const diffMs = now.getTime() - createdAt.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      let timeAgo = '';
      if (diffDays > 0) {
        timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffMins > 0) {
        timeAgo = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      } else {
        timeAgo = 'Just now';
      }

      return {
        id: order.id,
        phone: order.phone_number,
        name: order.customer_name || '',
        ip: order.ip_address || '',
        device_id: order.device_fingerprint || '',
        cart_total: order.cart_total || 0,
        cart_items: order.cart_items || [],
        reason: order.failure_reason,
        is_suspicious: order.is_suspicious,
        is_converted: order.is_converted,
        attempts: 1, // Could be calculated from counts
        time_ago: timeAgo,
        created_at: order.created_at
      };
    });

    console.log('[get-incomplete-orders] Success:', { total, suspicious, converted, today });

    return new Response(
      JSON.stringify({
        success: true,
        orders: formattedOrders,
        stats: {
          total,
          suspicious,
          converted,
          today
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[get-incomplete-orders] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
