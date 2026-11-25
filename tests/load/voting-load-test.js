import http from 'k6/http';
import { check, fail, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

/**
 * Controlled Staging Load Test for Certified Adventures Voting
 *
 * Usage (staging / approved maintenance window ONLY):
 *   k6 run \
 *     -e STAGING_BASE_URL="https://your-staging-url.example.com" \
 *     -e TEST_POLL_ID="poll-123456" \
 *     -e TEST_OPTION_IDS="opt-1,opt-2,opt-3" \
 *     tests/load/voting-load-test.js
 *
 * Optional:
 *   -e LOAD_PROFILE=smoke|staging|stress   (default: staging)
 *   -e TEST_DUPLICATE_REJECTION=true|false (default: true)
 */

const BASE_URL = (__ENV.STAGING_BASE_URL || '').replace(/\/+$/, '');
const POLL_ID = __ENV.TEST_POLL_ID || '';
const OPTION_IDS = (__ENV.TEST_OPTION_IDS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const LOAD_PROFILE = __ENV.LOAD_PROFILE || 'staging';
const TEST_DUPLICATE_REJECTION = (__ENV.TEST_DUPLICATE_REJECTION || 'true') === 'true';

const voteSuccessRate = new Rate('vote_success_rate');
const duplicateBlockedCount = new Counter('duplicate_blocked_count');
const rateLimitedCount = new Counter('rate_limited_count');
const voteDuration = new Trend('vote_duration_ms');

const PROFILES = {
  smoke: [
    { duration: '20s', target: 20 },
    { duration: '20s', target: 0 },
  ],
  staging: [
    { duration: '30s', target: 50 },
    { duration: '45s', target: 150 },
    { duration: '45s', target: 300 },
    { duration: '30s', target: 500 },
    { duration: '30s', target: 0 },
  ],
  stress: [
    { duration: '30s', target: 100 },
    { duration: '45s', target: 300 },
    { duration: '45s', target: 600 },
    { duration: '45s', target: 1000 },
    { duration: '30s', target: 0 },
  ],
};

export const options = {
  stages: PROFILES[LOAD_PROFILE] || PROFILES.staging,
  thresholds: {
    http_req_failed: [{ threshold: 'rate<0.05', abortOnFail: true, delayAbortEval: '15s' }],
    http_req_duration: ['p(95)<1500', 'p(99)<3000'],
    vote_success_rate: ['rate>0.95'],
  },
};

export function setup() {
  if (!BASE_URL || !POLL_ID || OPTION_IDS.length === 0) {
    fail(
      'Missing required env vars: STAGING_BASE_URL, TEST_POLL_ID, and TEST_OPTION_IDS must be set before running.'
    );
  }

  const healthRes = http.get(`${BASE_URL}/api/health`);
  check(healthRes, {
    'health endpoint reachable (200)': (r) => r.status === 200,
    'server proxy configured': (r) => {
      try {
        return JSON.parse(r.body).proxyConfigured === true;
      } catch {
        return false;
      }
    },
  });
}

export default function () {
  // 1. Visitor loads poll definitions + lightweight tallies (cached on Express)
  const pollsRes = http.get(`${BASE_URL}/api/public/polls`, {
    tags: { endpoint: 'polls' },
  });
  check(pollsRes, {
    'polls 200': (r) => r.status === 200,
  });

  const talliesRes = http.get(`${BASE_URL}/api/public/tallies`, {
    tags: { endpoint: 'tallies' },
  });
  check(talliesRes, {
    'tallies 200': (r) => r.status === 200,
  });

  // Realistic human reading pause before clicking a vote option
  sleep(1 + Math.random() * 2);

  // 2. Submit a unique vote (note: Express IP limiter allows 30/min/IP;
  // in distributed k6 tests use multiple runner IPs or tune staging IP test allowance)
  const voterToken = `k6_${__VU}_${__ITER}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const optionId = OPTION_IDS[(__VU + __ITER) % OPTION_IDS.length];

  const payload = JSON.stringify({
    pollId: POLL_ID,
    optionId,
    voterToken,
  });

  const voteRes = http.post(`${BASE_URL}/api/public/vote`, payload, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    tags: { endpoint: 'vote' },
  });

  voteDuration.add(voteRes.timings.duration);

  if (voteRes.status === 429) {
    rateLimitedCount.add(1);
    return;
  }

  let parsed = null;
  try {
    parsed = JSON.parse(voteRes.body);
  } catch {
    parsed = null;
  }

  const ok = voteRes.status === 200 && Boolean(parsed?.ok);
  voteSuccessRate.add(ok);

  check(voteRes, {
    'vote accepted (200 ok)': () => ok,
    'vote returned updated tallies': () => Array.isArray(parsed?.tallies),
  });

  // 3. Verify server-side duplicate prevention on sample iterations
  if (ok && TEST_DUPLICATE_REJECTION && __ITER % 5 === 0) {
    const dupRes = http.post(`${BASE_URL}/api/public/vote`, payload, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      tags: { endpoint: 'vote_duplicate' },
    });
    try {
      const dupJson = JSON.parse(dupRes.body);
      if (dupJson?.already_voted === true && dupJson?.ok === false) {
        duplicateBlockedCount.add(1);
      }
      check(dupRes, {
        'duplicate vote blocked server-side': () => dupJson?.already_voted === true && dupJson?.ok === false,
      });
    } catch {
      // Ignore parse failure
    }
  }

  // 4. Visitor sees refreshed tallies
  http.get(`${BASE_URL}/api/public/tallies`, { tags: { endpoint: 'tallies_post_vote' } });

  sleep(2 + Math.random() * 3);
}
