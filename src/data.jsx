// ─── Formatters ───────────────────────────────────────────────────────────────
const fmt = {
  brl: (v, short = false) => {
    if (short && Math.abs(v) >= 1000) {
      return 'R$ ' + (v / 1000).toFixed(1).replace('.', ',') + 'k';
    }
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  },
  pct: v => (v >= 0 ? '+' : '') + v.toFixed(2).replace('.', ',') + '%',
  date: d => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
  dateShort: d => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
  month: d => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
  num: v => v.toLocaleString('pt-BR'),
};

// ─── Categories ───────────────────────────────────────────────────────────────
const CATEGORIES = {
  salary:        { label: 'Salário',       color: '#1F8A4C', bg: '#dcfce7', type: 'income'  },
  freelance:     { label: 'Freelance',     color: '#1565E0', bg: '#dbeafe', type: 'income'  },
  invest_return: { label: 'Rendimentos',   color: '#7C5CE0', bg: '#ede9fe', type: 'income'  },
  other_income:  { label: 'Outras rec.',   color: '#1FA8E0', bg: '#e0f2fe', type: 'income'  },
  food:          { label: 'Alimentação',   color: '#F2A03D', bg: '#fef3c7', type: 'expense' },
  transport:     { label: 'Transporte',    color: '#1FA8E0', bg: '#cffafe', type: 'expense' },
  health:        { label: 'Saúde',         color: '#E5484D', bg: '#fee2e2', type: 'expense' },
  leisure:       { label: 'Lazer',         color: '#7C5CE0', bg: '#ede9fe', type: 'expense' },
  housing:       { label: 'Moradia',       color: '#1565E0', bg: '#dbeafe', type: 'expense' },
  education:     { label: 'Educação',      color: '#1FA8E0', bg: '#e0f2fe', type: 'expense' },
  shopping:      { label: 'Compras',       color: '#F2A03D', bg: '#ffedd5', type: 'expense' },
  subscriptions: { label: 'Assinaturas',   color: '#E5484D', bg: '#fee2e2', type: 'expense' },
  utilities:     { label: 'Utilidades',    color: '#6B7280', bg: '#f1f5f9', type: 'expense' },
  other:         { label: 'Outros',        color: '#8A93A6', bg: '#f1f5f9', type: 'expense' },
};

const ACCOUNTS = [
  { id: 'checking',   label: 'Conta Corrente',     icon: 'wallet'   },
  { id: 'savings',    label: 'Poupança',            icon: 'piggy'    },
  { id: 'credit',     label: 'Cartão de Crédito',   icon: 'credit'   },
  { id: 'investment', label: 'Conta Investimentos', icon: 'trending' },
];

