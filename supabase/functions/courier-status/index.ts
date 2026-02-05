import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface CourierRequest {
  api_key: string
  action: 'check_status' | 'sync_all' | 'save_credentials'
  courier?: 'steadfast' | 'pathao'
  invoice?: string
  consignment_id?: string
  tracking_code?: string
  credentials?: {
    steadfast_api_key?: string
    steadfast_secret_key?: string
    pathao_client_id?: string
    pathao_client_secret?: string
    pathao_username?: string
    pathao_password?: string
  }
}

// Steadfast API helper
async function checkSteadfast(apiKey: string, secretKey: string, identifier: string, type: 'invoice' | 'consignment' | 'tracking') {
  const endpoints: Record<string, string> = {
    invoice: `https://portal.steadfast.com.bd/api/v1/status_by_invoice/${identifier}`,
    consignment: `https://portal.steadfast.com.bd/api/v1/status_by_cid/${identifier}`,
    tracking: `https://portal.steadfast.com.bd/api/v1/status_by_trackingcode/${identifier}`
  }

  const response = await fetch(endpoints[type], {
    method: 'GET',
    headers: {
      'Api-Key': apiKey,
      'Secret-Key': secretKey,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Steadfast API error: ${response.status}`)
  }

  return await response.json()
}

// Pathao API helper - get token first then check order
async function getPathaoToken(clientId: string, clientSecret: string, username: string, password: string) {
  const response = await fetch('https://api-hermes.pathao.com/aladdin/api/v1/issue-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      username: username,
      password: password,
      grant_type: 'password'
    })
  })

  if (!response.ok) {
    throw new Error(`Pathao auth error: ${response.status}`)
  }

  const data = await response.json()
  return data.access_token
}

async function checkPathao(token: string, consignmentId: string) {
  const response = await fetch(`https://api-hermes.pathao.com/aladdin/api/v1/orders/${consignmentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Pathao API error: ${response.status}`)
  }

  return await response.json()
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
    const body: CourierRequest = await req.json()
    const { api_key, action, courier, invoice, consignment_id, tracking_code, credentials } = body

    console.log('Courier status request:', { api_key: api_key?.slice(0, 8) + '...', action, courier })

    // Validate required fields
    if (!api_key) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate API Key and get merchant data
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id, steadfast_api_key, steadfast_secret_key, pathao_client_id, pathao_client_secret, pathao_username, pathao_password')
      .eq('api_key', api_key)
      .single()

    if (merchantError || !merchant) {
      console.log('Invalid API key:', api_key)
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Action: Save credentials
    if (action === 'save_credentials') {
      if (!credentials) {
        return new Response(
          JSON.stringify({ error: 'Credentials are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const updateData: Record<string, string> = {}
      if (credentials.steadfast_api_key !== undefined) updateData.steadfast_api_key = credentials.steadfast_api_key
      if (credentials.steadfast_secret_key !== undefined) updateData.steadfast_secret_key = credentials.steadfast_secret_key
      if (credentials.pathao_client_id !== undefined) updateData.pathao_client_id = credentials.pathao_client_id
      if (credentials.pathao_client_secret !== undefined) updateData.pathao_client_secret = credentials.pathao_client_secret
      if (credentials.pathao_username !== undefined) updateData.pathao_username = credentials.pathao_username
      if (credentials.pathao_password !== undefined) updateData.pathao_password = credentials.pathao_password

      const { error: updateError } = await supabase
        .from('merchants')
        .update(updateData)
        .eq('id', merchant.id)

      if (updateError) {
        console.error('Failed to save credentials:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to save credentials' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Credentials saved' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Action: Check status
    if (action === 'check_status') {
      if (!courier) {
        return new Response(
          JSON.stringify({ error: 'Courier type is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (courier === 'steadfast') {
        if (!merchant.steadfast_api_key || !merchant.steadfast_secret_key) {
          return new Response(
            JSON.stringify({ error: 'Steadfast credentials not configured' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const identifier = invoice || consignment_id || tracking_code
        if (!identifier) {
          return new Response(
            JSON.stringify({ error: 'Invoice, consignment ID, or tracking code is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const type = invoice ? 'invoice' : consignment_id ? 'consignment' : 'tracking'
        
        try {
          const result = await checkSteadfast(merchant.steadfast_api_key, merchant.steadfast_secret_key, identifier, type)
          
          // Save/update in courier_orders table
          if (result.delivery) {
            const orderData = {
              merchant_id: merchant.id,
              courier_type: 'steadfast',
              invoice_number: result.delivery.invoice || invoice,
              consignment_id: result.delivery.consignment_id || consignment_id,
              tracking_code: result.delivery.tracking_code || tracking_code,
              recipient_name: result.delivery.recipient_name,
              recipient_phone: result.delivery.recipient_phone,
              recipient_address: result.delivery.recipient_address,
              cod_amount: result.delivery.cod_amount || 0,
              status: result.delivery.delivery_status,
              delivery_fee: result.delivery.charge || 0,
              last_synced_at: new Date().toISOString()
            }

            // Upsert based on consignment_id
            await supabase
              .from('courier_orders')
              .upsert(orderData, { onConflict: 'consignment_id' })
          }

          return new Response(
            JSON.stringify({ success: true, courier: 'steadfast', data: result }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } catch (error) {
          console.error('Steadfast API error:', error)
          return new Response(
            JSON.stringify({ error: `Steadfast API error: ${error.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      if (courier === 'pathao') {
        if (!merchant.pathao_client_id || !merchant.pathao_client_secret || !merchant.pathao_username || !merchant.pathao_password) {
          return new Response(
            JSON.stringify({ error: 'Pathao credentials not configured' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (!consignment_id) {
          return new Response(
            JSON.stringify({ error: 'Consignment ID is required for Pathao' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        try {
          const token = await getPathaoToken(merchant.pathao_client_id, merchant.pathao_client_secret, merchant.pathao_username, merchant.pathao_password)
          const result = await checkPathao(token, consignment_id)
          
          // Save/update in courier_orders table
          if (result.data) {
            const orderData = {
              merchant_id: merchant.id,
              courier_type: 'pathao',
              invoice_number: result.data.merchant_order_id,
              consignment_id: consignment_id,
              recipient_name: result.data.recipient_name,
              recipient_phone: result.data.recipient_phone,
              recipient_address: result.data.recipient_address,
              cod_amount: result.data.amount_to_collect || 0,
              status: result.data.order_status,
              delivery_fee: result.data.delivery_fee || 0,
              last_synced_at: new Date().toISOString()
            }

            await supabase
              .from('courier_orders')
              .upsert(orderData, { onConflict: 'consignment_id' })
          }

          return new Response(
            JSON.stringify({ success: true, courier: 'pathao', data: result }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } catch (error) {
          console.error('Pathao API error:', error)
          return new Response(
            JSON.stringify({ error: `Pathao API error: ${error.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action or courier type' }),
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
