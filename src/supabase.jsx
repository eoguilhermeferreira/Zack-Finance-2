// ─── Supabase Integration ──────────────────────────────────────────────────────
// To enable Supabase, fill in your project URL and anon key below.
// Get these from: https://supabase.com/dashboard → Your Project → Settings → API
//
// Required tables (run in Supabase SQL Editor):
//
// CREATE TABLE transactions (
//   id TEXT PRIMARY KEY,
//   date TEXT NOT NULL,
//   description TEXT,
//   amount NUMERIC,
//   category TEXT,
//   account TEXT,
//   notes TEXT,
//   user_id TEXT,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
//
// CREATE TABLE investments (
//   id TEXT PRIMARY KEY,
//   name TEXT,
//   type TEXT,
//   ticker TEXT,
//   invested NUMERIC,
//   current_value NUMERIC,
//   return_pct NUMERIC,
//   yield_pct NUMERIC,
//   user_id TEXT,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
//
// CREATE TABLE bills (
//   id TEXT PRIMARY KEY,
//   name TEXT,
//   amount NUMERIC,
//   due_day INTEGER,
//   category TEXT,
//   status TEXT,
//   user_id TEXT,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
//
// CREATE TABLE chat_messages (
//   id TEXT PRIMARY KEY,
//   role TEXT,
//   text TEXT,
//   user_id TEXT,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );

// ─── CONFIGURE BELOW ──────────────────────────────────────────────────────────
const SUPABASE_URL      = '';  // e.g. 'https://xyzcompany.supabase.co'
const SUPABASE_ANON_KEY = '';  // e.g. 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
// ─────────────────────────────────────────────────────────────────────────────

const supabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Minimal Supabase REST client (no CDN dependency)
const supabaseClient = (() => {
  const noop = async () => ({ data: null, error: new Error('Supabase not configured') });
  if (!supabaseEnabled) {
    return { from: () => ({ select: noop, insert: noop, update: noop, delete: noop, upsert: noop }) };
  }

  const baseHeaders = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  };

  const req = async (method, table, body, qs = '') => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${qs}`, {
        method,
        headers: { ...baseHeaders, Prefer: 'return=representation' },
        body: body != null ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) return { data: null, error: new Error(`HTTP ${res.status}`) };
      const data = await res.json().catch(() => null);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  return {
    from: (table) => ({
      select: (cols = '*', qs = '') => req('GET', table, null, `?select=${cols}${qs}`),
      insert: (rows) => req('POST', table, Array.isArray(rows) ? rows : [rows]),
      update: (updates, qs = '') => req('PATCH', table, updates, qs),
      delete: (qs = '') => req('DELETE', table, null, qs),
      upsert: (rows) => req('POST', table, Array.isArray(rows) ? rows : [rows], '?on_conflict=id'),
    }),
  };
})();

// ─── Supabase data helpers ─────────────────────────────────────────────────────

async function saveTransaction(txn) {
  if (!supabaseEnabled) return;
  const { error } = await supabaseClient.from('transactions').upsert({
    id: txn.id,
    date: txn.date,
    description: txn.description,
    amount: txn.amount,
    category: txn.category,
    account: txn.account,
    notes: txn.notes || '',
  });
  if (error) console.warn('[Supabase] saveTransaction:', error.message);
}

async function loadTransactions() {
  if (!supabaseEnabled) return null;
  const { data, error } = await supabaseClient.from('transactions').select('*', '&order=date.desc');
  if (error) { console.warn('[Supabase] loadTransactions:', error.message); return null; }
  return data;
}

async function deleteTransactionRemote(id) {
  if (!supabaseEnabled) return;
  const { error } = await supabaseClient.from('transactions').delete(`?id=eq.${id}`);
  if (error) console.warn('[Supabase] deleteTransaction:', error.message);
}

async function saveInvestment(inv) {
  if (!supabaseEnabled) return;
  const { error } = await supabaseClient.from('investments').upsert({
    id: inv.id,
    name: inv.name,
    type: inv.type,
    ticker: inv.ticker,
    invested: inv.invested,
    current_value: inv.current,
    return_pct: inv.returnPct,
    yield_pct: inv.yieldPct,
  });
  if (error) console.warn('[Supabase] saveInvestment:', error.message);
}

async function loadInvestments() {
  if (!supabaseEnabled) return null;
  const { data, error } = await supabaseClient.from('investments').select('*');
  if (error) { console.warn('[Supabase] loadInvestments:', error.message); return null; }
  return data ? data.map(r => ({
    id: r.id, name: r.name, type: r.type, ticker: r.ticker,
    invested: r.invested, current: r.current_value,
    returnPct: r.return_pct, yieldPct: r.yield_pct,
  })) : null;
}

async function saveBill(bill) {
  if (!supabaseEnabled) return;
  const { error } = await supabaseClient.from('bills').upsert({
    id: bill.id,
    name: bill.name,
    amount: bill.amount,
    due_day: bill.dueDay,
    category: bill.category,
    status: bill.status,
  });
  if (error) console.warn('[Supabase] saveBill:', error.message);
}

async function saveChatMessage(msg, userId) {
  if (!supabaseEnabled) return;
  const { error } = await supabaseClient.from('chat_messages').insert({
    id: String(msg.id),
    role: msg.role,
    text: msg.text,
    user_id: userId || 'anonymous',
  });
  if (error) console.warn('[Supabase] saveChatMessage:', error.message);
}
