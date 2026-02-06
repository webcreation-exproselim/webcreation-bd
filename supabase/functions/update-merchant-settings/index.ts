import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { api_key, action, cooldown_minutes } = body;

    console.log('[update-merchant-settings] Request:', { api_key: api_key?.substring(0, 8) + '...', action, cooldown_minutes });

    if (!api_key) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing API key' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate API key and get merchant
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id, is_active, cooldown_period_minutes')
      .eq('api_key', api_key)
      .single();

    if (merchantError || !merchant) {
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

    // Handle different actions
    if (action === 'get_cooldown') {
      return new Response(
        JSON.stringify({
          success: true,
          cooldown_minutes: merchant.cooldown_period_minutes || 1440
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'update_cooldown') {
      const minutes = parseInt(cooldown_minutes);
      if (isNaN(minutes) || minutes < 1 || minutes > 43200) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid cooldown value (1 - 43200 minutes)' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: updateError } = await supabase
        .from('merchants')
        .update({ cooldown_period_minutes: minutes })
        .eq('id', merchant.id);

      if (updateError) {
        console.error('[update-merchant-settings] Update error:', updateError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to update' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[update-merchant-settings] Cooldown updated to', minutes, 'minutes for merchant', merchant.id);

      return new Response(
        JSON.stringify({ success: true, cooldown_minutes: minutes }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert incomplete order to real order
    if (action === 'convert_order') {
      const { order_id, customer_name, customer_phone, customer_email, total_price, notes, services } = body;

      if (!order_id) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing order_id' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify the incomplete order belongs to this merchant
      const { data: incOrder, error: incError } = await supabase
        .from('incomplete_orders')
        .select('*')
        .eq('id', order_id)
        .eq('merchant_id', merchant.id)
        .single();

      if (incError || !incOrder) {
        console.error('[update-merchant-settings] Incomplete order not found:', incError);
        return new Response(
          JSON.stringify({ success: false, error: 'Order not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (incOrder.is_converted) {
        return new Response(
          JSON.stringify({ success: false, error: 'Already converted' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Build services from cart items or use provided
      const orderServices = services && services.length > 0 
        ? services 
        : (incOrder.cart_items && Array.isArray(incOrder.cart_items) && incOrder.cart_items.length > 0)
          ? (incOrder.cart_items as any[]).map((item: any) => ({ name: item.name, price: item.price, quantity: item.quantity }))
          : [{ name: 'Converted from incomplete order', price: total_price || incOrder.cart_total || 0, quantity: 1 }];

      const finalName = customer_name || incOrder.customer_name || 'Unknown Customer';
      const finalPhone = customer_phone || incOrder.phone_number;
      const finalTotal = total_price || incOrder.cart_total || 0;

      // Create real order
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: finalName,
          customer_phone: finalPhone,
          customer_email: customer_email || null,
          payment_method: 'manual',
          services: orderServices,
          total_price: finalTotal,
          total_savings: 0,
          status: 'pending',
          notes: notes || `Converted from incomplete order #${order_id.substring(0, 8)}`,
        });

      if (orderError) {
        console.error('[update-merchant-settings] Order creation error:', orderError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create order: ' + orderError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Mark incomplete order as converted
      const { error: updateErr } = await supabase
        .from('incomplete_orders')
        .update({ is_converted: true })
        .eq('id', order_id);

      if (updateErr) {
        console.error('[update-merchant-settings] Mark converted error:', updateErr);
      }

      console.log('[update-merchant-settings] Order converted successfully:', order_id);

      return new Response(
        JSON.stringify({ success: true, message: 'Order converted successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[update-merchant-settings] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
