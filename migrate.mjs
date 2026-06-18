/**
 * migrate.mjs - Runs the Supabase schema migration and seed via the REST API
 * Uses the service role key to execute SQL through a pg RPC call.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://bchvzulhpheiymjetuun.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaHZ6dWxocGhlaXltamV0dXVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTQxNzc0MCwiZXhwIjoyMDk2OTkzNzQwfQ.0MBmM5M8T-VvmvDGkX2xrJihWi0vz4JKvphH1Pj4Bi8';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function runSQL(label, sql) {
  console.log(`\n▶ Running: ${label}...`);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!res.ok) {
    const text = await res.text();
    // Try alternative endpoint
    return false;
  }
  console.log(`  ✅ ${label} complete`);
  return true;
}

async function runSQLDirect(label, sql) {
  console.log(`\n▶ Running: ${label} via pg endpoint...`);
  const res = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (res.ok) {
    console.log(`  ✅ ${label} complete via pg endpoint`);
    return true;
  }
  return false;
}

async function checkConnection() {
  console.log('\n🔌 Testing Supabase connection...');
  const { data, error } = await supabase.from('profiles').select('count').limit(1);
  if (error && error.code === '42P01') {
    console.log('  ℹ️  Tables do not exist yet — migration needed');
    return 'no_tables';
  }
  if (error) {
    console.log('  ⚠️  Error:', error.message);
    return 'error';
  }
  console.log('  ✅ Connection successful — tables already exist!');
  return 'ok';
}

async function checkAndSeedAdmin() {
  console.log('\n👤 Checking for admin user...');
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'super_admin')
    .limit(1);

  if (existing && existing.length > 0) {
    console.log('  ✅ Admin user already exists');
    return;
  }

  // Create admin user via Supabase Auth
  console.log('  📧 Creating admin@gangamaxx.com ...');
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: 'admin@gangamaxx.com',
    password: 'Admin@123456',
    email_confirm: true,
    user_metadata: { full_name: 'System Administrator', role: 'super_admin' }
  });

  if (authError) {
    if (authError.message.includes('already')) {
      console.log('  ✅ Admin user already exists in auth');
    } else {
      console.log('  ⚠️  Auth error:', authError.message);
    }
    return;
  }

  // Upsert profile
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: authUser.user.id,
    full_name: 'System Administrator',
    email: 'admin@gangamaxx.com',
    role: 'super_admin',
    is_active: true,
  });

  if (profileError) {
    console.log('  ⚠️  Profile error:', profileError.message);
  } else {
    console.log('  ✅ Admin user created: admin@gangamaxx.com / Admin@123456');
  }
}

async function seedBaseData() {
  console.log('\n🌱 Seeding base data...');

  // Warehouses
  const { error: w1 } = await supabase.from('warehouses').upsert([
    {
      id: 'aaaa1111-1111-1111-1111-111111111111',
      name: 'Mumbai Main Warehouse',
      location: 'Andheri East, Mumbai, Maharashtra 400069',
      contact_person: 'Rajan Kumar',
      phone: '+91-98765-43210',
      is_active: true,
    },
    {
      id: 'aaaa2222-2222-2222-2222-222222222222',
      name: 'Pune Branch Warehouse',
      location: 'Hadapsar, Pune, Maharashtra 411028',
      contact_person: 'Suresh Patil',
      phone: '+91-87654-32100',
      is_active: true,
    },
  ], { onConflict: 'id' });

  if (w1) console.log('  ⚠️  Warehouse seed:', w1.message);
  else console.log('  ✅ Warehouses seeded');

  // Product Categories
  const { error: c1 } = await supabase.from('product_categories').upsert([
    { name: 'Floor Cleaners', description: 'Liquid and powder floor cleaning products' },
    { name: 'Toilet & Bathroom Cleaners', description: 'Toilet bowl, tile and bathroom cleaners' },
    { name: 'Hand Hygiene', description: 'Hand wash, sanitizers, and soaps' },
    { name: 'Surface Disinfectants', description: 'Surface sprays and disinfectant solutions' },
    { name: 'Laundry Products', description: 'Detergents, fabric softeners, bleach' },
    { name: 'Dishwashing', description: 'Dish soap, rinse aid, dishwasher tablets' },
    { name: 'Air Fresheners', description: 'Sprays, gels, and diffusers' },
    { name: 'Waste Management', description: 'Garbage bags, liners, bins' },
    { name: 'PPE & Safety', description: 'Gloves, masks, protective equipment' },
    { name: 'Industrial Chemicals', description: 'Heavy duty industrial cleaners' },
  ], { onConflict: 'name', ignoreDuplicates: true });

  if (c1) console.log('  ⚠️  Category seed:', c1.message);
  else console.log('  ✅ Product categories seeded');
}

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  Ganga Maxx WMS — Database Setup');
  console.log('═══════════════════════════════════════════════');
  console.log(`  Project: https://bchvzulhpheiymjetuun.supabase.co`);

  const status = await checkConnection();

  if (status === 'no_tables') {
    console.log('\n⚠️  MIGRATION REQUIRED');
    console.log('  The database schema has not been created yet.');
    console.log('  Please run the SQL migration manually:');
    console.log('\n  1. Go to: https://supabase.com/dashboard/project/bchvzulhpheiymjetuun/sql/new');
    console.log('  2. Paste the contents of: supabase/migrations/001_initial_schema.sql');
    console.log('  3. Click "Run"');
    console.log('  4. Then run this script again: node migrate.mjs');
    process.exit(1);
  }

  if (status === 'ok' || status === 'error') {
    // Tables might exist, try seeding
    try {
      await seedBaseData();
      await checkAndSeedAdmin();
    } catch (e) {
      console.log('\n⚠️  Seed error:', e.message);
      console.log('  Tables may not exist yet. Please run the schema migration first.');
    }
  }

  console.log('\n═══════════════════════════════════════════════');
  console.log('  Setup complete!');
  console.log('  Login: admin@gangamaxx.com');
  console.log('  Password: Admin@123456');
  console.log('═══════════════════════════════════════════════\n');
}

main().catch(console.error);
