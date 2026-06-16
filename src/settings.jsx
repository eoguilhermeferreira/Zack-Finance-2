function SettingsPage() {
  const { user, theme, toggleTheme, logout, addToast } = useApp();
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);
  const [saved, setSaved] = React.useState(false);
  const [currency, setCurrency] = React.useState('BRL');
  const [notifs, setNotifs] = React.useState({ bills: true, weekly: true, insights: true, goals: false });
  const [showLogout, setShowLogout] = React.useState(false);

  const saveProfile = () => {
    addToast('Perfil salvo com sucesso!');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleNotif = k => setNotifs(n => ({ ...n, [k]: !n[k] }));

  const Toggle = ({ value, onChange }) => (
    <button onClick={onChange} style={{
      width: 44, height: 24, borderRadius: 99, cursor: 'pointer',
      background: value ? 'var(--brand-blue)' : 'var(--line)',
      border: 'none', position: 'relative', transition: 'background .2s ease', flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 3, left: value ? 23 : 3, width: 18, height: 18,
        background: '#fff', borderRadius: '50%', transition: 'left .2s ease',
        boxShadow: '0 1px 4px rgba(0,0,0,.2)',
      }}/>
    </button>
  );

  const Section = ({ title, children }) => (
    <div className="card" style={{ padding: 24, marginBottom: 16 }}>
      <h3 style={{ fontSize: 15.5, fontWeight: 700, marginBottom: 20 }}>{title}</h3>
      {children}
    </div>
  );

  const Row = ({ label, sub, right }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--line-2)' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );

  return (
    <div className="page fadein">
      <div className="page-head">
        <div>
          <h1>Configurações</h1>
          <p className="sub">Gerencie sua conta e preferências</p>
        </div>
      </div>

      {/* Profile */}
      <Section title="Perfil">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div className="avatar" style={{ width: 56, height: 56, fontSize: 18, borderRadius: '50%' }}>
            {user.initials}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{user.name}</div>
            <div style={{ color: 'var(--text-2)', fontSize: 13.5 }}>{user.email}</div>
          </div>
          <button className="btn btn-sm" style={{ marginLeft: 'auto' }}>
            <IcoUpload size={14}/>Foto
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div className="field">
            <label>Nome completo</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)}/>
          </div>
          <div className="field">
            <label>E-mail</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)}/>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div className="field">
            <label>Senha atual</label>
            <input className="input" type="password" placeholder="••••••••"/>
          </div>
          <div className="field">
            <label>Nova senha</label>
            <input className="input" type="password" placeholder="••••••••"/>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={saveProfile}>
          {saved ? <><IcoCheck size={14}/>Salvo!</> : 'Salvar alterações'}
        </button>
      </Section>

      {/* Appearance */}
      <Section title="Aparência">
        <Row
          label="Tema"
          sub="Escolha entre modo claro e escuro"
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <IcoSun size={16} style={{ color: 'var(--text-3)' }}/>
              <Toggle value={theme === 'dark'} onChange={toggleTheme}/>
              <IcoMoon size={16} style={{ color: 'var(--text-3)' }}/>
            </div>
          }
        />
        <Row
          label="Moeda"
          sub="Moeda utilizada em todo o sistema"
          right={
            <select className="select" style={{ width: 'auto' }} value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="BRL">R$ Real (BRL)</option>
              <option value="USD">$ Dólar (USD)</option>
              <option value="EUR">€ Euro (EUR)</option>
            </select>
          }
        />
        <Row
          label="Idioma"
          sub="Idioma da interface"
          right={
            <select className="select" style={{ width: 'auto' }}>
              <option>Português (BR)</option>
              <option>English</option>
            </select>
          }
        />
      </Section>

      {/* Notifications */}
      <Section title="Notificações">
        {[
          { key: 'bills',    label: 'Vencimento de contas',  sub: 'Alertas 3 dias antes do vencimento' },
          { key: 'weekly',   label: 'Resumo semanal',        sub: 'Relatório financeiro toda segunda-feira' },
          { key: 'insights', label: 'Insights do Zack',      sub: 'Dicas e análises personalizadas' },
          { key: 'goals',    label: 'Metas financeiras',     sub: 'Progresso das metas definidas' },
        ].map(n => (
          <Row key={n.key} label={n.label} sub={n.sub}
            right={<Toggle value={notifs[n.key]} onChange={() => toggleNotif(n.key)}/>}/>
        ))}
      </Section>

      {/* Plan */}
      <Section title="Plano e Segurança">
        <div style={{ background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-blue-deep))', borderRadius: 12, padding: 20, color: '#fff', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <IcoShield size={20}/>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Plano Pro</div>
              <div style={{ opacity: .7, fontSize: 13 }}>Todos os recursos desbloqueados</div>
            </div>
            <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,.2)', padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>ATIVO</span>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, opacity: .85 }}>
            <span>✓ IA ilimitada</span>
            <span>✓ Relatórios avançados</span>
            <span>✓ Múltiplas contas</span>
          </div>
        </div>

        <Row label="Autenticação 2 fatores" sub="Adicione uma camada extra de segurança"
          right={<Toggle value={false} onChange={() => addToast('Em breve disponível!', 'warning')}/>}/>
        <Row label="Sessões ativas" sub="1 sessão ativa" right={
          <button className="btn btn-sm btn-ghost" onClick={() => addToast('Sessões encerradas.', 'error')}>Encerrar outras</button>
        }/>
        <Row label="Exportar dados" sub="Baixe todos os seus dados em JSON"
          right={<button className="btn btn-sm"><IcoDownload size={13}/>Exportar</button>}/>
      </Section>

      {/* Danger zone */}
      <div className="card" style={{ padding: 24, marginBottom: 16, borderColor: '#fecaca' }}>
        <h3 style={{ fontSize: 15.5, fontWeight: 700, marginBottom: 16, color: 'var(--brand-red)' }}>Zona de Perigo</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-sm btn-danger" onClick={() => setShowLogout(true)}>
            <IcoLogOut size={14}/>Sair da conta
          </button>
          <button className="btn btn-sm btn-danger" onClick={() => addToast('Dados limpos.', 'error')}>
            <IcoTrash size={14}/>Limpar dados de demonstração
          </button>
          <button className="btn btn-sm btn-danger" onClick={() => addToast('Entre em contato com o suporte.', 'warning')}>
            <IcoX size={14}/>Excluir conta
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={logout}
        title="Sair da conta"
        message="Tem certeza que deseja sair? Você precisará entrar novamente para acessar suas finanças."/>
    </div>
  );
}
