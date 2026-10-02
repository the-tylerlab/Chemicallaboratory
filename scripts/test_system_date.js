/**
 * Test Suite: System Date Provider & Test Injection Verification
 * Verifies that:
 * 1. Production uses real-time current date/time (new Date())
 * 2. Demo/Test allows injection strictly via test configuration:
 *    - window.__TEST_CONFIG__.simulatedDate
 *    - window.__SIMULATED_DATE__
 *    - window.location.search (?testDate=...)
 *    - globalThis.__TEST_CONFIG__.simulatedDate
 * 3. No hardcoded simulated date (2026-05-28) remains in production logic
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting System Date Provider & Injection Tests...\n');

// 1. Verify absence of hardcoded 2026-05-28 in production logic
const appJsPath = path.join(__dirname, '..', 'app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

const matches = [];
const lines = appJsContent.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('2026-05-28')) {
    matches.push({ line: idx + 1, content: line.trim() });
  }
});

console.log('1. Checking for hardcoded 2026-05-28 in app.js:');
if (matches.length > 0) {
  console.error('❌ Found hardcoded 2026-05-28 at:');
  matches.forEach(m => console.error(`   Line ${m.line}: ${m.content}`));
  process.exit(1);
} else {
  console.log('   ✅ No occurrences of 2026-05-28 found in app.js!\n');
}

// 2. Extract getSystemDate, getSystemISODate, and TODAY from app.js to test runtime behavior
const vm = require('vm');

function createSandbox(windowContext = {}) {
  const sandbox = {
    window: windowContext,
    globalThis: {},
    console: console,
    Date: Date,
    URLSearchParams: URLSearchParams,
    Proxy: Proxy,
    Symbol: Symbol,
    isNaN: isNaN,
    String: String
  };
  sandbox.globalThis = sandbox;
  return sandbox;
}

// Extract provider snippet from app.js
const providerSnippet = appJsContent.substring(
  appJsContent.indexOf('function getSystemDate()'),
  appJsContent.indexOf('// Helper to format currency')
);

// Test A: Production Mode (no test config injected)
{
  const sandbox = createSandbox({});
  vm.createContext(sandbox);
  vm.runInContext(providerSnippet, sandbox);

  const realNow = new Date();
  const systemDate = sandbox.getSystemDate();
  const diffMs = Math.abs(systemDate.getTime() - realNow.getTime());

  assert(diffMs < 2000, `Production getSystemDate() should return current real time. Diff was ${diffMs}ms`);
  console.log('2. Production Mode:');
  console.log(`   ✅ getSystemDate() returned real current time: ${systemDate.toISOString()} (within ${diffMs}ms of now)`);
  console.log(`   ✅ getSystemISODate() returned: ${sandbox.getSystemISODate()}`);
  console.log(`   ✅ TODAY.getFullYear() returned current year: ${sandbox.TODAY.getFullYear()}\n`);
}

// Test B: Demo/Test Mode with window.__TEST_CONFIG__.simulatedDate
{
  const sandbox = createSandbox({
    __TEST_CONFIG__: { simulatedDate: '2027-03-15T09:00:00.000Z' }
  });
  vm.createContext(sandbox);
  vm.runInContext(providerSnippet, sandbox);

  const injected = sandbox.getSystemDate();
  assert.strictEqual(sandbox.getSystemISODate(), '2027-03-15');
  assert.strictEqual(sandbox.TODAY.getFullYear(), 2027);
  assert.strictEqual(sandbox.TODAY.getMonth(), 2); // March is 2

  console.log('3. Test Config Injection (window.__TEST_CONFIG__.simulatedDate):');
  console.log(`   ✅ getSystemDate() recognized injected date: ${injected.toISOString()}`);
  console.log(`   ✅ TODAY proxy evaluates to injected date: ${sandbox.TODAY.toISOString()}\n`);
}

// Test C: Test Mode with URL Parameter (?testDate=2028-01-01)
{
  const sandbox = createSandbox({
    location: { search: '?testDate=2028-01-01' }
  });
  vm.createContext(sandbox);
  vm.runInContext(providerSnippet, sandbox);

  assert.strictEqual(sandbox.getSystemISODate(), '2028-01-01');
  assert.strictEqual(sandbox.TODAY.getFullYear(), 2028);

  console.log('4. URL Parameter Injection (?testDate=2028-01-01):');
  console.log(`   ✅ URL query injection successfully parsed: ${sandbox.getSystemISODate()}\n`);
}

// Test D: Dynamic Behavior (updates in real-time or when config changes)
{
  const testWindow = { __TEST_CONFIG__: { simulatedDate: '2026-11-01' } };
  const sandbox = createSandbox(testWindow);
  vm.createContext(sandbox);
  vm.runInContext(providerSnippet, sandbox);

  assert.strictEqual(sandbox.getSystemISODate(), '2026-11-01');
  // Mutate test configuration dynamically
  testWindow.__TEST_CONFIG__.simulatedDate = '2026-12-25';
  assert.strictEqual(sandbox.getSystemISODate(), '2026-12-25');
  assert.strictEqual(sandbox.TODAY.getMonth(), 11); // December is 11

  // Remove test configuration -> reverts to real system time
  delete testWindow.__TEST_CONFIG__;
  const currentYear = new Date().getFullYear();
  assert.strictEqual(sandbox.TODAY.getFullYear(), currentYear);

  console.log('5. Dynamic Switching & Reversion:');
  console.log('   ✅ Injected test dates update reactively');
  console.log('   ✅ Reverts to real system date immediately when test config is removed\n');
}

console.log('🎉 ALL SYSTEM DATE TESTS PASSED SUCCESSFULLY!');
