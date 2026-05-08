// ─── Supabase Client ──────────────────────────────────────────────────────────
// IMPORTANT: Fill in your Supabase project credentials below.
// You can find these in your Supabase dashboard → Settings → API.
// Leave them empty to run the app in local-only mode (no persistence).
//
// Tables needed in your Supabase project (run in SQL Editor):
//
// CREATE TABLE transactions (
//   id TEXT PRIMARY KEY,
//   date TEXT NOT NULL,
//   description TEXT NOT NULL,
//   amount NUMERIC NOT NULL,
//   category TEXT NOT NULL,
//   account TEXT NOT NULL,
//   notes TEXT DEFAULT '',
//   user_email TEXT NOT NULL,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
//
// CREATE TABLE investments (
//   id TEXT PRIMARY KEY,
//   name TEXT NOT NULL,
//   type TEXT NOT NULL,
//   ticker TEXT NOT NULL,
//   invested NUMERIC NOT NULL,
//   current NUMERIC NOT NULL,
//   return_pct NUMERIC NOT NULL,
//   yield_pct NUMERIC NOT NULL,
//   user_email TEXT NOT NULL,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
//
// CREATE TABLE bills (
//   id TEXT PRIMARY KEY,
//   name TEXT NOT NULL,
//   amount NUMERIC NOT NULL,
//   due_day INTEGER NOT NULL,
//   category TEXT NOT NULL,
//   status TEXT NOT NULL,
//   user_email TEXT NOT NULL,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
//
// CREATE TABLE chat_messages (
//   id TEXT PRIMARY KEY,
//   role TEXT NOT NULL,
//   text TEXT NOT NULL,
//   time TEXT NOT NULL,
//   user_email TEXT NOT NULL,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
//
// Enable Row Level Security and add policies as needed.

const SUPABASE_URL  = '';  // e.g. 'https://xyzabc.supabase.co'
const SUPABASE_ANON_KEY = '';  // e.g. 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

const supabaseEnabled = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// Minimal Supabase REST client (no SDK dependency needed)
const supabaseClient = (() => {
  if (!supabaseEnabled) {
    return {
      from: () => ({
        select: async () => ({ data: null, error: new Error('Supabase not configured') }),
        insert: async () => ({ data: null, error: new Error('Supabase not configured') }),
        update: async () => ({ data: null, error: new Error('Supabase not configured') }),
        delete: async () => ({ data: null, error: new Error('Supabase not configured') }),
        eq: function() { return this; },
        order: function() { return this; },
        limit: function() { return this; },
      }),
      enabled: false,
    };
  }

  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  };

  const request = async (path, method = 'GET', body = null, extraHeaders = {}) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        method,
        headers: { ...headers, ...extraHeaders },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        return { data: null, error: err };
      }
      const data = method === 'DELETE' ? null : await res.json().catch(() => null);
      return { data, error: null };
    } catch (e) {
      return { data: null, error: e };
    }
  };

  // Chainable query builder
  function QueryBuilder(table) {
    this._table = table;
    this._filters = [];
    this._order = null;
    this._limit = null;
    this._method = 'GET';
    this._body = null;
    this._extraHeaders = {};
  }

  QueryBuilder.prototype.eq = function(col, val) {
    this._filters.push(`${col}=eq.${encodeURIComponent(val)}`);
    return this;
  };

  QueryBuilder.prototype.order = function(col, { ascending = true } = {}) {
    this._order = `${col}.${ascending ? 'asc' : 'desc'}`;
    return this;
  };

  QueryBuilder.prototype.limit = function(n) {
    this._limit = n;
    return this;
  };

  QueryBuilder.prototype._buildQuery = function() {
    const parts = [...this._filters];
    if (this._order) parts.push(`order=${this._order}`);
    if (this._limit) parts.push(`limit=${this._limit}`);
    return parts.length ? '?' + parts.join('&') : '';
  };

  QueryBuilder.prototype.select = async function(cols = '*') {
    const qs = this._buildQuery();
    return request(`${this._table}?select=${cols}${qs ? '&' + qs.slice(1) : ''}`);
  };

  QueryBuilder.prototype.insert = async function(data) {
    return request(this._table, 'POST', data, { 'Prefer': 'return=representation' });
  };

  QueryBuilder.prototype.update = async function(data) {
    const qs = this._buildQuery();
    return request(`${this._table}${qs}`, 'PATCH', data, { 'Prefer': 'return=representation' });
  };

  QueryBuilder.prototype.delete = async function() {
    const qs = this._buildQuery();
    return request(`${this._table}${qs}`, 'DELETE');
  };

  return {
    enabled: true,
    from: (table) => new QueryBuilder(table),
  };
})();
