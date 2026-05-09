function AuthPage() {
  const { login, register, supabaseActive } = useApp();
  const [mode,     setMode]     = React.useState('login');
  const [name,     setName]     = React.useState('');
  const [email,    setEmail]    = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPass, setShowPass] = React.useState(false);
  const [error,    setError]    = React.useState('');
  const [info,     setInfo]     = React.useState('');
  const [loading,  setLoading]  = React.useState(false);

  const switchMode = m => { setMode(m); setError(''); setInfo(''); };

  const submit = async e => {
    e && e.preventDefault();
    setError(''); setInfo('');
    if (mode === 'register' && !name.trim()) { setError('Informe seu nome completo.'); return; }
    if (!email.includes('@')) { setError('E-mail inválido.'); return; }
    if (password.length < 6)  { setError('Senha deve ter ao menos 6 caracteres.'); return; }
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error: err } = await login(email, password, name);
        if (err) setError(err);
      } else {
        const { error: err, confirmEmail } = await register(email, password, name.trim());
        if (err) { setError(err); }
        else if (confirmEmail) { setInfo('Conta criada! Verifique seu e-mail para confirmar antes de entrar.'); setMode('login'); }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* Art side */}
      <div className="auth-art">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div className="brand-mark" style={{ width: 44, height: 44, borderRadius: 13, overflow: 'hidden' }}>
              <ZackAvatar size={44} style={{ borderRadius: 13 }}/>
            </div>
            <span style={{ fontFamily: 'Sora', fontWeight: 700, fontSize: 20, color: '#fff' }}>Zack Finance</span>
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 800, color: '#fff', lineHeight: 1.2, maxWidth: 400 }}>
            Controle financeiro<br/>
            <span style={{ color: 'rgba(255,255,255,.65)' }}>inteligente e simples.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,.6)', marginTop: 20, fontSize: 15, lineHeight: 1.7, maxWidth: 360 }}>
            Acompanhe receitas, despesas e investimentos em um único lugar — com insights personalizados do Zack AI.
          </p>
        </div>

        <div className="mockup-cards-area">
          <div className="mockup-card"><DashboardMockupCard/></div>
          <div className="mockup-card-secondary"><InvestmentMockupCard/></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 3 }}>
          {[['Transações automatizadas','✓'],['Carteira de investimentos','✓'],['Insights com IA do Zack','✓']].map(([label, icon]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,.8)', fontSize: 14 }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{icon}</span>
              {label}
            </div>
          ))}
          <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 12, marginTop: 8 }}>© 2026 Zack Finance. Todos os direitos reservados.</p>
        </div>
      </div>

      {/* Form side */}
      <div className="auth-form-side">
        <div className="form-card">
          {/* Mobile brand */}
          <div style={{ display: 'none' }} className="mobile-brand-top">
            <ZackAvatar size={48} style={{ borderRadius: 14, margin: '0 auto 16px' }}/>
          </div>

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
              {mode === 'login' ? 'Bem-vindo de volta 👋' : 'Criar conta'}
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: 14.5 }}>
              {mode === 'login' ? 'Entre na sua conta Zack Finance.' : 'Comece a organizar suas finanças hoje.'}
            </p>
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'register' && (
              <div className="field">
                <label>Nome completo</label>
                <input className="input" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Seu nome" autoComplete="name"/>
              </div>
            )}
            <div className="field">
              <label>E-mail</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com" autoComplete="email"/>
            </div>
            <div className="field">
              <label>Senha</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  style={{ paddingRight: 46 }}/>
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}>
                  {showPass ? <IcoEyeOff size={18}/> : <IcoEye size={18}/>}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 13px',
                background: '#fee2e2', borderRadius: 10, color: 'var(--brand-red)', fontSize: 13.5, lineHeight: 1.5 }}>
                <IcoAlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }}/>
                {error}
              </div>
            )}

            {info && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 13px',
                background: '#dcfce7', borderRadius: 10, color: '#1F8A4C', fontSize: 13.5, lineHeight: 1.5 }}>
                <IcoCheck size={16} style={{ flexShrink: 0, marginTop: 1 }}/>
                {info}
              </div>
            )}

            <button type="submit" className="btn btn-primary"
              style={{ width: '100%', padding: '14px', marginTop: 4, justifyContent: 'center', gap: 10, fontSize: 15 }}
              disabled={loading}>
              {loading && (
                <svg style={{ animation: 'spin .8s linear infinite' }} width="18" height="18"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              )}
              {loading ? (mode === 'login' ? 'Entrando...' : 'Criando conta...') : (mode === 'login' ? 'Entrar' : 'Criar conta')}
            </button>

            {mode === 'login' && (
              <div style={{ textAlign: 'center' }}>
                <button type="button" onClick={() => setInfo('Recurso disponível em breve. Contate o suporte.')}
                  style={{ background: 'none', border: 'none', color: 'var(--brand-blue)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
                  Esqueci minha senha
                </button>
              </div>
            )}
          </form>

          <div style={{ marginTop: 28, textAlign: 'center', fontSize: 14, color: 'var(--text-2)' }}>
            {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
            <button onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              style={{ background: 'none', border: 'none', color: 'var(--brand-blue)', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              {mode === 'login' ? 'Criar conta grátis' : 'Entrar'}
            </button>
          </div>

          {/* Zack branding at bottom */}
          <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 10, padding: '14px', background: 'var(--bg-2)', borderRadius: 12, border: '1px solid var(--line)' }}>
            <ZackAvatar size={38} style={{ borderRadius: '50%', flexShrink: 0 }}/>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>Zack AI incluso</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Assistente financeiro inteligente integrado ao app</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
