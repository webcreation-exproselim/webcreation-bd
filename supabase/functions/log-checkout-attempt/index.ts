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
    const { api_key, action = 'update', phone, name, address, ip, device_id, cart_total, cart_items, retention_days } = body;

    console.log('[log-checkout-attempt] Request:', { api_key: api_key?.substring(0, 8) + '...', action, phone });

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
      console.error('[log-checkout-attempt] Invalid API key:', merchantError);
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

    // === ACTION: UPDATE (upsert incomplete order) ===
    if (action === 'update') {
      if (!phone) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing phone number' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate BD phone format server-side
      const normalizedPhone = phone.replace(/[\s\-\+]/g, '').replace(/^880/, '0').replace(/^0088/, '0');
      if (!/^01[0-9]{9}$/.test(normalizedPhone)) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid BD phone format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if record already exists for this phone + merchant (upsert logic)
      const { data: existing } = await supabase
        .from('incomplete_orders')
        .select('id')
        .eq('merchant_id', merchant.id)
        .eq('phone_number', normalizedPhone)
        .eq('is_converted', false)
        .order('created_at', { ascending: false })
        .limit(1);

      if (existing && existing.length > 0) {
        // Update existing record with latest data
        const updateData: Record<string, unknown> = {
          customer_name: name || null,
          address: address || null,
          failure_reason: 'checkout_tracking',
        };
        if (cart_total) updateData.cart_total = cart_total;
        if (cart_items) updateData.cart_items = cart_items;
        if (ip) updateData.ip_address = ip;
        if (device_id) updateData.device_fingerprint = device_id;

        const { error: updateError } = await supabase
          .from('incomplete_orders')
          .update(updateData)
          .eq('id', existing[0].id);

        if (updateError) {
          console.error('[log-checkout-attempt] Update error:', updateError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to update record' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('[log-checkout-attempt] Updated existing record:', existing[0].id);
        return new Response(
          JSON.stringify({ success: true, action: 'updated', id: existing[0].id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Insert new record
        const { data: newRecord, error: insertError } = await supabase
          .from('incomplete_orders')
          .insert({
            merchant_id: merchant.id,
            phone_number: normalizedPhone,
            customer_name: name || null,
            address: address || null,
            ip_address: ip || null,
            device_fingerprint: device_id || null,
            cart_total: cart_total || null,
            cart_items: cart_items || null,
            failure_reason: 'checkout_tracking',
            is_suspicious: false,
            is_converted: false,
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('[log-checkout-attempt] Insert error:', insertError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to create record' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('[log-checkout-attempt] Created new record:', newRecord?.id);
        return new Response(
          JSON.stringify({ success: true, action: 'created', id: newRecord?.id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // === ACTION: COMPLETED (auto-cleanup on Thank You page) ===
    if (action === 'completed') {
      if (!phone) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing phone number' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const normalizedPhone = phone.replace(/[\s\-\+]/g, '').replace(/^880/, '0').replace(/^0088/, '0');

      // Delete the incomplete record for this phone + merchant
      const { data: deleted, error: deleteError } = await supabase
        .from('incomplete_orders')
        .delete()
        .eq('merchant_id', merchant.id)
        .eq('phone_number', normalizedPhone)
        .eq('is_converted', false)
        .select('id');

      if (deleteError) {
        console.error('[log-checkout-attempt] Delete error:', deleteError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to cleanup record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[log-checkout-attempt] Cleaned up records:', deleted?.length || 0);
      return new Response(
        JSON.stringify({ success: true, action: 'completed', cleaned: deleted?.length || 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // === ACTION: CLEANUP (retention policy - delete old records) ===
    if (action === 'cleanup') {
      const days = retention_days || 30;
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      const { data: deleted, error: cleanupError } = await supabase
        .from('incomplete_orders')
        .delete()
        .eq('merchant_id', merchant.id)
        .eq('is_converted', false)
        .lt('created_at', cutoffDate)
        .select('id');

      if (cleanupError) {
        console.error('[log-checkout-attempt] Cleanup error:', cleanupError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to cleanup old records' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[log-checkout-attempt] Cleanup removed records:', deleted?.length || 0);
      return new Response(
        JSON.stringify({ success: true, action: 'cleanup', removed: deleted?.length || 0, retention_days: days }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action. Use: update, completed, cleanup' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[log-checkout-attempt] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