// ─── Mock data ────────────────────────────────────────────────────────────────
const INITIAL_TRANSACTIONS = [
  // May 2026
  { id: 't001', date: '2026-05-05', description: 'Salário — Empresa XYZ',      amount:  8500.00, category: 'salary',        account: 'checking',   notes: '' },
  { id: 't002', date: '2026-05-06', description: 'Mercado Extra',               amount:  -287.45, category: 'food',          account: 'credit',     notes: '' },
  { id: 't003', date: '2026-05-06', description: 'Uber',                        amount:   -28.90, category: 'transport',     account: 'credit',     notes: '' },
  { id: 't004', date: '2026-05-05', description: 'Netflix',                     amount:   -55.90, category: 'subscriptions', account: 'credit',     notes: '' },
  { id: 't005', date: '2026-05-05', description: 'Spotify',                     amount:   -21.90, category: 'subscriptions', account: 'credit',     notes: '' },
  { id: 't006', date: '2026-05-04', description: 'Aluguel',                     amount: -2500.00, category: 'housing',       account: 'checking',   notes: '' },
  { id: 't007', date: '2026-05-04', description: 'Academia SmartFit',           amount:   -99.90, category: 'health',        account: 'credit',     notes: '' },
  { id: 't008', date: '2026-05-03', description: 'Freelance — Projeto App',     amount:  1800.00, category: 'freelance',     account: 'checking',   notes: 'Cliente: Agência X' },
  { id: 't009', date: '2026-05-02', description: 'Farmácia',                    amount:   -89.50, category: 'health',        account: 'credit',     notes: '' },
  { id: 't010', date: '2026-05-01', description: 'Internet Vivo',               amount:  -109.90, category: 'utilities',     account: 'checking',   notes: '' },

  // April 2026
  { id: 't011', date: '2026-04-05', description: 'Salário — Empresa XYZ',      amount:  8500.00, category: 'salary',        account: 'checking',   notes: '' },
  { id: 't012', date: '2026-04-28', description: 'iFood — Jantar',              amount:   -68.90, category: 'food',          account: 'credit',     notes: '' },
  { id: 't013', date: '2026-04-27', description: 'Posto Shell',                 amount:  -180.00, category: 'transport',     account: 'credit',     notes: '' },
  { id: 't014', date: '2026-04-26', description: 'Cinema',                      amount:   -62.00, category: 'leisure',       account: 'credit',     notes: '' },
  { id: 't015', date: '2026-04-25', description: 'Seguro Saúde',                amount:  -450.00, category: 'health',        account: 'checking',   notes: '' },
  { id: 't016', date: '2026-04-20', description: 'Energia Elétrica',            amount:  -195.30, category: 'utilities',     account: 'checking',   notes: '' },
  { id: 't017', date: '2026-04-18', description: 'Amazon — Livros',             amount:   -97.80, category: 'education',     account: 'credit',     notes: '' },
  { id: 't018', date: '2026-04-15', description: 'Netflix',                     amount:   -55.90, category: 'subscriptions', account: 'credit',     notes: '' },
  { id: 't019', date: '2026-04-15', description: 'Spotify',                     amount:   -21.90, category: 'subscriptions', account: 'credit',     notes: '' },
  { id: 't020', date: '2026-04-10', description: 'Internet Vivo',               amount:  -109.90, category: 'utilities',     account: 'checking',   notes: '' },
  { id: 't021', date: '2026-04-08', description: 'Supermercado Pão de Açúcar',  amount:  -312.50, category: 'food',          account: 'credit',     notes: '' },
  { id: 't022', date: '2026-04-05', description: 'Aluguel',                     amount: -2500.00, category: 'housing',       account: 'checking',   notes: '' },
  { id: 't023', date: '2026-04-05', description: 'Academia SmartFit',           amount:   -99.90, category: 'health',        account: 'credit',     notes: '' },
  { id: 't024', date: '2026-04-03', description: 'Rendimento CDB',              amount:   142.50, category: 'invest_return', account: 'investment', notes: '' },
  { id: 't025', date: '2026-04-02', description: 'Restaurante Outback',         amount:  -148.00, category: 'food',          account: 'credit',     notes: '' },
  { id: 't026', date: '2026-04-01', description: 'Freelance — Design UI',       amount:  2200.00, category: 'freelance',     account: 'checking',   notes: '' },

  // March 2026
  { id: 't027', date: '2026-03-05', description: 'Salário — Empresa XYZ',      amount:  8500.00, category: 'salary',        account: 'checking',   notes: '' },
  { id: 't028', date: '2026-03-30', description: 'Supermercado Extra',          amount:  -267.80, category: 'food',          account: 'credit',     notes: '' },
  { id: 't029', date: '2026-03-28', description: 'Uber',                        amount:   -42.50, category: 'transport',     account: 'credit',     notes: '' },
  { id: 't030', date: '2026-03-25', description: 'Seguro Saúde',                amount:  -450.00, category: 'health',        account: 'checking',   notes: '' },
  { id: 't031', date: '2026-03-22', description: 'Energia Elétrica',            amount:  -167.40, category: 'utilities',     account: 'checking',   notes: '' },
  { id: 't032', date: '2026-03-20', description: 'Shopping — Roupas',           amount:  -380.00, category: 'shopping',      account: 'credit',     notes: '' },
  { id: 't033', date: '2026-03-18', description: 'PlayStation Plus',            amount:   -39.90, category: 'subscriptions', account: 'credit',     notes: '' },
  { id: 't034', date: '2026-03-15', description: 'Netflix',                     amount:   -55.90, category: 'subscriptions', account: 'credit',     notes: '' },
  { id: 't035', date: '2026-03-15', description: 'Spotify',                     amount:   -21.90, category: 'subscriptions', account: 'credit',     notes: '' },
  { id: 't036', date: '2026-03-12', description: 'Curso Udemy',                 amount:   -29.90, category: 'education',     account: 'credit',     notes: '' },
  { id: 't037', date: '2026-03-10', description: 'Internet Vivo',               amount:  -109.90, category: 'utilities',     account: 'checking',   notes: '' },
  { id: 't038', date: '2026-03-08', description: 'iFood',                       amount:   -87.30, category: 'food',          account: 'credit',     notes: '' },
  { id: 't039', date: '2026-03-05', description: 'Aluguel',                     amount: -2500.00, category: 'housing',       account: 'checking',   notes: '' },
  { id: 't040', date: '2026-03-05', description: 'Academia SmartFit',           amount:   -99.90, category: 'health',        account: 'credit',     notes: '' },
  { id: 't041', date: '2026-03-03', description: 'Rendimento CDB',              amount:   138.20, category: 'invest_return', account: 'investment', notes: '' },
  { id: 't042', date: '2026-03-01', description: 'Freelance — Landing Page',    amount:  1500.00, category: 'freelance',     account: 'checking',   notes: '' },

  // February 2026
  { id: 't043', date: '2026-02-05', description: 'Salário — Empresa XYZ',      amount:  8500.00, category: 'salary',        account: 'checking',   notes: '' },
  { id: 't044', date: '2026-02-25', description: 'Seguro Saúde',                amount:  -450.00, category: 'health',        account: 'checking',   notes: '' },
  { id: 't045', date: '2026-02-20', description: 'Supermercado',                amount:  -298.60, category: 'food',          account: 'credit',     notes: '' },
  { id: 't046', date: '2026-02-18', description: 'Energia Elétrica',            amount:  -152.80, category: 'utilities',     account: 'checking',   notes: '' },
  { id: 't047', date: '2026-02-14', description: 'Jantar Romântico',            amount:  -280.00, category: 'leisure',       account: 'credit',     notes: '' },
  { id: 't048', date: '2026-02-15', description: 'Netflix',                     amount:   -55.90, category: 'subscriptions', account: 'credit',     notes: '' },
  { id: 't049', date: '2026-02-10', description: 'Internet Vivo',               amount:  -109.90, category: 'utilities',     account: 'checking',   notes: '' },
  { id: 't050', date: '2026-02-05', description: 'Aluguel',                     amount: -2500.00, category: 'housing',       account: 'checking',   notes: '' },
  { id: 't051', date: '2026-02-03', description: 'Rendimento CDB',              amount:   135.70, category: 'invest_return', account: 'investment', notes: '' },

  // January 2026
  { id: 't052', date: '2026-01-05', description: 'Salário — Empresa XYZ',      amount:  8500.00, category: 'salary',        account: 'checking',   notes: '' },
  { id: 't053', date: '2026-01-20', description: 'Supermercado',                amount:  -245.90, category: 'food',          account: 'credit',     notes: '' },
  { id: 't054', date: '2026-01-18', description: 'Energia Elétrica',            amount:  -189.50, category: 'utilities',     account: 'checking',   notes: '' },
  { id: 't055', date: '2026-01-15', description: 'Netflix',                     amount:   -55.90, category: 'subscriptions', account: 'credit',     notes: '' },
  { id: 't056', date: '2026-01-10', description: 'Internet Vivo',               amount:  -109.90, category: 'utilities',     account: 'checking',   notes: '' },
  { id: 't057', date: '2026-01-05', description: 'Aluguel',                     amount: -2500.00, category: 'housing',       account: 'checking',   notes: '' },
  { id: 't058', date: '2026-01-04', description: 'Seguro Saúde',                amount:  -450.00, category: 'health',        account: 'checking',   notes: '' },
  { id: 't059', date: '2026-01-02', description: 'Rendimento CDB',              amount:   141.30, category: 'invest_return', account: 'investment', notes: '' },
];

