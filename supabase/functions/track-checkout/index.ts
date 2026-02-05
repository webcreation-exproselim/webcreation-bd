import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface TrackRequest {
  api_key: string
  action: 'started' | 'completed'
  phone: string
  name?: string
  email?: string
  device_id?: string
  ip?: string
  cart_data?: object
  checkout_url?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const body: TrackRequest = await req.json()
    const { api_key, action, phone, name, email, device_id, ip, cart_data, checkout_url } = body

    console.log('Track checkout request:', { api_key: api_key?.slice(0, 8) + '...', action, phone })

    // Validate required fields
    if (!api_key) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!action || !['started', 'completed'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Must be "started" or "completed"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!phone) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate API Key and get merchant data
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id, is_active, enable_abandoned_tracking')
      .eq('api_key', api_key)
      .single()

    if (merchantError || !merchant) {
      console.log('Invalid API key:', api_key)
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if tracking is enabled
    if (!merchant.enable_abandoned_tracking) {
      console.log('Abandoned tracking disabled for merchant:', merchant.id)
      return new Response(
        JSON.stringify({ success: true, message: 'Tracking disabled' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'started') {
      // Check if there's already an unrecovered checkout for this phone
      const { data: existing } = await supabase
        .from('abandoned_checkouts')
        .select('id')
        .eq('merchant_id', merchant.id)
        .eq('customer_phone', phone)
        .eq('is_recovered', false)
        .limit(1)

      if (existing && existing.length > 0) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('abandoned_checkouts')
          .update({
            customer_name: name || null,
            customer_email: email || null,
            device_fingerprint: device_id || null,
            ip_address: ip || null,
            cart_data: cart_data || null,
            checkout_url: checkout_url || null,
            created_at: new Date().toISOString()
          })
          .eq('id', existing[0].id)

        if (updateError) {
          console.error('Failed to update abandoned checkout:', updateError)
        }

        console.log('Updated existing abandoned checkout:', existing[0].id)
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('abandoned_checkouts')
          .insert({
            merchant_id: merchant.id,
            customer_phone: phone,
            customer_name: name || null,
            customer_email: email || null,
            device_fingerprint: device_id || null,
            ip_address: ip || null,
            cart_data: cart_data || null,
            checkout_url: checkout_url || null
          })

        if (insertError) {
          console.error('Failed to insert abandoned checkout:', insertError)
          return new Response(
            JSON.stringify({ error: 'Failed to track checkout' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('Created new abandoned checkout for merchant:', merchant.id)
      }

      return new Response(
        JSON.stringify({ success: true, action: 'checkout_started' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (action === 'completed') {
      // Mark checkout as recovered
      const { data: updated, error: updateError } = await supabase
        .from('abandoned_checkouts')
        .update({
          is_recovered: true,
          recovered_at: new Date().toISOString()
        })
        .eq('merchant_id', merchant.id)
        .eq('customer_phone', phone)
        .eq('is_recovered', false)
        .select('id')

      if (updateError) {
        console.error('Failed to mark checkout as recovered:', updateError)
      }

      console.log('Marked checkout as recovered:', updated?.length || 0, 'records')

      return new Response(
        JSON.stringify({ success: true, action: 'checkout_completed', recovered: updated?.length || 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
