// ─── Supabase Integration ──────────────────────────────────────────────────────
// Fill in your project URL and anon key to enable Supabase.
// Get them at: https://supabase.com/dashboard → Project → Settings → API
//
// Run this SQL in Supabase SQL Editor to create the required tables:
//
// CREATE TABLE transactions (
//   id TEXT PRIMARY KEY, date TEXT NOT NULL, description TEXT, amount NUMERIC,
//   category TEXT, account TEXT, notes TEXT, user_id UUID REFERENCES auth.users,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
// ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "own" ON transactions USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
//
// CREATE TABLE investments (
//   id TEXT PRIMARY KEY, name TEXT, type TEXT, ticker TEXT, invested NUMERIC,
//   current_value NUMERIC, return_pct NUMERIC, yield_pct NUMERIC,
//   user_id UUID REFERENCES auth.users, created_at TIMESTAMPTZ DEFAULT NOW()
// );
// ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "own" ON investments USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
//
// CREATE TABLE bills (
//   id TEXT PRIMARY KEY, name TEXT, amount NUMERIC, due_day INTEGER,
//   category TEXT, status TEXT, user_id UUID REFERENCES auth.users,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
// ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "own" ON bills USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
//
// CREATE TABLE goals (
//   id TEXT PRIMARY KEY, name TEXT, monthly_target NUMERIC, description TEXT,
//   user_id UUID REFERENCES auth.users, created_at TIMESTAMPTZ DEFAULT NOW()
// );
// ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "own" ON goals USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
//
// CREATE TABLE chat_messages (
//   id TEXT PRIMARY KEY, role TEXT, text TEXT,
//   user_id UUID REFERENCES auth.users, created_at TIMESTAMPTZ DEFAULT NOW()
// );
// ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "own" ON chat_messages USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

// ─── CONFIGURE HERE ───────────────────────────────────────────────────────────
const SUPABASE_URL      = 'https://qkroxfioobhoaezoxwom.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrcm94Zmlvb2Job2Flem94d29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyODg2NDYsImV4cCI6MjA5Mzg2NDY0Nn0.zEXVt_mnHsVC3pK9_oI9Hw1KJo-BG7NC41qGssvUgWk';
// ─────────────────────────────────────────────────────────────────────────────

const supabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// ─── Auth token state ─────────────────────────────────────────────────────────
let _supaToken  = localStorage.getItem('zf-supa-token') || '';
let _supaUserId = localStorage.getItem('zf-supa-uid')   || '';

const _persistAuth = (token, uid) => {
  _supaToken  = token;
  _supaUserId = uid;
  if (token) {
    localStorage.setItem('zf-supa-token', token);
    localStorage.setItem('zf-supa-uid',   uid);
  } else {
    localStorage.removeItem('zf-supa-token');
    localStorage.removeItem('zf-supa-uid');
  }
};

