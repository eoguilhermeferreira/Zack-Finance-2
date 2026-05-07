// ─── App Shell ────────────────────────────────────────────────────────────────
function AppShell() {
  const { authed, user, toggleTheme, theme, addToast, balance, income, expenses } = useApp();
  const [page, setPage] = React.useState('dashboard');
  const [collapsed, setCollapsed] = React.useState(false);
  const [showZack, setShowZack] = React.useState(false);
  const [search, setSearch] = React.useState('');

  if (!authed) return <AuthPage/>;

  const navItems = [
    { id: 'dashboard',    label: 'Dashboard',       icon: <IcoDashboard size={20}/> },
    { id: 'transactions', label: 'Transações',       icon: <IcoArrowRightLeft size={20}/> },
    { id: 'investments',  label: 'Investimentos',    icon: <IcoTrendingUp size={20}/> },
    { id: 'bills',        label: 'Contas a Pagar',   icon: <IcoReceipt size={20}/> },
    { id: 'reports',      label: 'Relatórios',       icon: <IcoBarChart size={20}/> },
    { id: 'zack',         label: 'Zack AI',          icon: <IcoBot size={20}/>, badge: '●' },
  ];

  const currentPage = () => {
    if (showZack) return <ZackPage/>;
    switch (page) {
      case 'dashboard':    return <DashboardPage onNavigate={p => { setPage(p); setShowZack(false); }}/>;
      case 'transactions': return <TransactionsPage/>;
      case 'investments':  return <InvestmentsPage/>;
      case 'bills':        return <BillsPage/>;
      case 'reports':      return <ReportsPage/>;
      case 'zack':         return <ZackPage/>;
      case 'settings':     return <SettingsPage/>;
      default:             return <DashboardPage onNavigate={setPage}/>;
    }
  };

  const navigate = p => {
    setPage(p);
    setShowZack(p === 'zack');
  };

  const pageLabels = {
    dashboard: 'Dashboard', transactions: 'Transações', investments: 'Investimentos',
    bills: 'Contas a Pagar', reports: 'Relatórios', zack: 'Zack AI', settings: 'Configurações',
  };

  const activePage = showZack ? 'zack' : page;

  return (
    <div id="app" className={collapsed ? 'collapsed' : ''}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-head">
          <div className="brand-mark">
            <IcoWallet size={18} style={{ color: '#fff' }}/>
          </div>
          <div className="brand-name">
            Zack
            <small>Finance</small>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" style={{ marginLeft: 'auto' }}
            onClick={() => setCollapsed(c => !c)}>
            <IcoMenu size={16}/>
          </button>
        </div>

        <nav className="nav">
          <div className="nav-section">Principal</div>
          {navItems.slice(0, 5).map(item => (
            <div key={item.id}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => navigate(item.id)}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge" style={{ background: 'var(--brand-green-soft)', fontSize: 9, padding: '2px 5px' }}>{item.badge}</span>}
            </div>
          ))}

          <div className="nav-section">IA</div>
          <div className={`nav-item ${activePage === 'zack' ? 'active' : ''}`} onClick={() => navigate('zack')}>
            <span className="nav-icon"><IcoBot size={20}/></span>
            <span>Zack AI</span>
            <span className="nav-badge" style={{ background: 'var(--brand-green-soft)' }}>NOVO</span>
          </div>

          <div className="nav-section">Conta</div>
          <div className={`nav-item ${activePage === 'settings' ? 'active' : ''}`} onClick={() => navigate('settings')}>
            <span className="nav-icon"><IcoSettings size={20}/></span>
            <span>Configurações</span>
          </div>

          {/* Mini stats in sidebar */}
          {!collapsed && (
            <div style={{ marginTop: 16, padding: '14px', background: 'var(--bg-2)', borderRadius: 12, border: '1px solid var(--line)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Maio · Resumo</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-2)' }}>Receitas</span>
                  <span className="tabular delta-up" style={{ fontWeight: 600 }}>{fmt.brl(income, true)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-2)' }}>Despesas</span>
                  <span className="tabular delta-down" style={{ fontWeight: 600 }}>-{fmt.brl(expenses, true)}</span>
                </div>
                <div style={{ height: 1, background: 'var(--line)', margin: '2px 0' }}/>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text-2)', fontWeight: 600 }}>Saldo</span>
                  <span className="tabular" style={{ fontWeight: 700 }}>{fmt.brl(balance, true)}</span>
                </div>
              </div>
            </div>
          )}
        </nav>

        <div className="sidebar-foot">
          <div className="avatar">{user.initials}</div>
          <div className="sidebar-foot-text" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Plano Pro</div>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => navigate('settings')} title="Configurações">
            <IcoSettings size={16}/>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>
              {pageLabels[activePage] || 'Dashboard'}
            </span>
          </div>

          <div className="search" style={{ flex: 1 }}>
            <IcoSearch size={15}/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar transações, relatórios..."/>
            <kbd>⌘K</kbd>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
            <button className="icon-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}>
              {theme === 'dark' ? <IcoSun size={18}/> : <IcoMoon size={18}/>}
            </button>
            <button className="icon-btn" onClick={() => addToast('Nenhuma notificação nova.')} title="Notificações">
              <IcoBell size={18}/>
              <span className="ping"/>
            </button>
            <div style={{ width: 1, height: 24, background: 'var(--line)', margin: '0 4px' }}/>
            <button className="icon-btn" onClick={() => navigate('settings')} title="Perfil">
              <div className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{user.initials}</div>
            </button>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {currentPage()}
        </div>
      </div>

      {/* Zack FAB */}
      {activePage !== 'zack' && (
        <button className="zack-fab" onClick={() => navigate('zack')} title="Abrir Zack AI">
          <IcoSparkles size={24}/>
        </button>
      )}

      {/* Bottom nav (mobile) */}
      <nav className="bottom-nav">
        {[
          { id: 'dashboard',    label: 'Início',     icon: <IcoDashboard size={22}/> },
          { id: 'transactions', label: 'Transações', icon: <IcoArrowRightLeft size={22}/> },
          { id: 'investments',  label: 'Investir',   icon: <IcoTrendingUp size={22}/> },
          { id: 'reports',      label: 'Relatórios', icon: <IcoBarChart size={22}/> },
          { id: 'settings',     label: 'Conta',      icon: <IcoSettings size={22}/> },
        ].map(item => (
          <div key={item.id} className={`bn-item ${activePage === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}>
            <div className="bn-pill">{item.icon}</div>
            {item.label}
          </div>
        ))}
      </nav>

      {/* Toasts */}
      <ToastHost/>
    </div>
  );
}

// ─── Root render ──────────────────────────────────────────────────────────────
function Root() {
  return (
    <AppProvider>
      <AppShell/>
    </AppProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root/>);
