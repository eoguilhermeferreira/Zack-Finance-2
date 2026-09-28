function BillsPage() {
  const { bills, updateBill, addToast } = useApp();
  const [showAdd, setShowAdd] = React.useState(false);
  const [localBills, setLocalBills] = React.useState(bills);
  const [newBill, setNewBill] = React.useState({ name: '', amount: '', dueDay: '', category: 'utilities', status: 'pending' });

  React.useEffect(() => { setLocalBills(bills); }, [bills]);

  const paid    = localBills.filter(b => b.status === 'paid');
  const pending = localBills.filter(b => b.status === 'pending');
  const overdue = localBills.filter(b => b.status === 'overdue');

  const totalMonthly = localBills.reduce((s, b) => s + b.amount, 0);
  const totalPaid    = paid.reduce((s, b) => s + b.amount, 0);
  const totalPending = [...pending, ...overdue].reduce((s, b) => s + b.amount, 0);

  const markPaid = id => {
    updateBill(id, { status: 'paid' });
    setLocalBills(bs => bs.map(b => b.id === id ? { ...b, status: 'paid' } : b));
    addToast('Conta marcada como paga!');
  };

  const saveBill = () => {
    const raw = parseFloat(String(newBill.amount).replace(',', '.'));
    if (!newBill.name || isNaN(raw) || !newBill.dueDay) return;
    const bill = { id: 'b' + Date.now(), ...newBill, amount: raw, dueDay: parseInt(newBill.dueDay) };
    setLocalBills(bs => [...bs, bill]);
    setShowAdd(false);
    setNewBill({ name: '', amount: '', dueDay: '', category: 'utilities', status: 'pending' });
    addToast('Conta adicionada!');
  };

  const BillCard = ({ bill }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--line-2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: CATEGORIES[bill.category]?.bg || 'var(--bg-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <IcoReceipt size={18} style={{ color: CATEGORIES[bill.category]?.color || 'var(--text-2)' }}/>
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{bill.name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 2 }}>
            Vencimento: todo dia {bill.dueDay}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ textAlign: 'right' }}>
          <div className="tabular" style={{ fontWeight: 700, fontSize: 15 }}>{fmt.brl(bill.amount)}</div>
          <StatusBadge status={bill.status}/>
        </div>
        {bill.status !== 'paid' && (
          <button className="btn btn-sm" onClick={() => markPaid(bill.id)}
            style={{ background: '#dcfce7', color: '#1F8A4C', borderColor: '#bbf7d0', whiteSpace: 'nowrap' }}>
            <IcoCheck size={13}/>Pagar
          </button>
        )}
      </div>
    </div>
  );

  const Section = ({ title, items, color, icon }) => {
    if (items.length === 0) return null;
    return (
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ color }}>{icon}</span>
          <h3 style={{ fontSize: 15, fontWeight: 700, color }}>{title}</h3>
          <span style={{ marginLeft: 'auto', fontSize: 12.5, color: 'var(--text-3)' }}>{items.length} conta(s)</span>
        </div>
        {items.map(b => <BillCard key={b.id} bill={b}/>)}
      </div>
    );
  };

  return (
    <div className="page fadein">
      <div className="page-head">
        <div>
          <h1>Contas a Pagar</h1>
          <p className="sub">Controle seus vencimentos mensais</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
          <IcoPlus size={15}/>Nova conta
        </button>
      </div>

      {/* Summary */}
      <div className="grid-3" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Mensal', value: fmt.brl(totalMonthly), color: 'var(--text)',          iconBg: 'var(--bg-2)', icon: <IcoReceipt size={18} style={{ color: 'var(--brand-blue)' }}/> },
          { label: 'Já Pago',     value: fmt.brl(totalPaid),    color: 'var(--brand-green)',    iconBg: '#dcfce7',     icon: <IcoCheck size={18} style={{ color: 'var(--brand-green)' }}/> },
          { label: 'A Pagar',     value: fmt.brl(totalPending), color: 'var(--brand-red)',      iconBg: '#fee2e2',     icon: <IcoAlertCircle size={18} style={{ color: 'var(--brand-red)' }}/> },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px' }}>
            <div className="sc-row">
              <div className="sc-icon" style={{ background: s.iconBg }}>{s.icon}</div>
              <div className="sc-body">
                <div className="sc-label">{s.label}</div>
                <div className="sc-value tabular" style={{ color: s.color }}>{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>Progresso do mês</span>
          <span className="tabular" style={{ fontSize: 13, color: 'var(--text-2)' }}>
            {totalMonthly > 0 ? Math.round(totalPaid / totalMonthly * 100) : 0}% pago
          </span>
        </div>
        <div style={{ height: 8, background: 'var(--line)', borderRadius: 99 }}>
          <div style={{ height: '100%', width: (totalMonthly > 0 ? totalPaid / totalMonthly * 100 : 0) + '%', background: 'linear-gradient(90deg, var(--brand-green-soft), #1F8A4C)', borderRadius: 99, transition: 'width .4s ease' }}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--text-3)' }}>
          <span>{fmt.brl(totalPaid)} pago</span>
          <span>{fmt.brl(totalPending)} restante</span>
        </div>
      </div>

      {/* Bills by status */}
      <Section title="Vencidas" items={overdue} color="var(--brand-red)" icon={<IcoAlertCircle size={16}/>}/>
      <Section title="Pendentes" items={pending} color="var(--brand-amber)" icon={<IcoBell size={16}/>}/>
      <Section title="Pagas" items={paid} color="var(--brand-green-soft)" icon={<IcoCheck size={16}/>}/>

      {localBills.length === 0 && (
        <Empty icon={<IcoReceipt size={48}/>} title="Nenhuma conta cadastrada"
          subtitle="Adicione suas contas recorrentes para não perder nenhum vencimento."
          action={<button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><IcoPlus size={14}/>Adicionar conta</button>}/>
      )}

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Nova Conta Recorrente" subtitle="Adicione um boleto ou assinatura mensal"
        foot={
          <>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={saveBill}>Salvar</button>
          </>
        }>
        <div style={{ display: 'grid', gap: 14 }}>
          <div className="field">
            <label>Nome da conta</label>
            <input className="input" value={newBill.name} onChange={e => setNewBill(b => ({ ...b, name: e.target.value }))} placeholder="Ex: Netflix, Aluguel..."/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>Valor (R$)</label>
              <input className="input" value={newBill.amount} onChange={e => setNewBill(b => ({ ...b, amount: e.target.value }))} placeholder="0,00" inputMode="decimal"/>
            </div>
            <div className="field">
              <label>Dia de vencimento</label>
              <input className="input" type="number" min="1" max="31" value={newBill.dueDay} onChange={e => setNewBill(b => ({ ...b, dueDay: e.target.value }))} placeholder="1-31"/>
            </div>
          </div>
          <div className="field">
            <label>Categoria</label>
            <select className="select" value={newBill.category} onChange={e => setNewBill(b => ({ ...b, category: e.target.value }))}>
              {Object.entries(CATEGORIES).filter(([, c]) => c.type === 'expense').map(([id, c]) => <option key={id} value={id}>{c.label}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
