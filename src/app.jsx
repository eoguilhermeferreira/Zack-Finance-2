// ─── ZackAvatar component ─────────────────────────────────────────────────────
function ZackAvatar({ size = 36, style = {}, className = '' }) {
  const [imgErr, setImgErr] = React.useState(false);
  if (imgErr) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-blue-deep))',
        display: 'grid', placeItems: 'center', color: '#fff',
        ...style,
      }} className={className}>
        <IcoBot size={Math.round(size * 0.5)}/>
      </div>
    );
  }
  return (
    <img
      src="./assets/zack-mascot.png"
      alt="Zack"
      width={size}
      height={size}
      onError={() => setImgErr(true)}
      style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0, display: 'block', ...style }}
      className={className}
    />
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
function AppShell() {
  const { authed, user, toggleTheme, theme, addToast, balance, income, expenses } = useApp();
  const [page, setPage] = React.useState('dashboard');
  const [collapsed, setCollapsed] = React.useState(false);
  const [showZack, setShowZack] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [txFilter, setTxFilter] = React.useState(null); // 'income' | 'expense' | null

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
      case 'transactions': return <TransactionsPage filter={txFilter}/>;
      case 'investments':  return <InvestmentsPage/>;
      case 'bills':        return <BillsPage/>;
      case 'reports':      return <ReportsPage/>;
      case 'zack':         return <ZackPage/>;
      case 'settings':     return <SettingsPage/>;
      default:             return <DashboardPage onNavigate={setPage}/>;
    }
  };

  const navigate = (p, filter) => {
    setPage(p);
    setShowZack(p === 'zack');
    if (filter !== undefined) setTxFilter(filter);
    setMobileOpen(false);
  };

  const pageLabels = {
    dashboard: 'Dashboard', transactions: 'Transações', investments: 'Investimentos',
    bills: 'Contas a Pagar', reports: 'Relatórios', zack: 'Zack AI', settings: 'Configurações',
  };

  const activePage = showZack ? 'zack' : page;

  // Mobile nav items including the extra ones
  const mobileNavItems = [
    { id: 'dashboard',    label: 'Dashboard',        icon: <IcoDashboard size={20}/>,        filter: null },
    { id: 'transactions', label: 'Entradas',          icon: <IcoArrowRightLeft size={20}/>,   filter: 'income', badge: null },
    { id: 'transactions', label: 'Despesas',          icon: <IcoReceipt size={20}/>,          filter: 'expense', badge: null },
    { id: 'investments',  label: 'Investimentos',     icon: <IcoTrendingUp size={20}/>,       filter: null },
    { id: 'reports',      label: 'Gráficos',          icon: <IcoBarChart size={20}/>,         filter: null },
    { id: 'reports',      label: 'Relatórios',        icon: <IcoBarChart size={20}/>,         filter: null },
    { id: 'bills',        label: 'Contas a Pagar',    icon: <IcoReceipt size={20}/>,          filter: null },
    { id: 'settings',     label: 'Configurações',     icon: <IcoSettings size={20}/>,         filter: null },
    { id: 'zack',         label: 'Zack AI',           icon: <IcoBot size={20}/>,              filter: null, badge: 'NOVO' },
  ];

  return (
    <div id="app" className={collapsed ? 'collapsed' : ''}>

      {/* ── Mobile overlay ── */}
      <div
        className={`mobile-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* ── Mobile sidebar ── */}
      <div className={`mobile-sidebar ${mobileOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu de navegação">
        <div className="mobile-sidebar-head">
          <div className="brand-mark" style={{ width: 36, height: 36, borderRadius: 10, overflow: 'hidden' }}>
            <ZackAvatar size={36} style={{ borderRadius: 10 }}/>
          </div>
          <div className="brand-name">
            Zack
            <small>Finance</small>
          </div>
          <button className="mobile-sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <nav className="mobile-nav">
          <div className="mobile-nav-section">Principal</div>
          {mobileNavItems.map((item, idx) => {
            const isActive = activePage === item.id && (item.filter == null || item.filter === txFilter);
            return (
              <div
                key={idx}
                className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.id, item.filter)}
              >
                <span style={{ width: 20, height: 20, flexShrink: 0 }}>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
            );
          })}
        </nav>

        <div className="mobile-sidebar-foot">
          <div className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}>{user.initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Plano Pro</div>
          </div>
        </div>
      </div>

      {/* ── Desktop Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-head">
          <div className="brand-mark" style={{ overflow: 'hidden' }}>
            <ZackAvatar size={36} style={{ borderRadius: 10 }}/>
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
              onClick={() => navigate(item.id, null)}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge" style={{ background: 'var(--brand-green-soft)', fontSize: 9, padding: '2px 5px' }}>{item.badge}</span>}
            </div>
          ))}

          <div className="nav-section">IA</div>
          <div className={`nav-item ${activePage === 'zack' ? 'active' : ''}`} onClick={() => navigate('zack', null)}>
            <span className="nav-icon">
              <ZackAvatar size={20} style={{ borderRadius: '50%' }}/>
            </span>
            <span>Zack AI</span>
            <span className="nav-badge" style={{ background: 'var(--brand-green-soft)' }}>NOVO</span>
          </div>

          <div className="nav-section">Conta</div>
          <div className={`nav-item ${activePage === 'settings' ? 'active' : ''}`} onClick={() => navigate('settings', null)}>
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
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => navigate('settings', null)} title="Configurações">
            <IcoSettings size={16}/>
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          {/* Hamburger button — mobile only */}
          <button
            className="hamburger-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
            title="Menu"
          >
            <IcoMenu size={18}/>
          </button>

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
            <button className="icon-btn" onClick={() => navigate('settings', null)} title="Perfil">
              <div className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{user.initials}</div>
            </button>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {currentPage()}
        </div>
      </div>

      {/* ── Zack FAB ── */}
      {activePage !== 'zack' && (
        <button className="zack-fab" onClick={() => navigate('zack', null)} title="Abrir Zack AI">
          <ZackAvatar size={40} style={{ borderRadius: '50%' }}/>
        </button>
      )}

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
