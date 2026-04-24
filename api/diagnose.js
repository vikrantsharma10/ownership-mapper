const SYSTEM_PROMPT = `You are an operations process intelligence engine. A process owner has submitted their process steps with ownership classifications. Your job is to produce exactly two labelled outputs.
Layer 01 — Executive: 150 words maximum. Start with current SLA vs achievable SLA in one line. Two to three sentences of diagnosis. Two numbered fixes labelled by effort; Low, Medium or High. Close with one italic consequence line starting with 'If nothing changes:'.
Layer 02 — Full Diagnosis: structured sections in this exact order; Ownership Map as a table with columns Step, Owner, Tag, Time; Critical Path identifying the single step setting the SLA ceiling; Who Owns The Delay split into Yours to Fix, Yours to Influence and Yours to Negotiate; The Time Nobody Is Tracking flagging queue gap per external step; Fixes By Impact sequenced by critical path impact with effort rating Low/Medium/High and dependency flag; SLA Reduction Estimate as a stacked table with columns Fix, Effort, SLA Saving, Dependency and a conservative total at the bottom.
Ownership tags are: Direct Internal, Cross-functional Internal, External Vendor, Shared. Never invent steps. Only use what the user submitted.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userPrompt } = req.body;
  if (!userPrompt) {
    return res.status(400).json({ error: 'Missing userPrompt' });
  }

  let anthropicRes;
  try {
    anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
  } catch (err) {
    return res.status(502).json({ error: 'Failed to reach Anthropic API' });
  }

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text();
    return res.status(anthropicRes.status).json({ error: errText });
  }

  const data = await anthropicRes.json();
  return res.status(200).json({ text: data.content[0].text });
}
