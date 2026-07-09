import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Requires admin rights

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

/**
 * Generates a HMAC SHA-256 signature for the webhook payload
 */
function generateSignature(payload, secret) {
  if (!secret) return null;
  return crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
}

export default async function handler(req, res) {
  // Only allow POST requests for internal triggers (e.g., from pg_cron or Edge functions)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Basic authorization to prevent public abuse
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.WEBHOOK_TRIGGER_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { event, org_id, payload } = req.body;

  if (!event || !org_id || !payload) {
    return res.status(400).json({ error: 'Missing required parameters: event, org_id, payload' });
  }

  try {
    // 1. Fetch active webhooks for this event and organization
    const { data: webhooks, error } = await supabase
      .from('cms_webhooks')
      .select('url, secret_key')
      .eq('org_id', org_id)
      .eq('is_active', true)
      .contains('events', [event]);

    if (error) throw error;

    if (!webhooks || webhooks.length === 0) {
      return res.status(200).json({ message: 'No active webhooks found for this event' });
    }

    const results = [];

    // 2. Dispatch payloads to all registered endpoints
    for (const webhook of webhooks) {
      try {
        const signature = generateSignature(payload, webhook.secret_key);
        const headers = { 'Content-Type': 'application/json' };
        
        if (signature) {
          headers['X-Originyx-Signature'] = signature;
        }

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            event,
            timestamp: new Date().toISOString(),
            data: payload
          }),
        });

        results.push({
          url: webhook.url,
          status: response.status,
          success: response.ok
        });
      } catch (err) {
        results.push({
          url: webhook.url,
          error: err.message,
          success: false
        });
      }
    }

    return res.status(200).json({ dispatched: results.length, results });

  } catch (error) {
    console.error('Webhook Trigger Error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
