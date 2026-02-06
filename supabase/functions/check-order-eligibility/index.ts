import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// Default popup settings
const DEFAULT_POPUP_SETTINGS = {
  timer: 30,
  language: 'bn',
  msg_cooldown: 'আপনি সম্প্রতি অর্ডার করেছেন। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।',
  msg_blacklist: 'আপনার অর্ডার ব্লক করা হয়েছে। সমস্যা হলে যোগাযোগ করুন।',
  whatsapp: '',
  phone: '',
  show_contact: true
}

interface CheckRequest {
  api_key: string
  phone?: string
  ip?: string
  device_id?: string
  domain?: string
  check_type?: 'license' | 'test' | 'order'
}

// Normalize domain for comparison (remove protocol, www, trailing slashes)
function normalizeDomain(url: string): string {
  try {
    let domain = url.toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/.*$/, '')
      .trim();
    return domain;
  } catch {
    return url.toLowerCase().trim();
  }
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
    const { api_key, phone, ip, device_id, domain, check_type } = body

    const isLicenseOrTest = check_type === 'license' || check_type === 'test'

    console.log('Received check request:', { 
      api_key: api_key?.slice(0, 8) + '...', 
      phone: isLicenseOrTest ? '[' + check_type + ']' : phone, 
      check_type: check_type || 'order',
      domain 
    })

    // Validate required fields
    if (!api_key) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // For real order checks, require at least one identifier
    if (!isLicenseOrTest && !phone && !ip && !device_id) {
      return new Response(
        JSON.stringify({ error: 'At least one identifier (phone, ip, or device_id) is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 1: Validate API Key and get merchant data
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id, cooldown_period_minutes, is_active, plan_expires_at, requests_used, max_requests, website_url, popup_timer_seconds, popup_language, msg_cooldown, msg_blacklist, whatsapp_number, phone_number, show_contact_buttons')
      .eq('api_key', api_key)
      .single()

    if (merchantError || !merchant) {
      console.log('Invalid API key:', api_key)
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Merchant found:', merchant.id, 'Active:', merchant.is_active, 'Check type:', check_type || 'order')

    // Build popup settings from merchant data or use defaults
    const popupSettings = {
      timer: merchant.popup_timer_seconds ?? DEFAULT_POPUP_SETTINGS.timer,
      language: merchant.popup_language ?? DEFAULT_POPUP_SETTINGS.language,
      msg_cooldown: merchant.msg_cooldown ?? DEFAULT_POPUP_SETTINGS.msg_cooldown,
      msg_blacklist: merchant.msg_blacklist ?? DEFAULT_POPUP_SETTINGS.msg_blacklist,
      whatsapp: merchant.whatsapp_number ?? DEFAULT_POPUP_SETTINGS.whatsapp,
      phone: merchant.phone_number ?? DEFAULT_POPUP_SETTINGS.phone,
      show_contact: merchant.show_contact_buttons ?? DEFAULT_POPUP_SETTINGS.show_contact
    }

    // Domain validation (for all check types)
    if (merchant.website_url && domain) {
      const allowedDomain = normalizeDomain(merchant.website_url)
      const requestDomain = normalizeDomain(domain)
      
      console.log('Domain check:', { allowed: allowedDomain, request: requestDomain })
      
      if (allowedDomain !== requestDomain) {
        console.log('Domain mismatch! Allowed:', allowedDomain, 'Request:', requestDomain)
        return new Response(
          JSON.stringify({ 
            error: 'Domain mismatch',
            allowed: false,
            reason: 'domain_mismatch',
            message: 'এই ডোমেইনে ব্যবহারের অনুমতি নেই। আপনার নিবন্ধিত ডোমেইন: ' + allowedDomain
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Check if account is activated
    if (!merchant.is_active) {
      console.log('Account not activated:', merchant.id)
      return new Response(
        JSON.stringify({ 
          error: 'Account not activated',
          allowed: false,
          reason: 'inactive',
          message: 'আপনার অ্যাকাউন্ট সক্রিয় নয়। দয়া করে সাবস্ক্রিপশন কিনুন।'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if subscription has expired
    if (merchant.plan_expires_at) {
      const expiryDate = new Date(merchant.plan_expires_at)
      if (expiryDate < new Date()) {
        console.log('Subscription expired:', merchant.id)
        return new Response(
          JSON.stringify({ 
            error: 'Subscription expired',
            allowed: false,
            reason: 'expired',
            message: 'আপনার সাবস্ক্রিপশন মেয়াদ শেষ হয়ে গেছে। দয়া করে রিনিউ করুন।'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Check request limits
    if (merchant.max_requests > 0 && merchant.requests_used >= merchant.max_requests) {
      console.log('Request limit exceeded:', merchant.id)
      return new Response(
        JSON.stringify({ 
          error: 'Request limit exceeded',
          allowed: false,
          reason: 'limit_exceeded',
          message: 'আপনার API request সীমা শেষ হয়ে গেছে। দয়া করে প্ল্যান আপগ্রেড করুন।'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ============================================
    // LICENSE CHECK / TEST: Stop here - don't create logs or increment usage
    // ============================================
    if (isLicenseOrTest) {
      console.log(check_type + ' check passed for merchant:', merchant.id)
      return new Response(
        JSON.stringify({ 
          allowed: true, 
          check_type: check_type,
          popup_settings: popupSettings 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ============================================
    // FULL ORDER CHECK: Blacklist, Cooldown, Logging
    // ============================================

    // Step 5: Check Blacklist
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
          message: popupSettings.msg_blacklist,
          blocked_type: entry.block_type,
          popup_settings: popupSettings
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 6: Check Cooldown Period (MINUTES based)
    const cooldownMinutes = merchant.cooldown_period_minutes || 1440
    const cooldownMs = cooldownMinutes * 60 * 1000
    const cooldownDate = new Date(Date.now() - cooldownMs)
    const cooldownDateString = cooldownDate.toISOString()

    console.log('Checking cooldown since:', cooldownDateString, '(cooldown:', cooldownMinutes, 'minutes)')

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
      const elapsedMs = Date.now() - logDate.getTime()
      const remainingMs = cooldownMs - elapsedMs
      const minutesRemaining = Math.ceil(remainingMs / (1000 * 60))

      console.log('Blocked by cooldown. Minutes remaining:', minutesRemaining)
      
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
          message: popupSettings.msg_cooldown,
          minutes_remaining: minutesRemaining > 0 ? minutesRemaining : 1,
          popup_settings: popupSettings
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 7: Success - Log the allowed order and increment request count
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

    // Increment requests_used
    const { error: updateError } = await supabase
      .from('merchants')
      .update({ requests_used: (merchant.requests_used || 0) + 1 })
      .eq('id', merchant.id)

    if (updateError) {
      console.error('Failed to update request count:', updateError)
    }

    console.log('Order allowed for merchant:', merchant.id)

    return new Response(
      JSON.stringify({ allowed: true, popup_settings: popupSettings }),
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
