// ─── ZackAvatar component ─────────────────────────────────────────────────────
function ZackAvatar({ size = 36, style = {}, className = '' }) {
  const [srcIdx, setSrcIdx] = React.useState(0);
  const srcs = ['./assets/zack-mascot.png', './assets/zack-mascot.svg'];

  if (srcIdx >= srcs.length) {
    // All image sources failed — show branded "Z" fallback
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #1565E0, #0B3FA8)',
        display: 'grid', placeItems: 'center', color: '#fff',
        fontFamily: "'Sora', sans-serif", fontWeight: 800,
        fontSize: Math.round(size * 0.44) + 'px',
        letterSpacing: '-0.02em',
        ...style,
      }} className={className}>
        Z
      </div>
    );
  }
  return (
    <img
      src={srcs[srcIdx]}
      alt="Zack"
      width={size}
      height={size}
      onError={() => setSrcIdx(i => i + 1)}
      style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0, display: 'block', ...style }}
      className={className}
    />
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
function AppShell() {
  const {
    authed, authLoading, user, toggleTheme, theme, logout,
    income, expenses, alerts,
  } = useApp();

  const [page,       setPage]       = React.useState('dashboard');
  const [collapsed,  setCollapsed]  = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [showNotifs, setShowNotifs] = React.useState(false);
  const [txFilter,   setTxFilter]   = React.useState(null);

  const notifRef = React.useRef(null);

  React.useEffect(() => {
    const h = e => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  if (authLoading) {
    return (
      <div style={{ height: '100vh', display: 'grid', placeItems: 'center' }}>
        <svg style={{ animation: 'spin .8s linear infinite', color: 'var(--brand-blue)' }}
          width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      </div>
    );
  }

  if (!authed) return <AuthPage/>;

  const navItems = [
    { id: 'dashboard',    label: 'Dashboard',       icon: <IcoDashboard size={20}/> },
    { id: 'transactions', label: 'Transações',       icon: <IcoArrowRightLeft size={20}/> },
    { id: 'investments',  label: 'Investimentos',    icon: <IcoTrendingUp size={20}/> },
    { id: 'bills',        label: 'Contas a Pagar',   icon: <IcoReceipt size={20}/> },
    { id: 'reports',      label: 'Relatórios',       icon: <IcoBarChart size={20}/> },
    { id: 'goals',        label: 'Metas',            icon: <IcoTarget size={20}/> },
  ];

  const mobileNavItems = [
    { id: 'dashboard',    label: 'Dashboard',       icon: <IcoDashboard size={22}/>,    filter: null },
    { id: 'transactions', label: 'Entradas',         icon: <IcoArrowUpRight size={22}/>, filter: 'income'  },
    { id: 'transactions', label: 'Despesas',         icon: <IcoArrowDown size={22}/>,    filter: 'expense' },
    { id: 'investments',  label: 'Investimentos',    icon: <IcoTrendingUp size={22}/>,   filter: null },
    { id: 'reports',      label: 'Relatórios',       icon: <IcoBarChart size={22}/>,     filter: null },
    { id: 'bills',        label: 'Contas a Pagar',   icon: <IcoReceipt size={22}/>,      filter: null },
    { id: 'goals',        label: 'Metas',            icon: <IcoTarget size={22}/>,       filter: null },
    { id: 'zack',         label: 'Chat com Zack',    icon: <IcoBot size={22}/>,          filter: null, badge: 'IA' },
    { id: 'settings',     label: 'Configurações',    icon: <IcoSettings size={22}/>,     filter: null },
  ];

  const navigate = (p, filter) => {
    setPage(p);
    if (filter !== undefined) setTxFilter(filter);
    setMobileOpen(false);
    setShowNotifs(false);
  };

  const currentPage = () => {
    switch (page) {
      case 'dashboard':    return <DashboardPage onNavigate={(p, f) => navigate(p, f)}/>;
      case 'transactions': return <TransactionsPage filter={txFilter}/>;
      case 'investments':  return <InvestmentsPage/>;
      case 'bills':        return <BillsPage/>;
      case 'reports':      return <ReportsPage/>;
      case 'goals':        return <GoalsPage/>;
      case 'zack':         return <ZackPage/>;
      case 'settings':     return <SettingsPage/>;
      default:             return <DashboardPage onNavigate={navigate}/>;
    }
  };

  const pageLabels = {
    dashboard: 'Dashboard', transactions: 'Transações', investments: 'Investimentos',
    bills: 'Contas a Pagar', reports: 'Relatórios', goals: 'Metas',
    zack: 'Zack AI', settings: 'Configurações',
  };

  const notifTypeStyle = type => ({
    warning: { bg: '#fef3c7', color: '#92400e' },
    error:   { bg: '#fee2e2', color: '#991b1b' },
    info:    { bg: '#dbeafe', color: '#1e40af' },
  }[type] || { bg: 'var(--bg-2)', color: 'var(--text-2)' });

  return (
    <div id="app" className={collapsed ? 'collapsed' : ''}>

      {/* Mobile overlay */}
      <div className={`mobile-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)} aria-hidden="true"/>

      {/* Mobile sidebar */}
      <div className={`mobile-sidebar ${mobileOpen ? 'open' : ''}`}
        role="dialog" aria-modal="true" aria-label="Menu de navegação">
        <div className="mobile-sidebar-head">
          <div className="brand-mark" style={{ width: 42, height: 42, borderRadius: 12, overflow: 'hidden' }}>
            <ZackAvatar size={42} style={{ borderRadius: 12 }}/>
          </div>
          <div className="brand-name">Zack<small>Finance</small></div>
          <button className="mobile-sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
            <IcoX size={16}/>
          </button>
        </div>

        <nav className="mobile-nav">
          <div className="mobile-nav-section">Navegação</div>
          {mobileNavItems.map((item, idx) => {
            const isActive = page === item.id && (item.filter == null || item.filter === txFilter);
            return (
              <div key={idx} className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.id, item.filter)}>
                <span style={{ width: 24, height: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.icon}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
            );
          })}
        </nav>

        <div className="mobile-sidebar-foot">
          <div className="avatar" style={{ width: 42, height: 42, fontSize: 14 }}>{user.initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email || 'Plano Pro'}
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { logout(); setMobileOpen(false); }} title="Sair">
            <IcoLogOut size={16}/>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-head">
          <div className="brand-mark" style={{ overflow: 'hidden' }}>
            <ZackAvatar size={36} style={{ borderRadius: 10 }}/>
          </div>
          <div className="brand-name">Zack<small>Finance</small></div>
          <button className="btn btn-ghost btn-icon btn-sm" style={{ marginLeft: 'auto' }}
            onClick={() => setCollapsed(c => !c)}>
            <IcoMenu size={16}/>
          </button>
        </div>

        <nav className="nav">
          <div className="nav-section">Principal</div>
          {navItems.map(item => (
            <div key={item.id + item.label}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => navigate(item.id, null)}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}

          <div className="nav-section">IA</div>
          <div className={`nav-item ${page === 'zack' ? 'active' : ''}`} onClick={() => navigate('zack', null)}>
            <span className="nav-icon">
              <ZackAvatar size={20} style={{ borderRadius: '50%' }}/>
            </span>
            <span>Zack AI</span>
            <span className="nav-badge" style={{ background: 'var(--brand-green-soft)', fontSize: 9, padding: '2px 5px' }}>NOVO</span>
          </div>

          <div className="nav-section">Conta</div>
          <div className={`nav-item ${page === 'settings' ? 'active' : ''}`} onClick={() => navigate('settings', null)}>
            <span className="nav-icon"><IcoSettings size={20}/></span>
            <span>Configurações</span>
          </div>

          {!collapsed && (
            <div style={{ marginTop: 16, padding: '14px', background: 'var(--bg-2)', borderRadius: 12, border: '1px solid var(--line)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
                Resumo do mês
              </div>
              {[
                ['Receitas', income,            'delta-up',   v => fmt.brl(v, true)],
                ['Despesas', expenses,          'delta-down', v => '-' + fmt.brl(v, true)],
                ['Saldo',    income - expenses, '',           v => fmt.brl(v, true)],
              ].map(([label, val, cls, fmtFn]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: 'var(--text-2)' }}>{label}</span>
                  <span className={`tabular ${cls}`} style={{ fontWeight: 600 }}>{fmtFn(val)}</span>
                </div>
              ))}
            </div>
          )}
        </nav>

        <div className="sidebar-foot">
          <div className="avatar">{user.initials}</div>
          <div className="sidebar-foot-text" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>Plano Pro</div>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => navigate('settings', null)} title="Configurações">
            <IcoSettings size={16}/>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="main-area">
        <header className="topbar">
          <button className="hamburger-btn" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
            <IcoMenu size={20}/>
          </button>

          <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {pageLabels[page] || 'Dashboard'}
          </span>

          <div className="search" style={{ flex: 1 }}>
            <IcoSearch size={15}/>
            <input placeholder="Buscar transações, relatórios..."/>
            <kbd>⌘K</kbd>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
            <button className="icon-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}>
              {theme === 'dark' ? <IcoSun size={18}/> : <IcoMoon size={18}/>}
            </button>

            {/* Notifications bell */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button className="icon-btn" onClick={() => setShowNotifs(s => !s)} title="Notificações">
                <IcoBell size={18}/>
                {alerts.length > 0 && <span className="ping"/>}
              </button>
              {showNotifs && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <h4>Notificações</h4>
                    {alerts.length > 0 && (
                      <span style={{ fontSize: 11, background: 'var(--brand-red)', color: '#fff', padding: '2px 7px', borderRadius: 99, fontWeight: 700 }}>
                        {alerts.length}
                      </span>
                    )}
                  </div>
                  {alerts.length === 0 ? (
                    <div className="notif-empty">Sem alertas 🎉<br/><span style={{ fontSize: 12 }}>Suas finanças estão em dia!</span></div>
                  ) : alerts.map(a => {
                    const s = notifTypeStyle(a.type);
                    return (
                      <div key={a.id} className="notif-item">
                        <div className="notif-icon" style={{ background: s.bg, color: s.color, fontSize: 17 }}>{a.emoji}</div>
                        <div className="notif-text">
                          <div className="notif-title" style={{ color: s.color }}>{a.title}</div>
                          <div className="notif-msg">{a.msg}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ width: 1, height: 24, background: 'var(--line)', margin: '0 2px' }}/>
            <button className="icon-btn" onClick={() => navigate('settings', null)} title="Perfil">
              <div className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{user.initials}</div>
            </button>
          </div>
        </header>

        <div style={{ flex: 1, overflow: 'auto', overflowX: 'hidden', position: 'relative' }}>
          {currentPage()}
          {/* FAB inside scroll container so modals (z-index:200) render above it (z-index:70) */}
          {page !== 'zack' && (
            <button className="zack-fab" onClick={() => navigate('zack', null)} title="Abrir Zack AI">
              <ZackAvatar size={44} style={{ borderRadius: '50%' }}/>
            </button>
          )}
        </div>
      </div>

      <ToastHost/>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
function Root() {
  return (
    <AppProvider>
      <AppShell/>
    </AppProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root/>);
