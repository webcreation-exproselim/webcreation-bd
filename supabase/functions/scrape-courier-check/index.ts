import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone, api_key } = await req.json();

    if (!phone || !api_key) {
      console.log('[scrape-courier-check] Missing phone or api_key');
      return new Response(
        JSON.stringify({ success: false, error: 'Phone number and API key are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate BD phone number
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!/^01[0-9]{9}$/.test(cleanPhone)) {
      console.log('[scrape-courier-check] Invalid phone format:', cleanPhone);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid Bangladesh phone number format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate API key against courier_check_subscriptions
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: subscription, error: subError } = await supabase
      .from('courier_check_subscriptions')
      .select('*')
      .eq('api_key', api_key)
      .single();

    if (subError || !subscription) {
      console.log('[scrape-courier-check] Invalid API key:', api_key);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!subscription.is_active) {
      console.log('[scrape-courier-check] Subscription not active for:', api_key);
      return new Response(
        JSON.stringify({ success: false, error: 'Subscription is not active' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check expiration
    if (subscription.plan_expires_at && new Date(subscription.plan_expires_at) < new Date()) {
      console.log('[scrape-courier-check] Subscription expired');
      return new Response(
        JSON.stringify({ success: false, error: 'Subscription has expired' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check request limits
    if (subscription.requests_used >= subscription.max_requests) {
      console.log('[scrape-courier-check] Request limit reached');
      return new Response(
        JSON.stringify({ success: false, error: 'Request limit reached' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[scrape-courier-check] Scraping elitemart for phone:', cleanPhone);

    // Scrape elitemart.com.bd/fraud-check
    const scrapeResponse = await fetch('https://elitemart.com.bd/fraud-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      body: `phone=${cleanPhone}`,
    });

    if (!scrapeResponse.ok) {
      console.error('[scrape-courier-check] Scrape failed with status:', scrapeResponse.status);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch courier data. Please try again.' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await scrapeResponse.text();
    console.log('[scrape-courier-check] HTML received, length:', html.length);

    // Parse HTML response
    const result = parseElitemartHTML(html, cleanPhone);

    // Increment requests_used
    await supabase
      .from('courier_check_subscriptions')
      .update({
        requests_used: subscription.requests_used + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    console.log('[scrape-courier-check] Success for phone:', cleanPhone, 'Result:', JSON.stringify(result));

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[scrape-courier-check] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function parseElitemartHTML(html: string, phone: string) {
  // Extract success rate from #deliveryProgress data-percentage
  let successRate = 0;
  const progressMatch = html.match(/id=["']deliveryProgress["'][^>]*data-percentage=["'](\d+)["']/i) 
    || html.match(/data-percentage=["'](\d+)["'][^>]*id=["']deliveryProgress["']/i);
  if (progressMatch) {
    successRate = parseInt(progressMatch[1], 10);
  }

  // Extract stats from .grid section - look for bold text with numbers
  let totalOrders = 0;
  let totalDelivered = 0;
  let totalReturned = 0;

  // Try to extract stats from grid section
  const gridSection = html.match(/<div[^>]*class=["'][^"']*grid[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/i);
  if (gridSection) {
    const boldNumbers = gridSection[1].match(/<[^>]*class=["'][^"']*font-bold[^"']*["'][^>]*>(\d+)<\/[^>]*>/g);
    if (boldNumbers && boldNumbers.length >= 3) {
      const nums = boldNumbers.map(b => {
        const m = b.match(/>(\d+)</);
        return m ? parseInt(m[1], 10) : 0;
      });
      totalOrders = nums[0];
      totalDelivered = nums[1];
      totalReturned = nums[2];
    }
  }

  // Fallback: search for any bold numbers in specific patterns
  if (totalOrders === 0) {
    const allBoldNumbers = html.match(/<[^>]*font-bold[^>]*>\s*(\d+)\s*<\/[^>]*>/gi);
    if (allBoldNumbers && allBoldNumbers.length >= 3) {
      const nums = allBoldNumbers.map(b => {
        const m = b.match(/>(\d+)</);
        return m ? parseInt(m[1], 10) : 0;
      });
      totalOrders = nums[0];
      totalDelivered = nums[1];
      totalReturned = nums[2];
    }
  }

  // Extract courier breakdown from .courier_table tbody tr
  const couriers: { name: string; orders: number; delivered: number; returned: number; rate: number }[] = [];
  
  const tableMatch = html.match(/<table[^>]*class=["'][^"']*courier_table[^"']*["'][^>]*>([\s\S]*?)<\/table>/i);
  if (tableMatch) {
    const tbodyMatch = tableMatch[1].match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
    if (tbodyMatch) {
      const rows = tbodyMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
      if (rows) {
        for (const row of rows) {
          const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
          if (cells && cells.length >= 5) {
            const cellValues = cells.map(c => {
              const text = c.replace(/<[^>]*>/g, '').trim();
              return text;
            });
            couriers.push({
              name: cellValues[0],
              orders: parseInt(cellValues[1], 10) || 0,
              delivered: parseInt(cellValues[2], 10) || 0,
              returned: parseInt(cellValues[3], 10) || 0,
              rate: parseFloat(cellValues[4]) || 0,
            });
          }
        }
      }
    }
  }

  // Extract risk label from #risk-container
  let riskLabel = 'new_customer';
  let riskMessage = '';
  const riskMatch = html.match(/id=["']risk-container["'][^>]*>([\s\S]*?)<\/div>/i);
  if (riskMatch) {
    const riskText = riskMatch[1].replace(/<[^>]*>/g, '').trim().toLowerCase();
    riskMessage = riskMatch[1].replace(/<[^>]*>/g, '').trim();
    
    if (riskText.includes('trusted') || riskText.includes('বিশ্বস্ত') || riskText.includes('reliable')) {
      riskLabel = 'trusted';
    } else if (riskText.includes('moderate') || riskText.includes('মাঝারি') || riskText.includes('warning')) {
      riskLabel = 'moderate';
    } else if (riskText.includes('risky') || riskText.includes('ঝুঁকি') || riskText.includes('risk') || riskText.includes('suspicious')) {
      riskLabel = 'risky';
    } else if (riskText.includes('new') || riskText.includes('নতুন')) {
      riskLabel = 'new_customer';
    }
  }

  // Also try to determine risk from success rate if label not found
  if (riskLabel === 'new_customer' && totalOrders > 0) {
    if (successRate >= 80) riskLabel = 'trusted';
    else if (successRate >= 50) riskLabel = 'moderate';
    else riskLabel = 'risky';
  }

  return {
    phone,
    success_rate: successRate,
    total_orders: totalOrders,
    total_delivered: totalDelivered,
    total_returned: totalReturned,
    risk_label: riskLabel,
    risk_message: riskMessage,
    couriers,
  };
}
