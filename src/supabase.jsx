// ─── Supabase Integration (official SDK) ──────────────────────────────────────
const SUPABASE_URL      = 'https://tpdocabgtcaiwdikncpa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwZG9jYWJndGNhaXdkaWtuY3BhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MjU1MDMsImV4cCI6MjEwNjEwMTUwM30.JXRLacsjHRVIjBzg74rjpR3b6pv5xpBYEe1K96XzYek';

const supabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Official Supabase JS client (loaded via CDN in index.html)
const _supa = supabaseEnabled
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// ─── Auth API ─────────────────────────────────────────────────────────────────

async function supaSignUp(email, password, name) {
  if (!_supa) return { data: null, error: { message: 'Supabase não configurado.' } };
  const { data, error } = await _supa.auth.signUp({
    email,
    password,
    options: { data: { full_name: name || '' } },
  });
  return { data, error };
}

async function supaSignIn(email, password) {
  if (!_supa) return { data: null, error: { message: 'Supabase não configurado.' } };
  const { data, error } = await _supa.auth.signInWithPassword({ email, password });
  return { data, error };
}

async function supaSignOut() {
  if (_supa) await _supa.auth.signOut();
}

async function supaGetUser() {
  if (!_supa) return null;
  const { data: { session } } = await _supa.auth.getSession();
  return session?.user || null;
}

// ─── Data helpers ─────────────────────────────────────────────────────────────

async function _uid() {
  const { data: { session } } = await _supa.auth.getSession();
  return session?.user?.id || null;
}

async function saveTransaction(txn) {
  if (!_supa) return;
  const uid = await _uid();
  if (!uid) return;
  await _supa.from('transactions').upsert({
    id: txn.id, date: txn.date, description: txn.description,
    amount: txn.amount, category: txn.category, account: txn.account,
    notes: txn.notes || '', user_id: uid,
  });
}

async function loadTransactions() {
  if (!_supa) return null;
  const uid = await _uid();
  if (!uid) return null;
  const { data } = await _supa.from('transactions').select('*').eq('user_id', uid).order('date', { ascending: false });
  return data;
}

async function deleteTransactionRemote(id) {
  if (!_supa) return;
  await _supa.from('transactions').delete().eq('id', id);
}

async function saveInvestment(inv) {
  if (!_supa) return;
  const uid = await _uid();
  if (!uid) return;
  await _supa.from('investments').upsert({
    id: inv.id, name: inv.name, type: inv.type, ticker: inv.ticker,
    invested: inv.invested, current_value: inv.current,
    return_pct: inv.returnPct, yield_pct: inv.yieldPct, user_id: uid,
  });
}

async function loadInvestments() {
  if (!_supa) return null;
  const uid = await _uid();
  if (!uid) return null;
  const { data } = await _supa.from('investments').select('*').eq('user_id', uid);
  return data ? data.map(r => ({
    id: r.id, name: r.name, type: r.type, ticker: r.ticker,
    invested: r.invested, current: r.current_value,
    returnPct: r.return_pct, yieldPct: r.yield_pct,
  })) : null;
}

async function saveBill(bill) {
  if (!_supa) return;
  const uid = await _uid();
  if (!uid) return;
  await _supa.from('bills').upsert({
    id: bill.id, name: bill.name, amount: bill.amount,
    due_day: bill.dueDay, category: bill.category, status: bill.status, user_id: uid,
  });
}

async function loadBills() {
  if (!_supa) return null;
  const uid = await _uid();
  if (!uid) return null;
  const { data } = await _supa.from('bills').select('*').eq('user_id', uid);
  return data ? data.map(r => ({
    id: r.id, name: r.name, amount: r.amount,
    dueDay: r.due_day, category: r.category, status: r.status,
  })) : null;
}

async function saveGoal(goal) {
  if (!_supa) return;
  const uid = await _uid();
  if (!uid) return;
  await _supa.from('goals').upsert({
    id: goal.id, name: goal.name, monthly_target: goal.monthlyTarget,
    description: goal.description || '', user_id: uid,
  });
}

async function loadGoals() {
  if (!_supa) return null;
  const uid = await _uid();
  if (!uid) return null;
  const { data } = await _supa.from('goals').select('*').eq('user_id', uid);
  return data ? data.map(r => ({
    id: r.id, name: r.name, monthlyTarget: r.monthly_target, description: r.description,
  })) : null;
}

async function deleteGoalRemote(id) {
  if (!_supa) return;
  await _supa.from('goals').delete().eq('id', id);
}

async function saveChatMessage(msg) {
  if (!_supa) return;
  const uid = await _uid();
  if (!uid) return;
  await _supa.from('chat_messages').insert({
    id: String(msg.id), role: msg.role, text: msg.text, user_id: uid,
  });
}
