function SettingsPage() {
  const { user, profilePhoto, setProfilePhoto, theme, toggleTheme, logout, addToast, transactions, investments, bills, goals } = useApp();
  const [name, setName]       = React.useState(user.name);
  const [email, setEmail]     = React.useState(user.email);
  const photoInputRef = React.useRef(null);
  const [saved, setSaved]     = React.useState(false);
  const [currency, setCurrency] = React.useState('BRL');
  const [showLogout, setShowLogout] = React.useState(false);
  const [notifPerm, setNotifPerm]   = React.useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const [notifs, setNotifs] = React.useState({
    bills:    ZackNotif.billsEnabled,
    weekly:   ZackNotif.weeklyEnabled,
    insights: ZackNotif.insightsEnabled,
    goals:    ZackNotif.goalsEnabled,
  });

  const saveProfile = () => {
    addToast('Perfil salvo com sucesso!');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePhotoChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { addToast('Selecione uma imagem válida.', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { addToast('Imagem muito grande. Máximo 5MB.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      setProfilePhoto(ev.target.result);
      addToast('Foto atualizada!');
    };
    reader.readAsDataURL(file);
  };

  const toggleNotif = async key => {
    // Request permission on first enable
    if (!notifs[key] && notifPerm !== 'granted') {
      const p = await ZackNotif.requestPermission();
      setNotifPerm(p);
      if (p !== 'granted') {
        addToast('Permissão de notificação negada. Ative nas configurações do navegador.', 'warning');
        return;
      }
    }
    const next = !notifs[key];
    setNotifs(n => ({ ...n, [key]: next }));
    if (key === 'bills')    ZackNotif.setBills(next);
    if (key === 'weekly')   ZackNotif.setWeekly(next);
    if (key === 'insights') ZackNotif.setInsights(next);
    if (key === 'goals')    ZackNotif.setGoals(next);
    addToast(next ? 'Notificações ativadas!' : 'Notificações desativadas.', next ? 'success' : 'error');
  };

  const exportData = () => {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const blue = [21, 101, 224];
      const gray = [100, 100, 100];
      const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      let y = 18;

      // Header
      doc.setFillColor(...blue);
      doc.rect(0, 0, 210, 28, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18); doc.setFont('helvetica', 'bold');
      doc.text('Zack Finance', 14, 12);
      doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      doc.text(`Relatório financeiro gerado em ${today}`, 14, 20);
      doc.text(`${user.name} · ${user.email}`, 14, 25);
      y = 36;

      // ── Summary ──
      doc.setTextColor(...blue); doc.setFontSize(12); doc.setFont('helvetica', 'bold');
      doc.text('Resumo', 14, y); y += 6;
      const currentMonth = new Date().toISOString().slice(0, 7);
      const thisMonthTxns = transactions.filter(t => t.date.startsWith(currentMonth));
      const inc  = thisMonthTxns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
      const exp  = Math.abs(thisMonthTxns.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
      const bal  = transactions.reduce((s, t) => s + t.amount, 0);
      const totInv = investments.reduce((s, i) => s + i.current, 0);
      doc.autoTable({
        startY: y,
        head: [['Item', 'Valor']],
        body: [
          ['Saldo total acumulado', fmt.brl(bal)],
          [`Receitas (${currentMonth})`, fmt.brl(inc)],
          [`Despesas (${currentMonth})`, fmt.brl(exp)],
          ['Patrimônio investido', fmt.brl(totInv)],
        ],
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: blue, textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 246, 255] },
        margin: { left: 14, right: 14 },
      });
      y = doc.lastAutoTable.finalY + 10;

      // ── Transactions ──
      if (transactions.length > 0) {
        doc.setTextColor(...blue); doc.setFontSize(12); doc.setFont('helvetica', 'bold');
        doc.text('Transações', 14, y); y += 6;
        const txRows = [...transactions]
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 50)
          .map(t => [
            fmt.dateShort(t.date),
            t.description,
            CATEGORIES[t.category]?.label || t.category,
            (t.amount >= 0 ? '+' : '') + fmt.brl(t.amount),
          ]);
        doc.autoTable({
          startY: y,
          head: [['Data', 'Descrição', 'Categoria', 'Valor']],
          body: txRows,
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: blue, textColor: 255 },
          alternateRowStyles: { fillColor: [248, 250, 255] },
          columnStyles: { 3: { halign: 'right' } },
          margin: { left: 14, right: 14 },
        });
        y = doc.lastAutoTable.finalY + 10;
      }

      // ── Bills ──
      if (bills.length > 0) {
        if (y > 240) { doc.addPage(); y = 18; }
        doc.setTextColor(...blue); doc.setFontSize(12); doc.setFont('helvetica', 'bold');
        doc.text('Contas a Pagar', 14, y); y += 6;
        doc.autoTable({
          startY: y,
          head: [['Nome', 'Valor', 'Dia venc.', 'Status']],
          body: bills.map(b => [b.name, fmt.brl(b.amount), `Dia ${b.dueDay}`, b.status === 'paid' ? 'Pago' : b.status === 'overdue' ? 'Vencido' : 'Pendente']),
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: blue, textColor: 255 },
          alternateRowStyles: { fillColor: [248, 250, 255] },
          margin: { left: 14, right: 14 },
        });
        y = doc.lastAutoTable.finalY + 10;
      }

      // ── Investments ──
      if (investments.length > 0) {
        if (y > 240) { doc.addPage(); y = 18; }
        doc.setTextColor(...blue); doc.setFontSize(12); doc.setFont('helvetica', 'bold');
        doc.text('Investimentos', 14, y); y += 6;
        doc.autoTable({
          startY: y,
          head: [['Ativo', 'Tipo', 'Aportado', 'Atual', 'Retorno']],
          body: investments.map(i => [
            i.name, i.type, fmt.brl(i.invested), fmt.brl(i.current),
            (i.returnPct >= 0 ? '+' : '') + i.returnPct.toFixed(2) + '%',
          ]),
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: blue, textColor: 255 },
          alternateRowStyles: { fillColor: [248, 250, 255] },
          margin: { left: 14, right: 14 },
        });
      }

      // Footer
      const pages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setTextColor(...gray); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
        doc.text(`Zack Finance · Página ${i} de ${pages}`, 14, 290);
        doc.text(today, 196, 290, { align: 'right' });
      }

      doc.save(`zack-finance-${new Date().toISOString().slice(0, 10)}.pdf`);
      addToast('PDF exportado com sucesso!');
    } catch (e) {
      console.error('[Zack] Export error:', e);
      addToast('Erro ao gerar PDF. Tente novamente.', 'error');
    }
  };

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
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{right}</div>
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
        <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {profilePhoto
            ? <img src={profilePhoto} alt="Foto" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--line)' }}/>
            : <div className="avatar" style={{ width: 56, height: 56, fontSize: 18, borderRadius: '50%', flexShrink: 0 }}>{user.initials}</div>
          }
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
            <div style={{ color: 'var(--text-2)', fontSize: 13.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button className="btn btn-sm" onClick={() => photoInputRef.current?.click()}>
              <IcoUpload size={14}/>Foto
            </button>
            {profilePhoto && (
              <button className="btn btn-sm btn-ghost" onClick={() => { setProfilePhoto(null); addToast('Foto removida.', 'error'); }}>
                <IcoX size={14}/>
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 16 }}>
          <div className="field">
            <label>Nome completo</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)}/>
          </div>
          <div className="field">
            <label>E-mail</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)}/>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 16 }}>
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
        {notifPerm === 'denied' && (
          <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#92400e' }}>
            ⚠️ Notificações bloqueadas no navegador. Ative em Configurações do navegador → Permissões → Notificações.
          </div>
        )}
        {[
          { key: 'bills',    label: 'Vencimento de contas',  sub: 'Aviso 3, 2 dias antes e no dia do vencimento' },
          { key: 'weekly',   label: 'Resumo semanal',        sub: 'Relatório financeiro toda segunda-feira' },
          { key: 'insights', label: 'Insights do Zack',      sub: 'Alerta quando gastos ultrapassarem 80% da renda' },
          { key: 'goals',    label: 'Metas financeiras',     sub: 'Aviso quando meta estiver em risco' },
        ].map(n => (
          <Row key={n.key} label={n.label} sub={n.sub}
            right={<Toggle value={notifs[n.key]} onChange={() => toggleNotif(n.key)}/>}/>
        ))}
      </Section>

      {/* Security */}
      <Section title="Segurança">
        <Row label="Autenticação 2 fatores" sub="Adicione uma camada extra de segurança"
          right={<Toggle value={false} onChange={() => addToast('Autenticação 2 fatores em breve!', 'warning')}/>}/>
        <Row label="Sessões ativas" sub="1 sessão ativa" right={
          <button className="btn btn-sm btn-ghost" onClick={() => addToast('Outras sessões encerradas.', 'error')}>Encerrar outras</button>
        }/>
        <Row label="Exportar dados" sub="Baixe todas as suas finanças em JSON"
          right={<button className="btn btn-sm" onClick={exportData}><IcoDownload size={13}/>Exportar</button>}/>
      </Section>

      {/* Sign out */}
      <div style={{ paddingBottom: 32 }}>
        <button className="btn btn-sm btn-ghost" style={{ color: 'var(--text-3)', fontSize: 13 }}
          onClick={() => setShowLogout(true)}>
          <IcoLogOut size={14}/>Sair da conta
        </button>
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
