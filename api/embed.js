export const config = {
  api: { bodyParser: true },
  maxDuration: 30,
};

const SEEDS = [
  { id: 0, want: "I want to leave my marriage. I don't know how to start the sentence.", x: 16, y: 32 },
  { id: 1, want: "I want to be a mother. I'm 38. I've never said it out loud.", x: 50, y: 30 },
  { id: 2, want: "I want to quit my job and learn to weld.", x: 22, y: 12 },
  { id: 3, want: "I want my father to call me first. Just once.", x: 14, y: 68 },
  { id: 4, want: "I want to write a book even though everyone I know would laugh.", x: 62, y: 14 },
  { id: 5, want: "I want to be alone in a way that doesn't feel like failure.", x: 58, y: 48 },
  { id: 6, want: "I want to fall in love again and not ruin it this time.", x: 80, y: 28 },
  { id: 7, want: "I want to stop pretending I like what I do. I've been pretending eleven years.", x: 10, y: 18 },
  { id: 8, want: "I want to forgive my mother. I don't actually want to.", x: 28, y: 80 },
  { id: 9, want: "I want to live somewhere I can hear the ocean.", x: 32, y: 24 },
  { id: 10, want: "I want to be touched without it meaning anything.", x: 86, y: 50 },
  { id: 11, want: "I want to learn the names of every tree on my street.", x: 70, y: 78 },
];

let seedEmbeddings = null;
let seedEmbedPromise = null;

async function embed(texts) {
  const r = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: texts,
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`OpenAI embedding ${r.status}: ${t.slice(0, 200)}`);
  }
  const data = await r.json();
  return data.data.map(d => d.embedding);
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

async function getSeedEmbeddings() {
  if (seedEmbeddings) return seedEmbeddings;
  if (!seedEmbedPromise) {
    seedEmbedPromise = embed(SEEDS.map(s => s.want))
      .then(e => { seedEmbeddings = e; return e; })
      .catch(e => { seedEmbedPromise = null; throw e; });
  }
  return seedEmbedPromise;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
  }

  const { text } = req.body || {};
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'no text' });
  }
  const cleaned = text.trim();
  if (cleaned.length > 600) {
    return res.status(400).json({ error: 'too long' });
  }

  try {
    const [seeds, [userVec]] = await Promise.all([
      getSeedEmbeddings(),
      embed([cleaned]),
    ]);

    const sims = SEEDS.map((seed, i) => ({
      id: seed.id,
      seed,
      sim: cosine(userVec, seeds[i]),
    })).sort((a, b) => b.sim - a.sim);

    const top = sims.slice(0, 3);
    const weights = top.map(t => Math.exp(t.sim * 12));
    const wsum = weights.reduce((a, b) => a + b, 0);
    let x = 0, y = 0;
    top.forEach((t, i) => {
      x += t.seed.x * (weights[i] / wsum);
      y += t.seed.y * (weights[i] / wsum);
    });

    x += (Math.random() - 0.5) * 6;
    y += (Math.random() - 0.5) * 6;
    x = Math.max(8, Math.min(92, x));
    y = Math.max(10, Math.min(88, y));

    res.status(200).json({
      x,
      y,
      nearest: sims.slice(0, 2).map(t => ({ id: t.id, sim: t.sim })),
    });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}
