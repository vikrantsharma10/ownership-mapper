export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eventType } = req.body;
  if (!eventType) {
    return res.status(400).json({ error: 'Missing eventType' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase env vars not configured' });
  }

  const supabaseRes = await fetch(`${supabaseUrl}/rest/v1/events`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ event_type: eventType }),
  });

  if (!supabaseRes.ok) {
    const errText = await supabaseRes.text();
    return res.status(supabaseRes.status).json({ error: errText });
  }

  return res.status(200).json({ ok: true });
}
