import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { api_key, action, params = {} } = body;

    if (!api_key || !action) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing api_key or action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate merchant
    const { data: merchant, error: mErr } = await supabase
      .from('merchants')
      .select('*')
      .eq('api_key', api_key)
      .single();

    if (mErr || !merchant) {
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

    const merchantId = merchant.id;
    let result: any = null;

    // ═══════════════════════════════════════════
    // SETTINGS
    // ═══════════════════════════════════════════
    if (action === 'get_settings') {
      result = {
        cooldown_period_minutes: merchant.cooldown_period_minutes,
        website_url: merchant.website_url,
        store_name: merchant.store_name,
        popup_timer_seconds: merchant.popup_timer_seconds,
        popup_language: merchant.popup_language,
        msg_cooldown: merchant.msg_cooldown,
        msg_blacklist: merchant.msg_blacklist,
        whatsapp_number: merchant.whatsapp_number,
        phone_number: merchant.phone_number,
        show_contact_buttons: merchant.show_contact_buttons,
        enable_abandoned_tracking: merchant.enable_abandoned_tracking,
        enable_incomplete_tracking: merchant.enable_incomplete_tracking,
        current_plan: merchant.current_plan,
        plan_expires_at: merchant.plan_expires_at,
        requests_used: merchant.requests_used,
        max_requests: merchant.max_requests,
        is_active: merchant.is_active,
      };
    }

    else if (action === 'update_settings') {
      const allowedFields = [
        'cooldown_period_minutes', 'popup_timer_seconds', 'popup_language',
        'msg_cooldown', 'msg_blacklist', 'whatsapp_number', 'phone_number',
        'show_contact_buttons', 'enable_abandoned_tracking', 'enable_incomplete_tracking',
        'website_url',
      ];
      const updates: Record<string, any> = { updated_at: new Date().toISOString() };
      for (const key of allowedFields) {
        if (params[key] !== undefined) updates[key] = params[key];
      }

      const { error } = await supabase.from('merchants').update(updates).eq('id', merchantId);
      if (error) throw error;
      result = { updated: true };
    }

    // ═══════════════════════════════════════════
    // INCOMPLETE ORDERS
    // ═══════════════════════════════════════════
    else if (action === 'get_incomplete_orders') {
      const limit = params.limit || 100;
      const filter = params.filter; // 'all' | 'converted' | 'pending'

      let query = supabase
        .from('incomplete_orders')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (filter === 'converted') query = query.eq('is_converted', true);
      else if (filter === 'pending') query = query.eq('is_converted', false);

      const { data, error } = await query;
      if (error) throw error;

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const orders = data || [];

      result = {
        orders: orders.map((o: any) => ({
          id: o.id,
          phone: o.phone_number,
          name: o.customer_name,
          address: o.address,
          ip: o.ip_address,
          device_id: o.device_fingerprint,
          cart_total: o.cart_total,
          cart_items: o.cart_items,
          reason: o.failure_reason,
          is_converted: o.is_converted,
          created_at: o.created_at,
        })),
        stats: {
          total: orders.length,
          converted: orders.filter((o: any) => o.is_converted).length,
          today: orders.filter((o: any) => o.created_at >= todayStart).length,
          potential_revenue: orders
            .filter((o: any) => !o.is_converted)
            .reduce((s: number, o: any) => s + (Number(o.cart_total) || 0), 0),
        },
      };
    }

    else if (action === 'convert_order') {
      if (!params.order_id) throw new Error('order_id required');
      const { error } = await supabase
        .from('incomplete_orders')
        .update({ is_converted: true })
        .eq('id', params.order_id)
        .eq('merchant_id', merchantId);
      if (error) throw error;
      result = { converted: true };
    }

    else if (action === 'delete_incomplete_order') {
      if (!params.order_id) throw new Error('order_id required');
      const { error } = await supabase
        .from('incomplete_orders')
        .delete()
        .eq('id', params.order_id)
        .eq('merchant_id', merchantId);
      if (error) throw error;
      result = { deleted: true };
    }

    else if (action === 'cleanup_incomplete_orders') {
      const { error } = await supabase
        .from('incomplete_orders')
        .delete()
        .eq('merchant_id', merchantId)
        .eq('is_converted', false);
      if (error) throw error;
      result = { cleaned: true };
    }

    // ═══════════════════════════════════════════
    // BLACKLIST
    // ═══════════════════════════════════════════
    else if (action === 'get_blacklist') {
      const { data, error } = await supabase
        .from('blacklist')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      result = { blacklist: data };
    }

    else if (action === 'add_blacklist') {
      if (!params.value || !params.type) throw new Error('value and type required');
      const { data, error } = await supabase
        .from('blacklist')
        .insert({
          merchant_id: merchantId,
          blocked_value: params.value,
          block_type: params.type,
          reason: params.reason || null,
        })
        .select()
        .single();
      if (error) throw error;
      result = { added: true, entry: data };
    }

    else if (action === 'remove_blacklist') {
      if (!params.id) throw new Error('id required');
      const { error } = await supabase
        .from('blacklist')
        .delete()
        .eq('id', params.id)
        .eq('merchant_id', merchantId);
      if (error) throw error;
      result = { removed: true };
    }

    // ═══════════════════════════════════════════
    // FRAUD LOGS
    // ═══════════════════════════════════════════
    else if (action === 'get_fraud_logs') {
      const limit = params.limit || 100;
      const { data, error } = await supabase
        .from('fraud_logs')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;

      const logs = data || [];
      result = {
        logs,
        stats: {
          total: logs.length,
          allowed: logs.filter((l: any) => l.status === 'allowed').length,
          blocked: logs.filter((l: any) => l.status !== 'allowed').length,
        },
      };
    }

    // ═══════════════════════════════════════════
    // ABANDONED CARTS
    // ═══════════════════════════════════════════
    else if (action === 'get_abandoned_carts') {
      const limit = params.limit || 100;
      const { data, error } = await supabase
        .from('abandoned_checkouts')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;

      const carts = data || [];
      result = {
        carts,
        stats: {
          total: carts.length,
          recovered: carts.filter((c: any) => c.is_recovered).length,
          pending: carts.filter((c: any) => !c.is_recovered).length,
        },
      };
    }

    else if (action === 'recover_abandoned') {
      if (!params.id) throw new Error('id required');
      const { error } = await supabase
        .from('abandoned_checkouts')
        .update({ is_recovered: true, recovered_at: new Date().toISOString() })
        .eq('id', params.id)
        .eq('merchant_id', merchantId);
      if (error) throw error;
      result = { recovered: true };
    }

    else if (action === 'delete_abandoned') {
      if (!params.id) throw new Error('id required');
      const { error } = await supabase
        .from('abandoned_checkouts')
        .delete()
        .eq('id', params.id)
        .eq('merchant_id', merchantId);
      if (error) throw error;
      result = { deleted: true };
    }

    // ═══════════════════════════════════════════
    // DASHBOARD SUMMARY
    // ═══════════════════════════════════════════
    else if (action === 'get_dashboard') {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      const [incRes, logRes, blRes, abRes] = await Promise.all([
        supabase.from('incomplete_orders').select('id, is_converted, cart_total, created_at').eq('merchant_id', merchantId),
        supabase.from('fraud_logs').select('id, status, created_at').eq('merchant_id', merchantId).order('created_at', { ascending: false }).limit(100),
        supabase.from('blacklist').select('id').eq('merchant_id', merchantId),
        supabase.from('abandoned_checkouts').select('id, is_recovered').eq('merchant_id', merchantId),
      ]);

      const inc = incRes.data || [];
      const logs = logRes.data || [];
      const bl = blRes.data || [];
      const ab = abRes.data || [];

      result = {
        subscription: {
          plan: merchant.current_plan,
          expires: merchant.plan_expires_at,
          requests_used: merchant.requests_used,
          max_requests: merchant.max_requests,
          is_active: merchant.is_active,
        },
        incomplete_orders: {
          total: inc.length,
          converted: inc.filter((o: any) => o.is_converted).length,
          today: inc.filter((o: any) => o.created_at >= todayStart).length,
          potential_revenue: inc.filter((o: any) => !o.is_converted).reduce((s: number, o: any) => s + (Number(o.cart_total) || 0), 0),
        },
        fraud_logs: {
          total: logs.length,
          allowed: logs.filter((l: any) => l.status === 'allowed').length,
          blocked: logs.filter((l: any) => l.status !== 'allowed').length,
        },
        blacklist_count: bl.length,
        abandoned_carts: {
          total: ab.length,
          recovered: ab.filter((c: any) => c.is_recovered).length,
          pending: ab.filter((c: any) => !c.is_recovered).length,
        },
      };
    }

    else {
      return new Response(
        JSON.stringify({ success: false, error: `Unknown action: ${action}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[manage-store] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
