import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const distPath = path.join(__dirname, 'dist');

// Respect Cloud Run / reverse-proxy headers for accurate client IP rate limiting
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

// Baseline security headers (preserve iframe embedding compatibility)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Server-side Supabase configuration (optional; enables Express micro-caching & rate limiting)
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const PROXY_CONFIGURED = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes('placeholder-url') &&
    /^https?:\/\//i.test(SUPABASE_URL)
);

// Single-flight in-memory micro-cache to shield Supabase Free tier from traffic spikes
const responseCache = new Map();
const inFlightRequests = new Map();
const MAX_CACHE_ENTRIES = 100;

function getCached(key) {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key, data, ttlMs) {
  if (responseCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey) responseCache.delete(oldestKey);
  }
  responseCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

async function fetchWithSingleFlight(cacheKey, ttlMs, fetcher) {
  const hit = getCached(cacheKey);
  if (hit !== null) return { data: hit, cacheHit: true };

  const pending = inFlightRequests.get(cacheKey);
  if (pending) {
    const data = await pending;
    return { data, cacheHit: true };
  }

  const promise = (async () => {
    const data = await fetcher();
    setCached(cacheKey, data, ttlMs);
    return data;
  })();

  inFlightRequests.set(cacheKey, promise);
  try {
    const data = await promise;
    return { data, cacheHit: false };
  } finally {
    inFlightRequests.delete(cacheKey);
  }
}

