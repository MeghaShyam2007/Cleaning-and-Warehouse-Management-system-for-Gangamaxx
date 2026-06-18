// Test all major endpoints
const BASE = 'http://localhost:3001/api';

async function run() {
  // Login
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gangamaxx.com', password: 'Admin@123456' })
  });
  const loginData = await loginRes.json();
  if (!loginData.success) { console.log('LOGIN FAILED:', loginData); process.exit(1); }
  const token = loginData.data.session.access_token;
  const h = { Authorization: `Bearer ${token}` };
  console.log('✅ Login OK - Role:', loginData.data.user.role);

  // Test endpoints
  const tests = [
    '/products?page=1&limit=5',
    '/stock',
    '/orders?limit=5',
    '/institutions?limit=5',
    '/reports/stock-summary',
    '/warehouses',
  ];

  for (const path of tests) {
    try {
      const r = await fetch(`${BASE}${path}`, { headers: h });
      const body = await r.json();
      if (r.ok) {
        const count = Array.isArray(body.data) ? body.data.length : (body.data?.items?.length ?? '?');
        console.log(`✅ ${path} -> ${r.status} (${count} items)`);
      } else {
        console.log(`❌ ${path} -> ${r.status}:`, body.error || body);
      }
    } catch(e) {
      console.log(`❌ ${path} -> FETCH ERROR:`, e.message);
    }
  }
}

run().catch(console.error);