const supaHeaders = () => ({
  'Content-Type':  'application/json',
  'apikey':        SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${_supaToken || SUPABASE_ANON_KEY}`,
});

const supaReq = async (method, path, body) => {
  if (!supabaseEnabled) return { data: null, error: { message: 'Supabase não configurado.' } };
  try {
    const res  = await fetch(`${SUPABASE_URL}${path}`, {
      method,
      headers: { ...supaHeaders(), Prefer: 'return=representation' },
      body:    body != null ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { data: null, error: data };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: err.message } };
  }
};

// ─── Auth API ─────────────────────────────────────────────────────────────────

async function supaSignUp(email, password, name) {
  const { data, error } = await supaReq('POST', '/auth/v1/signup', {
    email,
    password,
    data: { full_name: name || '' },
  });
  if (data?.access_token) _persistAuth(data.access_token, data.user?.id || '');
  return { data, error };
}

async function supaSignIn(email, password) {
  const { data, error } = await supaReq('POST', '/auth/v1/token?grant_type=password', { email, password });
  if (data?.access_token) _persistAuth(data.access_token, data.user?.id || '');
  return { data, error };
}

async function supaSignOut() {
  if (_supaToken) await supaReq('POST', '/auth/v1/logout', {}).catch(() => {});
  _persistAuth('', '');
}

async function supaGetUser() {
  if (!_supaToken) return null;
  const { data } = await supaReq('GET', '/auth/v1/user', null);
  return data?.id ? data : null;
}

// ─── REST client ──────────────────────────────────────────────────────────────
const supabaseClient = (() => {
  const noop = async () => ({ data: null, error: new Error('Supabase not configured') });
  if (!supabaseEnabled) {
    return { from: () => ({ select: noop, insert: noop, update: noop, delete: noop, upsert: noop }) };
  }
  const req = async (method, table, body, qs = '') => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${qs}`, {
        method,
        headers: { ...supaHeaders(), Prefer: 'return=representation' },
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

// ─── Data helpers ─────────────────────────────────────────────────────────────

async function saveTransaction(txn) {
  if (!supabaseEnabled) return;
  await supabaseClient.from('transactions').upsert({
    id: txn.id, date: txn.date, description: txn.description,
    amount: txn.amount, category: txn.category, account: txn.account,
    notes: txn.notes || '', user_id: _supaUserId || undefined,
  });
}

async function loadTransactions() {
  if (!supabaseEnabled || !_supaUserId) return null;
  const { data } = await supabaseClient.from('transactions').select('*', `&order=date.desc&user_id=eq.${_supaUserId}`);
  return data;
}

async function deleteTransactionRemote(id) {
  if (!supabaseEnabled) return;
  await supabaseClient.from('transactions').delete(`?id=eq.${id}`);
}

async function saveInvestment(inv) {
  if (!supabaseEnabled) return;
  await supabaseClient.from('investments').upsert({
    id: inv.id, name: inv.name, type: inv.type, ticker: inv.ticker,
    invested: inv.invested, current_value: inv.current,
    return_pct: inv.returnPct, yield_pct: inv.yieldPct,
    user_id: _supaUserId || undefined,
  });
}

async function loadInvestments() {
  if (!supabaseEnabled || !_supaUserId) return null;
  const { data } = await supabaseClient.from('investments').select('*', `&user_id=eq.${_supaUserId}`);
  return data ? data.map(r => ({
    id: r.id, name: r.name, type: r.type, ticker: r.ticker,
    invested: r.invested, current: r.current_value,
    returnPct: r.return_pct, yieldPct: r.yield_pct,
  })) : null;
}

async function saveBill(bill) {
  if (!supabaseEnabled) return;
  await supabaseClient.from('bills').upsert({
    id: bill.id, name: bill.name, amount: bill.amount,
    due_day: bill.dueDay, category: bill.category, status: bill.status,
    user_id: _supaUserId || undefined,
  });
}

async function loadBills() {
  if (!supabaseEnabled || !_supaUserId) return null;
  const { data } = await supabaseClient.from('bills').select('*', `&user_id=eq.${_supaUserId}`);
  return data ? data.map(r => ({
    id: r.id, name: r.name, amount: r.amount,
    dueDay: r.due_day, category: r.category, status: r.status,
  })) : null;
}

async function saveGoal(goal) {
  if (!supabaseEnabled) return;
  await supabaseClient.from('goals').upsert({
    id: goal.id, name: goal.name, monthly_target: goal.monthlyTarget,
    description: goal.description || '', user_id: _supaUserId || undefined,
  });
}

async function loadGoals() {
  if (!supabaseEnabled || !_supaUserId) return null;
  const { data } = await supabaseClient.from('goals').select('*', `&user_id=eq.${_supaUserId}`);
  return data ? data.map(r => ({
    id: r.id, name: r.name, monthlyTarget: r.monthly_target, description: r.description,
  })) : null;
}

async function deleteGoalRemote(id) {
  if (!supabaseEnabled) return;
  await supabaseClient.from('goals').delete(`?id=eq.${id}`);
}

async function saveChatMessage(msg) {
  if (!supabaseEnabled) return;
  await supabaseClient.from('chat_messages').insert({
    id: String(msg.id), role: msg.role, text: msg.text,
    user_id: _supaUserId || undefined,
  });
}
