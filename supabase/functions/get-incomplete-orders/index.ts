import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
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

    if (!api_key) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing API key' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    if (!merchant.is_active) {
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

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    
    const allOrders = orders || [];
    const total = allOrders.length;
    const converted = allOrders.filter((o: any) => o.is_converted).length;
    const today = allOrders.filter((o: any) => o.created_at >= todayStart).length;
    const potentialRevenue = allOrders
      .filter((o: any) => !o.is_converted)
      .reduce((sum: number, o: any) => sum + (Number(o.cart_total) || 0), 0);

    // Generate daily aggregation for charts (last 30 days)
    const dailyData: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyData[key] = 0;
    }

    allOrders.forEach((o: any) => {
      const dateKey = o.created_at.split('T')[0];
      if (dailyData[dateKey] !== undefined) {
        dailyData[dateKey]++;
      }
    });

    const chartData = Object.entries(dailyData).map(([date, count]) => ({ date, count }));

    // Format orders for response
    const formattedOrders = allOrders.map((order: any) => {
      const createdAt = new Date(order.created_at);
      const diffMs = now.getTime() - createdAt.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      let timeAgo = '';
      if (diffDays > 0) timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      else if (diffHours > 0) timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      else if (diffMins > 0) timeAgo = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      else timeAgo = 'Just now';

      return {
        id: order.id,
        phone: order.phone_number,
        name: order.customer_name || '',
        address: order.address || '',
        ip: order.ip_address || '',
        device_id: order.device_fingerprint || '',
        cart_total: order.cart_total || 0,
        cart_items: order.cart_items || [],
        reason: order.failure_reason,
        is_converted: order.is_converted,
        time_ago: timeAgo,
        created_at: order.created_at,
      };
    });

    console.log('[get-incomplete-orders] Success:', { total, converted, today, potentialRevenue });

    return new Response(
      JSON.stringify({
        success: true,
        orders: formattedOrders,
        stats: { total, converted, today, potentialRevenue },
        chartData,
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