async function supabaseRestGet(relativePath) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${relativePath}`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      const err = new Error(`Supabase REST error (${res.status}): ${errBody.slice(0, 200)}`);
      err.status = res.status;
      throw err;
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

// Sliding-window rate limiter (IP + voter token) to block automated vote floods
const ipRateWindows = new Map();
const tokenRateWindows = new Map();

function checkSlidingLimit(store, key, maxRequests, windowMs) {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) {
    return false;
  }
  entry.count += 1;
  return true;
}

// Periodically prune expired rate-limit entries
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of ipRateWindows.entries()) {
    if (now >= v.resetAt) ipRateWindows.delete(k);
  }
  for (const [k, v] of tokenRateWindows.entries()) {
    if (now >= v.resetAt) tokenRateWindows.delete(k);
  }
}, 60_000).unref();

// Health check
app.get('/api/health', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ ok: true, proxyConfigured: PROXY_CONFIGURED });
});

// Strict allowlist of cacheable read-only public CMS resources
const CMS_RESOURCE_QUERIES = {
  hero_slides: 'hero_slides?select=*&order=display_order.asc',
  packages: 'packages?select=*&order=created_at.desc',
  road_trips: 'road_trips?select=*&order=start_date.asc',
  destinations: 'destinations?select=*&order=name.asc',
  gallery: 'gallery?select=*&order=created_at.desc',
  testimonials: 'testimonials?select=*&order=created_at.desc',
  faqs: 'faqs?select=*&order=display_order.asc',
  website_settings: 'website_settings?select=*&limit=1',
  events: 'events?select=*&is_active=eq.true&order=event_date.asc',
  merch: 'merch?select=*&order=display_order.asc',
  'homepage-hero-videos': 'categories?select=description&slug=eq.homepage-hero-videos&limit=1',
  'homepage-why-choose-us': 'categories?select=description&slug=eq.homepage-why-choose-us&limit=1',
  'homepage-experiences': 'categories?select=description&slug=eq.homepage-experiences&limit=1',
  'auth-page-background': 'categories?select=description&slug=eq.auth-page-background&limit=1',
};

// Cached public poll definitions (30s micro-cache)
app.get('/api/public/polls', async (_req, res) => {
  if (!PROXY_CONFIGURED) {
    return res.status(503).json({ error: 'Proxy not configured' });
  }
  try {
    const { data, cacheHit } = await fetchWithSingleFlight('polls', 30_000, async () => {
      const rows = await supabaseRestGet('categories?select=description&slug=eq.homepage-culture-polls&limit=1');
      const desc = rows?.[0]?.description;
      if (!desc) return [];
      try {
        const parsed = JSON.parse(desc);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    });
    res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=30, stale-while-revalidate=30');
    res.setHeader('X-Cache', cacheHit ? 'HIT' : 'MISS');
    return res.json({ polls: data });
  } catch (err) {
    return res.status(err.status || 502).json({ error: 'Failed to load polls' });
  }
});

// Cached lightweight aggregated tallies (2s server micro-cache; zero raw voter data)
app.get('/api/public/tallies', async (_req, res) => {
  if (!PROXY_CONFIGURED) {
    return res.status(503).json({ error: 'Proxy not configured' });
  }
  try {
    const { data, cacheHit } = await fetchWithSingleFlight('tallies', 2_000, async () => {
      return await supabaseRestGet('culture_poll_tallies?select=poll_id,option_id,vote_count');
    });
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=2, must-revalidate');
    res.setHeader('X-Cache', cacheHit ? 'HIT' : 'MISS');
    return res.json({ tallies: Array.isArray(data) ? data : [] });
  } catch (err) {
    return res.status(err.status || 502).json({ error: 'Failed to load tallies' });
  }
});

// Cached read-only public CMS endpoints (60s micro-cache)
app.get('/api/public/cms/:resource', async (req, res) => {
  if (!PROXY_CONFIGURED) {
    return res.status(503).json({ error: 'Proxy not configured' });
  }
  const resource = req.params.resource;
  const queryPath = CMS_RESOURCE_QUERIES[resource];
  if (!queryPath) {
    return res.status(404).json({ error: 'Unknown resource' });
  }
  try {
    const { data, cacheHit } = await fetchWithSingleFlight(`cms:${resource}`, 60_000, async () => {
      return await supabaseRestGet(queryPath);
    });
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120');
    res.setHeader('X-Cache', cacheHit ? 'HIT' : 'MISS');
    return res.json({ data });
  } catch (err) {
    return res.status(err.status || 502).json({ error: 'Failed to load resource' });
  }
});

// NEVER cached vote submission endpoint with rate limiting + atomic Postgres RPC forwarding
app.post('/api/public/vote', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!PROXY_CONFIGURED) {
    return res.status(503).json({ error: 'Proxy not configured' });
  }

  const pollId = typeof req.body?.pollId === 'string' ? req.body.pollId.trim() : '';
  const optionId = typeof req.body?.optionId === 'string' ? req.body.optionId.trim() : '';
  const voterToken = typeof req.body?.voterToken === 'string' ? req.body.voterToken.trim() : '';

  if (!pollId || !optionId || voterToken.length < 8 || voterToken.length > 128) {
    return res.status(400).json({ ok: false, error: 'Invalid vote request parameters.' });
  }

  const clientIp = req.ip || 'unknown';
  if (!checkSlidingLimit(tokenRateWindows, voterToken, 8, 30_000)) {
    return res.status(429).json({
      ok: false,
      rateLimited: true,
      error: 'Too many voting attempts from your session. Please wait a few seconds and try again.',
    });
  }
  if (!checkSlidingLimit(ipRateWindows, clientIp, 30, 60_000)) {
    return res.status(429).json({
      ok: false,
      rateLimited: true,
      error: 'High voting traffic from your network right now. Please wait a moment and retry.',
    });
  }

  // Preserve authenticated user JWT if provided (never accept arbitrary user_id from body)
  const authHeader = req.headers.authorization;
  const bearerHeader =
    typeof authHeader === 'string' && authHeader.startsWith('Bearer ') && authHeader.length < 4096
      ? authHeader
      : `Bearer ${SUPABASE_ANON_KEY}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/cast_culture_vote`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: bearerHeader,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        p_poll_id: pollId,
        p_option_id: optionId,
        p_voter_token: voterToken,
      }),
      signal: controller.signal,
    });

    if (!rpcRes.ok) {
      return res.status(rpcRes.status >= 500 ? 502 : rpcRes.status).json({
        ok: false,
        error: 'Unable to record vote right now. Please retry.',
      });
    }

    const result = await rpcRes.json();

    // Immediately bust tally micro-cache when a vote succeeds so viewers see fresh totals
    if (result?.ok) {
      responseCache.delete('tallies');
    }

    return res.json(result);
  } catch {
    return res.status(504).json({
      ok: false,
      error: 'Vote request timed out under load. Please tap again to retry.',
    });
  } finally {
    clearTimeout(timeout);
  }
});

// Admin-authenticated cache invalidation when polls or CMS records are updated
app.post('/api/public/cache/invalidate', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!PROXY_CONFIGURED) {
    return res.status(200).json({ ok: true, skipped: true });
  }

  const authHeader = req.headers.authorization;
  if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: authHeader,
      },
    });
    if (!userRes.ok) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    const user = await userRes.json();
    if (!user?.id) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const profileRes = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=role&id=eq.${encodeURIComponent(user.id)}&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: authHeader,
          Accept: 'application/json',
        },
      }
    );
    const profiles = profileRes.ok ? await profileRes.json() : [];
    const role = profiles?.[0]?.role;
    const allowedRoles = new Set(['Super Admin', 'Admin', 'Editor', 'Content Manager', 'Marketing Manager']);
    if (!allowedRoles.has(role)) {
      return res.status(403).json({ error: 'Admin privileges required' });
    }

    const targets = Array.isArray(req.body?.targets) ? req.body.targets : ['polls', 'tallies'];
    for (const target of targets) {
      if (target === 'polls') responseCache.delete('polls');
      else if (target === 'tallies') responseCache.delete('tallies');
      else if (target === 'cms') {
        for (const key of responseCache.keys()) {
          if (key.startsWith('cms:')) responseCache.delete(key);
        }
      }
    }

    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: 'Cache invalidation failed' });
  }
});

// Long-term immutable cache for Vite content-hashed assets
app.use(
  '/assets',
  express.static(path.join(distPath, 'assets'), {
    maxAge: '365d',
    immutable: true,
    index: false,
  })
);

// Serve other static files from the production build directory
app.use(
  express.static(distPath, {
    maxAge: '1d',
    index: false,
  })
);

// SPA Fallback: Serve index.html with no-cache so deploys take effect immediately
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><meta http-equiv="refresh" content="2"><title>Loading...</title></head>
        <body style="font-family:sans-serif;background:#08121B;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
          <p>Starting up Certified Adventures...</p>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Certified Adventures server running on http://0.0.0.0:${PORT}`);
});
