// ─── Formatters ───────────────────────────────────────────────────────────────
const fmt = {
  brl: (v, short = false) => {
    if (short && Math.abs(v) >= 1000) {
      return 'R$ ' + (v / 1000).toFixed(1).replace('.', ',') + 'k';
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

// ─── Smart notification generator ────────────────────────────────────────────
function generateAlerts(transactions, bills, goals, income, expenses) {
  const alerts = [];
  const today      = new Date();
  const dayOfMonth = today.getDate();
  const currentMonth = today.toISOString().slice(0, 7);

  const thisMonthTxns = transactions.filter(t => t.date.startsWith(currentMonth));
  const thisMonthExp  = Math.abs(thisMonthTxns.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));

  // Yesterday's spending
  const yday = new Date(today); yday.setDate(yday.getDate() - 1);
  const ydayStr = yday.toISOString().slice(0, 10);
  const ydayExp = Math.abs(transactions.filter(t => t.date === ydayStr && t.amount < 0).reduce((s, t) => s + t.amount, 0));
  if (ydayExp > 200) {
    alerts.push({ id: 'yesterday', type: 'info', emoji: '📅',
      title: 'Gastos de ontem',
      msg: `Ontem você gastou ${fmt.brl(ydayExp)}. Fique de olho no orçamento!` });
  }

  // High spending rate
  if (income > 0 && thisMonthExp / income > 0.65) {
    alerts.push({ id: 'high-spend', type: 'warning', emoji: '⚠️',
      title: 'Você está gastando muito',
      msg: `Seus gastos este mês (${fmt.brl(thisMonthExp)}) representam ${Math.round(thisMonthExp / income * 100)}% da sua renda.` });
  }

  // Goals at risk
  goals.forEach(goal => {
    const projectedSavings = income - thisMonthExp;
    if (income > 0 && projectedSavings < goal.monthlyTarget) {
      alerts.push({ id: `goal-${goal.id}`, type: 'error', emoji: '🎯',
        title: 'Meta em risco',
        msg: `Cuidado! Ao ritmo atual você vai guardar ${fmt.brl(Math.max(0, projectedSavings))}, abaixo da meta "${goal.name}" de ${fmt.brl(goal.monthlyTarget)}.` });
    } else if (income > 0 && projectedSavings < goal.monthlyTarget * 1.2) {
      alerts.push({ id: `goal-warn-${goal.id}`, type: 'warning', emoji: '💰',
        title: 'Perto do limite da meta',
        msg: `Seus gastos estão próximos de impedir sua meta "${goal.name}". Você guardará aprox. ${fmt.brl(projectedSavings)}.` });
    }
  });

  // Category spike
  const byCat = {};
  thisMonthTxns.filter(t => t.amount < 0).forEach(t => {
    byCat[t.category] = (byCat[t.category] || 0) + Math.abs(t.amount);
  });
  const catArr = Object.entries(byCat).sort(([,a],[,b]) => b - a);
  if (catArr.length > 0 && income > 0) {
    const [topCat, topVal] = catArr[0];
    if (topCat !== 'housing' && topVal / income > 0.15) {
      alerts.push({ id: `cat-${topCat}`, type: 'info', emoji: '📊',
        title: `${CATEGORIES[topCat]?.label || topCat} consumindo muito`,
        msg: `Sua categoria ${CATEGORIES[topCat]?.label || topCat} representa ${Math.round(topVal/income*100)}% da renda — ${fmt.brl(topVal)} este mês.` });
    }
  }

  // Bills due soon or overdue
  bills.filter(b => b.status === 'pending' || b.status === 'overdue').forEach(b => {
    const daysUntil = b.dueDay - dayOfMonth;
    if (b.status === 'overdue') {
      alerts.push({ id: `bill-ov-${b.id}`, type: 'error', emoji: '🚨',
        title: `${b.name} está vencida!`,
        msg: `Conta de ${fmt.brl(b.amount)} está em atraso. Regularize o quanto antes.` });
    } else if (daysUntil >= 0 && daysUntil <= 4) {
      alerts.push({ id: `bill-${b.id}`, type: 'warning', emoji: '📆',
        title: `${b.name} vence em ${daysUntil === 0 ? 'hoje' : daysUntil + ' dia(s)'}`,
        msg: `Valor: ${fmt.brl(b.amount)}. Não esqueça de pagar!` });
    }
  });

  return alerts;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AppContext = React.createContext(null);
function useApp() { return React.useContext(AppContext); }

function AppProvider({ children }) {
  const [authed,       setAuthed]       = React.useState(false);
  const [authLoading,  setAuthLoading]  = React.useState(true);
  const [theme,        setThemeState]   = React.useState(() => localStorage.getItem('zf-theme') || 'light');
  const [transactions, setTransactions] = React.useState([]);
  const [investments,  setInvestments]  = React.useState([]);
  const [bills,        setBills]        = React.useState([]);
  const [goals,        setGoals]        = React.useState([]);
  const [user,  setUser]  = React.useState({ name: 'Usuário', email: '', initials: 'ZF' });
  const [toasts, setToasts] = React.useState([]);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zf-theme', theme);
  }, [theme]);

  // Restore session on mount
  React.useEffect(() => {
    if (!supabaseEnabled) { setAuthLoading(false); return; }
    supaGetUser().then(u => {
      if (u) {
        const nm = u.user_metadata?.full_name || u.email?.split('@')[0] || 'Usuário';
        setUser({ name: nm, email: u.email, initials: nm.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() });
        setAuthed(true);
        _syncFromSupabase(setTransactions, setInvestments, setBills, setGoals);
      }
      setAuthLoading(false);
    });
  }, []);

  const toggleTheme = () => setThemeState(t => t === 'light' ? 'dark' : 'light');

  const addToast = React.useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(ts => [...ts, { id, msg, type }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 4000);
  }, []);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    if (!supabaseEnabled) return { error: 'Sistema não configurado. Contate o administrador.' };
    const { data, error } = await supaSignIn(email, password);
    if (error) return { error: error.error_description || error.msg || 'E-mail ou senha incorretos.' };
    const nm = data.user?.user_metadata?.full_name || email.split('@')[0];
    setUser({ name: nm, email, initials: nm.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() });
    setAuthed(true);
    _syncFromSupabase(setTransactions, setInvestments, setBills, setGoals);
    return { error: null };
  };

  const register = async (email, password, name) => {
    if (!supabaseEnabled) return { error: 'Sistema não configurado. Contate o administrador.' };
    const { data, error } = await supaSignUp(email, password, name);
    if (error) return { error: error.msg || error.message || 'Erro ao criar conta.' };
    if (data?.access_token) {
      setUser({ name, email, initials: name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() });
      setAuthed(true);
      _syncFromSupabase(setTransactions, setInvestments, setBills, setGoals);
    } else {
      // Email confirmation required
      return { error: null, confirmEmail: true };
    }
    return { error: null };
  };

  const logout = async () => {
    await supaSignOut();
    setAuthed(false);
    setTransactions([]);
    setInvestments([]);
    setBills([]);
    setGoals([]);
    setUser({ name: 'Usuário', email: '', initials: 'ZF' });
    localStorage.removeItem('zf-goals');
  };

  // ── Transactions ──────────────────────────────────────────────────────────
  const addTransaction = txn => {
    const newTxn = { id: 't' + Date.now(), ...txn };
    setTransactions(ts => [newTxn, ...ts]);
    addToast('Transação adicionada!');
    if (supabaseEnabled) saveTransaction(newTxn).catch(() => {});
  };

  const editTransaction = (id, updates) => {
    setTransactions(ts => ts.map(t => t.id === id ? { ...t, ...updates } : t));
    addToast('Transação atualizada!');
    if (supabaseEnabled) {
      const updated = transactions.find(t => t.id === id);
      if (updated) saveTransaction({ ...updated, ...updates }).catch(() => {});
    }
  };

  const deleteTransaction = id => {
    setTransactions(ts => ts.filter(t => t.id !== id));
    addToast('Transação removida.', 'error');
    if (supabaseEnabled) deleteTransactionRemote(id).catch(() => {});
  };

  // ── Bills ─────────────────────────────────────────────────────────────────
  const updateBill = (id, updates) => {
    setBills(bs => bs.map(b => b.id === id ? { ...b, ...updates } : b));
    if (supabaseEnabled) {
      const updated = bills.find(b => b.id === id);
      if (updated) saveBill({ ...updated, ...updates }).catch(() => {});
    }
  };

  const addBill = bill => {
    setBills(bs => [...bs, bill]);
    if (supabaseEnabled) saveBill(bill).catch(() => {});
  };

  // ── Goals ─────────────────────────────────────────────────────────────────
  const addGoal = goal => {
    const g = { id: 'g' + Date.now(), ...goal };
    setGoals(gs => [...gs, g]);
    addToast('Meta criada!');
    if (supabaseEnabled) saveGoal(g).catch(() => {});
  };

  const editGoal = (id, updates) => {
    setGoals(gs => gs.map(g => g.id === id ? { ...g, ...updates } : g));
    addToast('Meta atualizada!');
    if (supabaseEnabled) {
      const updated = goals.find(g => g.id === id);
      if (updated) saveGoal({ ...updated, ...updates }).catch(() => {});
    }
  };

  const deleteGoal = id => {
    setGoals(gs => gs.filter(g => g.id !== id));
    addToast('Meta removida.', 'error');
    if (supabaseEnabled) deleteGoalRemote(id).catch(() => {});
  };

  // ── Derived stats (all computed from real data) ───────────────────────────
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthTxns = transactions.filter(t => t.date.startsWith(currentMonth));
  const income   = thisMonthTxns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = Math.abs(thisMonthTxns.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
  const balance  = transactions.reduce((s, t) => s + t.amount, 0);
  const savingsRate = income > 0 ? Math.round((income - expenses) / income * 100) : 0;
  const totalInvested = investments.reduce((s, i) => s + i.current, 0);
  const totalReturn   = investments.reduce((s, i) => s + (i.current - i.invested), 0);

  // Monthly chart — last 6 months from real transactions
  const monthlyData = React.useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('pt-BR', { month: 'short' });
      const monthLabel = label.charAt(0).toUpperCase() + label.slice(1, 3);
      const monthTxns = transactions.filter(t => t.date.startsWith(key));
      const inc = monthTxns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
      const exp = Math.abs(monthTxns.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
      months.push({ month: monthLabel, income: inc, expense: exp });
    }
    return months;
  }, [transactions]);

  const alerts = React.useMemo(
    () => generateAlerts(transactions, bills, goals, income, expenses),
    [transactions, bills, goals, income, expenses]
  );

  return (
    <AppContext.Provider value={{
      authed, authLoading, login, register, logout,
      theme, toggleTheme,
      user, toasts, addToast,
      transactions, addTransaction, editTransaction, deleteTransaction,
      investments, bills, updateBill, addBill,
      goals, addGoal, editGoal, deleteGoal,
      balance, income, expenses, savingsRate, totalInvested, totalReturn,
      monthlyData, alerts,
      supabaseActive: supabaseEnabled,
      currentMonth,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── Background Supabase sync ─────────────────────────────────────────────────
async function _syncFromSupabase(setTransactions, setInvestments, setBills, setGoals) {
  try {
    const [txns, invs, bls, gls] = await Promise.all([
      loadTransactions(), loadInvestments(), loadBills(), loadGoals(),
    ]);
    // Always set state — even empty arrays (user starts fresh)
    if (txns !== null) setTransactions(txns);
    if (invs !== null) setInvestments(invs);
    if (bls  !== null) setBills(bls);
    if (gls  !== null) setGoals(gls);
  } catch (_) {}
}
