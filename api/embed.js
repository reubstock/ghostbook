export const config = {
  api: { bodyParser: true },
  maxDuration: 30,
};

export const POOL = [
  { id: 0,  x: 16, y: 30, want: "I want to leave my marriage. I don't know how to start the sentence." },
  { id: 1,  x: 22, y: 12, want: "I want to quit my job and learn to weld." },
  { id: 2,  x: 10, y: 18, want: "I want to stop pretending I like what I do. I've been pretending eleven years." },
  { id: 3,  x: 32, y: 24, want: "I want to live somewhere I can hear the ocean." },
  { id: 4,  x: 8,  y: 38, want: "I want to disappear for a year and come back as someone else." },
  { id: 5,  x: 22, y: 38, want: "I want to walk out of the wedding I planned." },
  { id: 6,  x: 28, y: 14, want: "I want to leave the religion I was raised in, all the way." },
  { id: 7,  x: 18, y: 22, want: "I want to delete my LinkedIn and never look at it again." },
  { id: 8,  x: 14, y: 42, want: "I want to stop being the responsible one." },
  { id: 9,  x: 30, y: 44, want: "I want to move somewhere nobody knows me." },

  { id: 10, x: 50, y: 30, want: "I want to be a mother. I'm 38. I've never said it out loud." },
  { id: 11, x: 60, y: 16, want: "I want to write a book even though everyone I know would laugh." },
  { id: 12, x: 52, y: 44, want: "I want to be alone in a way that doesn't feel like failure." },
  { id: 13, x: 38, y: 28, want: "I want to stop being so afraid of being seen." },
  { id: 14, x: 62, y: 36, want: "I want to learn to play piano well enough to cry while playing." },
  { id: 15, x: 44, y: 18, want: "I want to make something that outlasts me." },
  { id: 16, x: 56, y: 52, want: "I want to be at peace with being unremarkable." },
  { id: 17, x: 42, y: 50, want: "I want to be the kind of person who can sit with silence." },

  { id: 18, x: 78, y: 28, want: "I want to fall in love again and not ruin it this time." },
  { id: 19, x: 88, y: 50, want: "I want to be touched without it meaning anything." },
  { id: 20, x: 72, y: 38, want: "I want to be known by one person all the way through." },
  { id: 21, x: 82, y: 42, want: "I want to want sex again." },
  { id: 22, x: 74, y: 22, want: "I want to come home to one person, just consistently." },
  { id: 23, x: 84, y: 32, want: "I want to be loved when I'm boring." },
  { id: 24, x: 80, y: 48, want: "I want to stop falling for people who can't reach me." },

  { id: 25, x: 14, y: 68, want: "I want my father to call me first. Just once." },
  { id: 26, x: 28, y: 80, want: "I want to forgive my mother. I don't actually want to." },
  { id: 27, x: 20, y: 62, want: "I want to be a better parent than mine were. I'm scared I won't be." },
  { id: 28, x: 10, y: 76, want: "I want my brother to call me again." },
  { id: 29, x: 22, y: 84, want: "I want to tell my mother she was cruel, before she dies." },
  { id: 30, x: 30, y: 66, want: "I want my parents to be proud of me without me having to earn it." },

  { id: 31, x: 70, y: 78, want: "I want to learn the names of every tree on my street." },
  { id: 32, x: 62, y: 70, want: "I want to learn to cook one thing perfectly." },
  { id: 33, x: 78, y: 82, want: "I want to read a book slowly for once." },
  { id: 34, x: 72, y: 88, want: "I want to notice when the light changes in the afternoon." },
  { id: 35, x: 84, y: 76, want: "I want to sit with my coffee without checking my phone." },
  { id: 36, x: 66, y: 86, want: "I want to remember more of my life as I live it." },

  { id: 37, x: 40, y: 60, want: "I want to stop hating my body." },
  { id: 38, x: 50, y: 62, want: "I want to forgive the version of me at 22." },
  { id: 39, x: 44, y: 72, want: "I want to stop apologizing for taking up space." },
  { id: 40, x: 54, y: 58, want: "I want to stop pretending I'm fine when I'm not." },
  { id: 41, x: 38, y: 74, want: "I want to drink less without making a whole thing of it." },
  { id: 42, x: 52, y: 76, want: "I want to be kinder to myself when I fail." },

  { id: 43, x: 88, y: 12, want: "I want to do something illegal, just once, just enough to know I could." },
  { id: 44, x: 80, y: 8,  want: "I want to be famous, even though I know it would ruin me." },
  { id: 45, x: 76, y: 14, want: "I want to have an affair. I won't." },
  { id: 46, x: 4,  y: 50, want: "I want to never go back to the job I'm on leave from." },
  { id: 47, x: 66, y: 56, want: "I want to be told what to do, by someone I trust completely." },
  { id: 48, x: 92, y: 22, want: "I want to make a lot of money and not care that it makes me boring." },
  { id: 49, x: 60, y: 92, want: "I want to read every poem by one poet, all the way through." },
];

export const DEFAULT_12 = [0, 10, 1, 25, 11, 12, 18, 2, 26, 3, 19, 31];

let poolEmbeddings = null;
let poolEmbedPromise = null;

export async function embed(texts) {
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

export function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export async function getPoolEmbeddings() {
  if (poolEmbeddings) return poolEmbeddings;
  if (!poolEmbedPromise) {
    poolEmbedPromise = embed(POOL.map(p => p.want))
      .then(e => { poolEmbeddings = e; return e; })
      .catch(e => { poolEmbedPromise = null; throw e; });
  }
  return poolEmbedPromise;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
  }

  const { text, roomIds } = req.body || {};
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'no text' });
  }
  const cleaned = text.trim();
  if (cleaned.length > 600) {
    return res.status(400).json({ error: 'too long' });
  }

  try {
    const [poolEmbs, [userVec]] = await Promise.all([
      getPoolEmbeddings(),
      embed([cleaned]),
    ]);

    // Restrict matching to roomIds if provided (the candles the user actually sees)
    const candidatePool = (Array.isArray(roomIds) && roomIds.length > 0)
      ? POOL.filter(p => roomIds.includes(p.id))
      : POOL;

    const sims = candidatePool.map(p => {
      const poolIdx = POOL.findIndex(x => x.id === p.id);
      return { id: p.id, p, sim: cosine(userVec, poolEmbs[poolIdx]) };
    }).sort((a, b) => b.sim - a.sim);

    const top = sims.slice(0, Math.min(3, sims.length));
    const weights = top.map(t => Math.exp(t.sim * 12));
    const wsum = weights.reduce((a, b) => a + b, 0);
    let x = 0, y = 0;
    top.forEach((t, i) => {
      x += t.p.x * (weights[i] / wsum);
      y += t.p.y * (weights[i] / wsum);
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