const INITIAL_INVESTMENTS = [
  { id: 'inv1', name: 'Tesouro Selic 2027',   type: 'Renda Fixa', ticker: 'SELIC27',  invested: 15000.00, current: 16245.80, returnPct:  8.31, yieldPct: 11.75 },
  { id: 'inv2', name: 'IVVB11',               type: 'ETF',        ticker: 'IVVB11',   invested:  6800.00, current:  7637.20, returnPct: 12.31, yieldPct:  0.00 },
  { id: 'inv3', name: 'PETR4',                type: 'Ações',      ticker: 'PETR4',    invested:  4200.00, current:  3994.80, returnPct: -4.88, yieldPct:  8.20 },
  { id: 'inv4', name: 'HGLG11',               type: 'FII',        ticker: 'HGLG11',   invested:  5800.00, current:  6214.60, returnPct:  7.15, yieldPct:  9.80 },
  { id: 'inv5', name: 'Bitcoin',              type: 'Cripto',     ticker: 'BTC',      invested:  2100.00, current:  2698.50, returnPct: 28.50, yieldPct:  0.00 },
  { id: 'inv6', name: 'CDB Nubank 115% CDI',  type: 'Renda Fixa', ticker: 'CDB-NU',   invested:  8000.00, current:  8542.40, returnPct:  6.78, yieldPct: 13.40 },
];

