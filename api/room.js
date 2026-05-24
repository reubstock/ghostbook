// Personalized room: takes the visitor's history of wants, returns the 12
// pool wants whose authors wanted most-nearly what this visitor has wanted.
// First-time visitors (empty history) get a balanced default 12.

import { POOL, DEFAULT_12, embed, cosine, getPoolEmbeddings } from './embed.js';

export const config = {
  api: { bodyParser: true },
  maxDuration: 30,
};

function defaultRoom() {
  return DEFAULT_12.map(id => POOL.find(p => p.id === id));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const { history = [] } = req.body || {};
  const texts = Array.isArray(history)
    ? history.filter(s => typeof s === 'string' && s.trim()).slice(-20)
    : [];

  // First visit, no key, or empty history → default 12
  if (texts.length === 0 || !process.env.OPENAI_API_KEY) {
    return res.status(200).json({ wants: defaultRoom(), personalized: false });
  }

  try {
    const [poolEmbs, userEmbs] = await Promise.all([
      getPoolEmbeddings(),
      embed(texts),
    ]);

    // Centroid of the visitor's wants
    const dim = userEmbs[0].length;
    const centroid = new Array(dim).fill(0);
    for (const v of userEmbs) {
      for (let i = 0; i < dim; i++) centroid[i] += v[i];
    }
    for (let i = 0; i < dim; i++) centroid[i] /= userEmbs.length;

    // Rank all pool wants by similarity to centroid
    const sims = POOL.map((p, i) => ({
      pool: p,
      sim: cosine(centroid, poolEmbs[i]),
    })).sort((a, b) => b.sim - a.sim);

    const wants = sims.slice(0, 12).map(s => s.pool);

    res.status(200).json({ wants, personalized: true });
  } catch (e) {
    // On any failure, fall back to default so the room still renders
    res.status(200).json({
      wants: defaultRoom(),
      personalized: false,
      error: String(e.message || e),
    });
  }
}
