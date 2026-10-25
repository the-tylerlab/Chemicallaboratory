/**
 * @file test_live_http_headers_and_cors.js
 * @description Verifies real production security headers and CORS behavior
 * against an actual live HTTP server instance.
 */

const http = require('http');
const path = require('path');

// Ensure environment is set
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = '6217be650090ad98b19c98a4ffbec21f5d0a2f1d24480a969bf4190ab3f41dbed7a1e31e520250ab32ed43a5dcf06c4b35cb0ac54358efc40e6eeb67c8757bfc';
}

const app = require('../server.js');

function sendHttpRequest(port, options = {}) {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: '127.0.0.1',
      port: port,
      path: options.path || '/',
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function run() {
  console.log("===============================================================");
  console.log("🌐 LIVE HTTP RESPONSE: SECURITY HEADERS & CORS VERIFICATION");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message, detail = "") {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  }

  // Start live server on an ephemeral port
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  console.log(`📡 Temporary test HTTP server listening on http://127.0.0.1:${port}\n`);

  try {
    // -------------------------------------------------------------
    // 1. Basic Security Headers on Root / API Responses
    // -------------------------------------------------------------
    console.log("--- 1. HTTP Security Headers Inspection ---");
    const res = await sendHttpRequest(port, { path: '/api/config' });

    assert(
      res.headers['x-content-type-options'] === 'nosniff',
      'X-Content-Type-Options is set to "nosniff"',
      `Actual: ${res.headers['x-content-type-options']}`
    );

    assert(
      !res.headers['x-powered-by'],
      'X-Powered-By header is stripped (zero technology disclosure)',
      `Actual: ${res.headers['x-powered-by'] || 'None'}`
    );

    assert(
      res.headers['referrer-policy'] === 'strict-origin-when-cross-origin',
      'Referrer-Policy is set to "strict-origin-when-cross-origin"',
      `Actual: ${res.headers['referrer-policy']}`
    );

    assert(
      res.headers['permissions-policy'] === 'camera=(self), microphone=(), geolocation=()',
      'Permissions-Policy restricts microphone and geolocation',
      `Actual: ${res.headers['permissions-policy']}`
    );

    const csp = res.headers['content-security-policy'] || '';
    assert(
      csp.includes("default-src 'self'") && csp.includes("base-uri 'self'") && csp.includes("object-src 'none'"),
      'Content-Security-Policy contains strong baseline directives (default-src, base-uri, object-src)',
      `Actual CSP: ${csp.slice(0, 100)}...`
    );

    // -------------------------------------------------------------
    // 2. CORS Allowed Origin Tests
    // -------------------------------------------------------------
    console.log("\n--- 2. CORS Policy Inspection (Allowed Origins) ---");

    // A. Production Vercel Domain
    const resProdCors = await sendHttpRequest(port, {
      path: '/api/config',
      headers: { 'Origin': 'https://chemicallab.vercel.app' }
    });
    assert(
      resProdCors.headers['access-control-allow-origin'] === 'https://chemicallab.vercel.app',
      'CORS allows registered production domain https://chemicallab.vercel.app',
      `Actual: ${resProdCors.headers['access-control-allow-origin']}`
    );
    assert(
      resProdCors.headers['access-control-allow-credentials'] === 'true',
      'CORS permits credentials for authorized production domain'
    );

    // B. Local Development Origin
    const resLocalCors = await sendHttpRequest(port, {
      path: '/api/config',
      headers: { 'Origin': 'http://localhost:3000' }
    });
    assert(
      resLocalCors.headers['access-control-allow-origin'] === 'http://localhost:3000',
      'CORS allows localhost development origins',
      `Actual: ${resLocalCors.headers['access-control-allow-origin']}`
    );

    // -------------------------------------------------------------
    // 3. CORS Unauthorized Origin Rejection
    // -------------------------------------------------------------
    console.log("\n--- 3. CORS Policy Inspection (Unauthorized Origins) ---");

    const resEvilCors = await sendHttpRequest(port, {
      path: '/api/config',
      headers: { 'Origin': 'https://malicious-phishing-site.attacker.com' }
    });
    assert(
      !resEvilCors.headers['access-control-allow-origin'],
      'CORS strictly blocks unauthorized origin (no Access-Control-Allow-Origin header returned)',
      `Actual: ${resEvilCors.headers['access-control-allow-origin'] || 'Blocked / Null'}`
    );

    // Preflight OPTIONS Request from evil origin
    const resEvilOptions = await sendHttpRequest(port, {
      path: '/api/items',
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://malicious-phishing-site.attacker.com',
        'Access-Control-Request-Method': 'POST'
      }
    });
    assert(
      !resEvilOptions.headers['access-control-allow-origin'],
      'CORS preflight OPTIONS strictly blocks unauthorized origin',
      `Actual: ${resEvilOptions.headers['access-control-allow-origin'] || 'Blocked / Null'}`
    );

    // -------------------------------------------------------------
    // 4. Production Security Headers Simulation
    // -------------------------------------------------------------
    console.log("\n--- 4. Production Security Headers Verification ---");
    // Verify that vercel.json contains the explicit production HSTS & Frame-Options DENY
    const vercelConfig = require('../vercel.json');
    const staticRoute = vercelConfig.routes.find(r => r.src === '/(.*)' && r.headers);
    assert(
      staticRoute && staticRoute.headers['Strict-Transport-Security'] === 'max-age=63072000; includeSubDomains; preload',
      'Vercel configuration enforces Strict-Transport-Security (HSTS 2-year preload)'
    );
    assert(
      staticRoute && staticRoute.headers['X-Frame-Options'] === 'DENY',
      'Vercel configuration enforces X-Frame-Options: DENY against clickjacking'
    );

  } finally {
    server.close();
  }

  console.log("\n===============================================================");
  console.log(`TOTAL TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log("===============================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
