import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface TrustScoreRequest {
  api_key: string
  phone: string
}

interface StatusCount {
  status: string
  count: number
  courier_type: string
}

// Status mapping for different couriers
const DELIVERED_STATUSES = [
  'delivered',
  'Delivered',
  'DELIVERED',
  'complete',
  'completed',
  'Success Delivery',
  'success_delivery',
  'partial_delivered'
]

const RETURNED_STATUSES = [
  'returned',
  'Returned',
  'RETURNED',
  'cancelled',
  'Cancelled',
  'CANCELLED',
  'Return',
  'return',
  'hold',
  'Hold',
  'Returned to Merchant',
  'returned_to_merchant',
  'cancelled_by_customer'
]

// Pending statuses are excluded from score calculation
const PENDING_STATUSES = [
  'pending',
  'Pending',
  'PENDING',
  'in_transit',
  'In Transit',
  'processing',
  'Processing',
  'picked',
  'Picked',
  'on_the_way',
  'out_for_delivery',
  'Out for Delivery'
]

function normalizePhone(phone: string): string {
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, '')
  
  // Handle Bangladesh phone numbers
  if (cleaned.startsWith('880')) {
    cleaned = '0' + cleaned.slice(3)
  }
  if (cleaned.length === 10 && !cleaned.startsWith('0')) {
    cleaned = '0' + cleaned
  }
  
  return cleaned
}

function isDelivered(status: string): boolean {
  return DELIVERED_STATUSES.some(s => 
    status.toLowerCase().includes(s.toLowerCase())
  )
}

function isReturned(status: string): boolean {
  return RETURNED_STATUSES.some(s => 
    status.toLowerCase().includes(s.toLowerCase())
  )
}

function isPending(status: string): boolean {
  return PENDING_STATUSES.some(s => 
    status.toLowerCase().includes(s.toLowerCase())
  )
}

function getTrustLevel(score: number): { status: string, label_bn: string, label_en: string, color: string } {
  if (score >= 80) {
    return { 
      status: 'trusted', 
      label_bn: 'বিশ্বস্ত কাস্টমার', 
      label_en: 'Trusted Customer',
      color: 'green'
    }
  } else if (score >= 50) {
    return { 
      status: 'medium_risk', 
      label_bn: 'মাঝারি ঝুঁকি', 
      label_en: 'Medium Risk',
      color: 'yellow'
    }
  } else {
    return { 
      status: 'high_risk', 
      label_bn: 'উচ্চ ঝুঁকি', 
      label_en: 'High Risk',
      color: 'red'
    }
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
    const body: TrustScoreRequest = await req.json()
    const { api_key, phone } = body

    console.log('Trust score request:', { api_key: api_key?.slice(0, 8) + '...', phone })

    // Validate required fields
    if (!api_key) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!phone) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate API Key and get merchant
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id, is_active, plan_expires_at')
      .eq('api_key', api_key)
      .single()

    if (merchantError || !merchant) {
      console.log('Invalid API key:', api_key)
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if account is active
    if (!merchant.is_active) {
      return new Response(
        JSON.stringify({ error: 'Account not activated' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check subscription expiry
    if (merchant.plan_expires_at) {
      const expiryDate = new Date(merchant.plan_expires_at)
      if (expiryDate < new Date()) {
        return new Response(
          JSON.stringify({ error: 'Subscription expired' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Normalize phone number for search
    const normalizedPhone = normalizePhone(phone)
    
    // Build phone search patterns (handle different formats)
    const phonePatterns = [
      phone,
      normalizedPhone,
      normalizedPhone.startsWith('0') ? normalizedPhone.slice(1) : normalizedPhone,
      '+880' + (normalizedPhone.startsWith('0') ? normalizedPhone.slice(1) : normalizedPhone),
      '880' + (normalizedPhone.startsWith('0') ? normalizedPhone.slice(1) : normalizedPhone)
    ]

    console.log('Searching for phone patterns:', phonePatterns)

    // Query courier_orders for this phone number
    const { data: orders, error: ordersError } = await supabase
      .from('courier_orders')
      .select('status, courier_type, cod_amount, created_at')
      .eq('merchant_id', merchant.id)
      .or(phonePatterns.map(p => `recipient_phone.ilike.%${p}%`).join(','))
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch order history' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Found orders:', orders?.length || 0)

    // No history found
    if (!orders || orders.length === 0) {
      return new Response(
        JSON.stringify({
          phone: phone,
          trust_score: null,
          status: 'new_customer',
          label_bn: 'নতুন কাস্টমার',
          label_en: 'New Customer',
          color: 'gray',
          history: {
            total_orders: 0,
            delivered: 0,
            returned: 0,
            pending: 0
          },
          last_order_date: null,
          couriers: []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Categorize orders
    let delivered = 0
    let returned = 0
    let pending = 0
    const courierSet = new Set<string>()
    let totalCod = 0

    for (const order of orders) {
      const status = order.status || 'pending'
      courierSet.add(order.courier_type)
      
      if (order.cod_amount) {
        totalCod += Number(order.cod_amount)
      }

      if (isDelivered(status)) {
        delivered++
      } else if (isReturned(status)) {
        returned++
      } else if (isPending(status)) {
        pending++
      } else {
        // Unknown status - treat as pending (neutral)
        pending++
      }
    }

    // Calculate trust score: Delivered / (Delivered + Returned) * 100
    // Pending orders are excluded from calculation
    const completedOrders = delivered + returned
    let trustScore: number | null = null

    if (completedOrders > 0) {
      trustScore = Math.round((delivered / completedOrders) * 100)
    }

    // Get trust level
    const trustLevel = trustScore !== null 
      ? getTrustLevel(trustScore)
      : { status: 'new_customer', label_bn: 'নতুন কাস্টমার', label_en: 'New Customer', color: 'gray' }

    // Get last order date
    const lastOrderDate = orders[0]?.created_at || null

    console.log('Trust score calculated:', {
      phone,
      trustScore,
      delivered,
      returned,
      pending,
      total: orders.length
    })

    return new Response(
      JSON.stringify({
        phone: phone,
        trust_score: trustScore,
        status: trustLevel.status,
        label_bn: trustLevel.label_bn,
        label_en: trustLevel.label_en,
        color: trustLevel.color,
        history: {
          total_orders: orders.length,
          delivered: delivered,
          returned: returned,
          pending: pending
        },
        total_cod_amount: totalCod,
        last_order_date: lastOrderDate,
        couriers: Array.from(courierSet)
      }),
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
