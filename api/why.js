// /api/why
// GET  → { seeded: string[], contributions: string[] }
// POST { text } → { saved: boolean, text: string }
//
// Contributions persist to Vercel KV (Upstash Redis) when KV env vars are
// set. Falls back to "not saved" when KV is missing — the page still shows
// the seeded lines and accepts the user's submission visually, just doesn't
// persist for the next ghost.

export const config = {
  api: { bodyParser: true },
  maxDuration: 10,
};

const SEEDED = [
  "I'm sick of fake intimacy.",
  "I'm done performing.",
  "I want to say true things without flinching.",
  "I'm tired of pretending I'm fine.",
  "I want to be known without being seen.",
  "Everywhere else feels louder than my actual life.",
];

const KEY = 'ghostbook:why';

function kvConfigured() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function kvCmd(cmd) {
  if (!kvConfigured()) return null;
  try {
    const r = await fetch(process.env.KV_REST_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cmd),
    });
    if (!r.ok) return null;
    const data = await r.json();
    return data.result;
  } catch {
    return null;
  }
}

async function listContributions() {
  const r = await kvCmd(['lrange', KEY, 0, -1]);
  return Array.isArray(r) ? r : [];
}

async function pushContribution(text) {
  const r = await kvCmd(['rpush', KEY, text]);
  return r !== null;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const contributions = await listContributions();
    return res.status(200).json({ seeded: SEEDED, contributions });
  }

  if (req.method === 'POST') {
    const { text } = req.body || {};
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'no text' });
    }
    const cleaned = text.trim().slice(0, 200);
    const saved = await pushContribution(cleaned);
    return res.status(200).json({ saved, text: cleaned });
  }

  return res.status(405).json({ error: 'method not allowed' });
}