const INITIAL_BILLS = [
  { id: 'b01', name: 'Aluguel',          amount: 2500.00, dueDay: 5,  category: 'housing',       status: 'paid'    },
  { id: 'b02', name: 'Seguro Saúde',     amount:  450.00, dueDay: 25, category: 'health',        status: 'pending' },
  { id: 'b03', name: 'Internet Vivo',    amount:  109.90, dueDay: 10, category: 'utilities',     status: 'paid'    },
  { id: 'b04', name: 'Energia Elétrica', amount:  185.00, dueDay: 20, category: 'utilities',     status: 'pending' },
  { id: 'b05', name: 'Netflix',          amount:   55.90, dueDay: 15, category: 'subscriptions', status: 'paid'    },
  { id: 'b06', name: 'Spotify',          amount:   21.90, dueDay: 8,  category: 'subscriptions', status: 'paid'    },
  { id: 'b07', name: 'Academia',         amount:   99.90, dueDay: 1,  category: 'health',        status: 'paid'    },
  { id: 'b08', name: 'PlayStation Plus', amount:   39.90, dueDay: 18, category: 'subscriptions', status: 'overdue' },
];

// ─── Monthly chart data (last 6 months) ──────────────────────────────────────
const MONTHLY_DATA = [
  { month: 'Dez', income: 8500,  expense: 5120 },
  { month: 'Jan', income: 8641,  expense: 5551 },
  { month: 'Fev', income: 8636,  expense: 5847 },
  { month: 'Mar', income: 10138, expense: 5854 },
  { month: 'Abr', income: 10842, expense: 5252 },
  { month: 'Mai', income: 10300, expense: 3193 },
];

// ─── Context ──────────────────────────────────────────────────────────────────
const AppContext = React.createContext(null);

function useApp() {
  return React.useContext(AppContext);
}

function AppProvider({ children }) {
  const [authed, setAuthed] = React.useState(false);
  const [theme, setThemeState] = React.useState(() => localStorage.getItem('zf-theme') || 'light');
  const [transactions, setTransactions] = React.useState(INITIAL_TRANSACTIONS);
  const [investments] = React.useState(INITIAL_INVESTMENTS);
  const [bills, setBills] = React.useState(INITIAL_BILLS);
  const [user, setUser] = React.useState({ name: 'Guilherme', email: 'guilherme@zackfinance.com', initials: 'GF' });
  const [toasts, setToasts] = React.useState([]);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zf-theme', theme);
  }, [theme]);

  const toggleTheme = () => setThemeState(t => t === 'light' ? 'dark' : 'light');

  const addToast = React.useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(ts => [...ts, { id, msg, type }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3500);
  }, []);

  const addTransaction = txn => {
    setTransactions(ts => [{ id: 't' + Date.now(), ...txn }, ...ts]);
    addToast('Transação adicionada!');
  };

  const editTransaction = (id, updates) => {
    setTransactions(ts => ts.map(t => t.id === id ? { ...t, ...updates } : t));
    addToast('Transação atualizada!');
  };

  const deleteTransaction = id => {
    setTransactions(ts => ts.filter(t => t.id !== id));
    addToast('Transação removida.', 'error');
  };

  const updateBill = (id, updates) => {
    setBills(bs => bs.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const login = (name, email) => {
    if (name) setUser({ name, email, initials: name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() });
    setAuthed(true);
  };
  const logout = () => setAuthed(false);

  // Derived stats (current month = May 2026)
  const thisMonthTxns = transactions.filter(t => t.date.startsWith('2026-05'));
  const income  = thisMonthTxns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = Math.abs(thisMonthTxns.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
  const balance  = 24580.40;
  const savingsRate = income > 0 ? Math.round((income - expenses) / income * 100) : 0;
  const totalInvested = investments.reduce((s, i) => s + i.current, 0);
  const totalReturn   = investments.reduce((s, i) => s + (i.current - i.invested), 0);

  const monthlyData = [
    ...MONTHLY_DATA.slice(0, 5),
    { month: 'Mai', income, expense: expenses },
  ];

  return (
    <AppContext.Provider value={{
      authed, login, logout,
      theme, toggleTheme,
      user, toasts, addToast,
      transactions, addTransaction, editTransaction, deleteTransaction,
      investments, bills, updateBill,
      balance, income, expenses, savingsRate, totalInvested, totalReturn,
      monthlyData,
    }}>
      {children}
    </AppContext.Provider>
  );
}
