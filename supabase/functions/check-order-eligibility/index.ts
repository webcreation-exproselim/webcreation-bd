import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CheckRequest {
  api_key: string
  phone?: string
  ip?: string
  device_id?: string
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
    const body: CheckRequest = await req.json()
    const { api_key, phone, ip, device_id } = body

    console.log('Received check request:', { api_key: api_key?.slice(0, 8) + '...', phone, ip, device_id: device_id?.slice(0, 10) + '...' })

    // Validate required fields
    if (!api_key) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!phone && !ip && !device_id) {
      return new Response(
        JSON.stringify({ error: 'At least one identifier (phone, ip, or device_id) is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 1: Validate API Key and get merchant data
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id, cooldown_period_days')
      .eq('api_key', api_key)
      .single()

    if (merchantError || !merchant) {
      console.log('Invalid API key:', api_key)
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Merchant found:', merchant.id, 'Cooldown:', merchant.cooldown_period_days, 'days')

    // Step 2: Check Blacklist
    const blacklistConditions = []
    if (phone) blacklistConditions.push(`blocked_value.eq.${phone}`)
    if (ip) blacklistConditions.push(`blocked_value.eq.${ip}`)
    if (device_id) blacklistConditions.push(`blocked_value.eq.${device_id}`)

    const { data: blacklistEntries, error: blacklistError } = await supabase
      .from('blacklist')
      .select('blocked_value, block_type, reason')
      .eq('merchant_id', merchant.id)
      .or(blacklistConditions.join(','))

    if (blacklistError) {
      console.error('Blacklist check error:', blacklistError)
    }

    if (blacklistEntries && blacklistEntries.length > 0) {
      const entry = blacklistEntries[0]
      console.log('Blocked by blacklist:', entry)
      
      // Log the blocked attempt
      await supabase.from('fraud_logs').insert({
        merchant_id: merchant.id,
        phone_number: phone || null,
        ip_address: ip || null,
        device_fingerprint: device_id || null,
        status: 'blocked_blacklist'
      })

      return new Response(
        JSON.stringify({
          allowed: false,
          reason: 'blacklist',
          message: 'You are banned from ordering.',
          blocked_type: entry.block_type
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 3: Check Cooldown Period
    const cooldownDate = new Date()
    cooldownDate.setDate(cooldownDate.getDate() - merchant.cooldown_period_days)
    const cooldownDateString = cooldownDate.toISOString()

    console.log('Checking logs since:', cooldownDateString)

    // Build OR conditions for fraud_logs check
    let fraudQuery = supabase
      .from('fraud_logs')
      .select('id, phone_number, ip_address, device_fingerprint, created_at, status')
      .eq('merchant_id', merchant.id)
      .eq('status', 'allowed')
      .gte('created_at', cooldownDateString)

    // Build conditions dynamically
    const orConditions = []
    if (phone) orConditions.push(`phone_number.eq.${phone}`)
    if (ip) orConditions.push(`ip_address.eq.${ip}`)
    if (device_id) orConditions.push(`device_fingerprint.eq.${device_id}`)

    if (orConditions.length > 0) {
      fraudQuery = fraudQuery.or(orConditions.join(','))
    }

    const { data: existingLogs, error: logsError } = await fraudQuery.limit(1)

    if (logsError) {
      console.error('Fraud logs check error:', logsError)
    }

    if (existingLogs && existingLogs.length > 0) {
      const log = existingLogs[0]
      const logDate = new Date(log.created_at)
      const daysAgo = Math.ceil((Date.now() - logDate.getTime()) / (1000 * 60 * 60 * 24))
      const daysRemaining = merchant.cooldown_period_days - daysAgo

      console.log('Found existing order within cooldown:', log)
      
      // Log the blocked attempt
      await supabase.from('fraud_logs').insert({
        merchant_id: merchant.id,
        phone_number: phone || null,
        ip_address: ip || null,
        device_fingerprint: device_id || null,
        status: 'blocked_cooldown'
      })

      return new Response(
        JSON.stringify({
          allowed: false,
          reason: 'cooldown',
          message: `You have already placed an order recently. Please wait ${daysRemaining > 0 ? daysRemaining : 1} more day(s).`,
          days_remaining: daysRemaining > 0 ? daysRemaining : 1
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 4: Success - Log the allowed order
    const { error: insertError } = await supabase.from('fraud_logs').insert({
      merchant_id: merchant.id,
      phone_number: phone || null,
      ip_address: ip || null,
      device_fingerprint: device_id || null,
      status: 'allowed'
    })

    if (insertError) {
      console.error('Failed to log order:', insertError)
    }

    console.log('Order allowed for merchant:', merchant.id)

    return new Response(
      JSON.stringify({ allowed: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
