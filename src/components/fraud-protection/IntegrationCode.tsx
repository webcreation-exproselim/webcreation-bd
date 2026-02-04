import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Copy, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IntegrationCodeProps {
  apiKey: string;
}

export function IntegrationCode({ apiKey }: IntegrationCodeProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const edgeFunctionUrl = `https://gtjmfvwkatrorhuyrpby.supabase.co/functions/v1/check-order-eligibility`;

  const snippetCode = `<!-- Order Limiter & Anti-Fraud System -->
<script src="https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js"></script>
<script>
(function() {
  var API_KEY = '${apiKey}';
  var ENDPOINT = '${edgeFunctionUrl}';
  var deviceId = null;

  // Initialize FingerprintJS
  FingerprintJS.load().then(function(fp) {
    fp.get().then(function(result) {
      deviceId = result.visitorId;
      console.log('Device fingerprint ready');
    });
  });

  // Hook into WooCommerce checkout
  jQuery(document).ready(function($) {
    $('form.checkout').on('checkout_place_order', function(e) {
      var phone = $('#billing_phone').val();
      
      // Show loading state
      var $button = $('button[type="submit"]', this);
      var originalText = $button.text();
      $button.prop('disabled', true).text('Checking...');

      // Make API call
      $.ajax({
        url: ENDPOINT,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          api_key: API_KEY,
          phone: phone,
          device_id: deviceId
        }),
        success: function(response) {
          if (response.allowed) {
            // Allow order to proceed
            $button.prop('disabled', false).text(originalText);
            $('form.checkout').off('checkout_place_order').submit();
          } else {
            // Block the order
            alert(response.message || 'You cannot place an order at this time.');
            $button.prop('disabled', false).text(originalText);
          }
        },
        error: function() {
          // On error, allow order (fail-open)
          $button.prop('disabled', false).text(originalText);
          $('form.checkout').off('checkout_place_order').submit();
        }
      });

      return false; // Prevent default submission
    });
  });
})();
</script>
<!-- End Order Limiter -->`;

  const copyCode = () => {
    navigator.clipboard.writeText(snippetCode);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Integration code copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="border-cyan-500/20 bg-gradient-to-br from-slate-900 to-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <Code className="h-5 w-5" />
            WordPress Integration Code
          </CardTitle>
          <CardDescription>
            Copy this code and paste it into your WordPress site to enable order limiting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <pre className="bg-slate-950 border border-slate-700 rounded-lg p-4 overflow-x-auto text-xs text-slate-300 max-h-96">
              <code>{snippetCode}</code>
            </pre>
            <Button
              onClick={copyCode}
              className="absolute top-2 right-2 bg-cyan-600 hover:bg-cyan-700"
              size="sm"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" /> Copy Code
                </>
              )}
            </Button>
          </div>

          <div className="space-y-4 text-sm">
            <h4 className="font-semibold text-white">Installation Instructions:</h4>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Copy the code above</li>
              <li>Go to your WordPress dashboard</li>
              <li>
                Navigate to <strong>Appearance → Theme File Editor</strong> or use a plugin like{" "}
                <strong>"Insert Headers and Footers"</strong>
              </li>
              <li>
                Paste the code in your theme's <code className="bg-slate-800 px-1 rounded">footer.php</code> before the closing{" "}
                <code className="bg-slate-800 px-1 rounded">&lt;/body&gt;</code> tag
              </li>
              <li>Save the file</li>
            </ol>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mt-4">
              <h5 className="font-semibold text-amber-400 mb-2">⚠️ Important Notes:</h5>
              <ul className="list-disc list-inside space-y-1 text-amber-300/80 text-sm">
                <li>This code requires jQuery (included by default in WooCommerce)</li>
                <li>Make sure your checkout page uses the standard WooCommerce form</li>
                <li>Test on a staging site before deploying to production</li>
                <li>If you regenerate your API key, update this code with the new key</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-900 to-slate-800">
        <CardHeader>
          <CardTitle className="text-white">API Reference</CardTitle>
          <CardDescription>For custom integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h5 className="font-semibold text-cyan-400 mb-2">Endpoint</h5>
            <code className="bg-slate-800 px-2 py-1 rounded text-slate-300 block overflow-x-auto">
              POST {edgeFunctionUrl}
            </code>
          </div>

          <div>
            <h5 className="font-semibold text-cyan-400 mb-2">Request Body</h5>
            <pre className="bg-slate-800 p-3 rounded text-slate-300 overflow-x-auto">
{`{
  "api_key": "${apiKey.slice(0, 8)}...",
  "phone": "01XXXXXXXXX",
  "ip": "192.168.1.1",      // optional
  "device_id": "abc123..."  // optional
}`}
            </pre>
          </div>

          <div>
            <h5 className="font-semibold text-cyan-400 mb-2">Response (Success)</h5>
            <pre className="bg-slate-800 p-3 rounded text-green-400 overflow-x-auto">
{`{ "allowed": true }`}
            </pre>
          </div>

          <div>
            <h5 className="font-semibold text-cyan-400 mb-2">Response (Blocked)</h5>
            <pre className="bg-slate-800 p-3 rounded text-red-400 overflow-x-auto">
{`{
  "allowed": false,
  "reason": "cooldown",
  "message": "You have already placed an order recently. Please wait 15 more day(s).",
  "days_remaining": 15
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
