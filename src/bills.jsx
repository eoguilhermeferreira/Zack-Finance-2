function BillsPage() {
  const { bills, updateBill, addBill, deleteBill, addToast, addTransaction } = useApp();
  const [confirmDelete, setConfirmDelete] = React.useState(null);

  // Month selector
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = React.useState(today.toISOString().slice(0, 7));

  const monthLabel = m => {
    const d = new Date(m + '-02');
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };
  const prevMonth = () => {
    const d = new Date(selectedMonth + '-02');
    d.setMonth(d.getMonth() - 1);
    setSelectedMonth(d.toISOString().slice(0, 7));
  };
  const nextMonth = () => {
    const d = new Date(selectedMonth + '-02');
    d.setMonth(d.getMonth() + 1);
    setSelectedMonth(d.toISOString().slice(0, 7));
  };

  // Helper: how many months between two YYYY-MM strings
  const monthDiff = (from, to) => {
    const [fy, fm] = from.split('-').map(Number);
    const [ty, tm] = to.split('-').map(Number);
    return (ty - fy) * 12 + (tm - fm);
  };

  // Filter bills for the selected month
  const visibleBills = React.useMemo(() => {
    return bills.filter(b => {
      const t = b.type || 'recorrente';
      if (t === 'recorrente') {
        // Only show from the month it was added onwards
        if (!b.startMonth) return true;
        return monthDiff(b.startMonth, selectedMonth) >= 0;
      }
      if (t === 'avulsa') return b.startMonth === selectedMonth;
      if (t === 'parcelada') {
        if (!b.startMonth || !b.installments) return true;
        const diff = monthDiff(b.startMonth, selectedMonth);
        return diff >= 0 && diff < b.installments;
      }
      return true;
    });
  }, [bills, selectedMonth]);

  // For parcelada: compute current installment number for display
  const getInstallmentNum = b => {
    if (b.type !== 'parcelada' || !b.startMonth) return null;
    return monthDiff(b.startMonth, selectedMonth) + 1;
  };

  const sortByDay = arr => [...arr].sort((a, b) => (a.dueDay || 0) - (b.dueDay || 0));
  const paid    = sortByDay(visibleBills.filter(b => b.status === 'paid'));
  const pending = sortByDay(visibleBills.filter(b => b.status === 'pending'));
  const overdue = sortByDay(visibleBills.filter(b => b.status === 'overdue'));

  const totalMonthly = visibleBills.reduce((s, b) => s + b.amount, 0);
  const totalPaid    = paid.reduce((s, b) => s + b.amount, 0);
  const totalPending = [...pending, ...overdue].reduce((s, b) => s + b.amount, 0);

  const markPaid = id => {
    const bill = bills.find(b => b.id === id);
    updateBill(id, { status: 'paid' });
    if (bill) {
      const today2 = new Date();
      const dateStr = today2.toISOString().slice(0, 10);
      addTransaction({
        description: bill.name,
        amount: -Math.abs(bill.amount),
        date: dateStr,
        category: bill.category || 'utilities',
        account: 'checking',
        notes: 'Pagamento automático via Contas a Pagar',
      });
    }
    addToast('Conta paga e despesa registrada!');
  };

  // Add modal state
  const [showAdd, setShowAdd] = React.useState(false);
  const emptyBill = { name: '', amount: '', dueDay: '', category: 'utilities', status: 'pending', type: 'recorrente', installments: '', startMonth: selectedMonth };
  const [newBill, setNewBill] = React.useState(emptyBill);

  const saveBill = () => {
    const raw = parseFloat(String(newBill.amount).replace(',', '.'));
    if (!newBill.name || isNaN(raw) || !newBill.dueDay) return;
    const bill = {
      id: 'b' + Date.now(),
      name: newBill.name,
      amount: raw,
      dueDay: parseInt(newBill.dueDay),
      category: newBill.category,
      status: 'pending',
      type: newBill.type,
      installments: newBill.type === 'parcelada' ? parseInt(newBill.installments) || null : null,
      currentInstallment: newBill.type === 'parcelada' ? 1 : null,
      startMonth: newBill.startMonth, // all types store startMonth (recorrente uses today's month)
    };
    addBill(bill);
    setShowAdd(false);
    setNewBill(emptyBill);
  };

  const typeLabel = t => ({ recorrente: 'Recorrente', parcelada: 'Parcelada', avulsa: 'Avulsa' }[t] || t);
  const typeColor = t => ({ recorrente: 'var(--brand-blue)', parcelada: '#7C5CE0', avulsa: 'var(--brand-amber)' }[t] || 'var(--text-3)');

  const BillCard = ({ bill }) => {
    const instNum = getInstallmentNum(bill);
    const subLabel = bill.type === 'parcelada' && instNum
      ? `Parcela ${instNum}/${bill.installments} — dia ${bill.dueDay}`
      : bill.type === 'avulsa'
      ? `Avulsa — dia ${bill.dueDay}`
      : `Recorrente — todo dia ${bill.dueDay}`;

    const isCurrentMonth = selectedMonth === today.toISOString().slice(0, 7);
    const isOverdueUnpaid = bill.status === 'pending' && isCurrentMonth && bill.dueDay < today.getDate();

    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        padding: '14px 0', borderBottom: '1px solid var(--line-2)',
        ...(isOverdueUnpaid ? { background: 'rgba(229,72,77,.06)', margin: '0 -20px', padding: '14px 20px', borderBottom: '1px solid rgba(229,72,77,.15)' } : {}),
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: isOverdueUnpaid ? '#fee2e2' : (CATEGORIES[bill.category]?.bg || 'var(--bg-2)'), display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <IcoReceipt size={18} style={{ color: isOverdueUnpaid ? 'var(--brand-red)' : (CATEGORIES[bill.category]?.color || 'var(--text-2)') }}/>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: isOverdueUnpaid ? 'var(--brand-red)' : 'var(--text)' }}>{bill.name}</div>
            <div style={{ fontSize: 12, color: isOverdueUnpaid ? '#ef4444' : 'var(--text-3)', marginTop: 2 }}>{subLabel}{isOverdueUnpaid ? ' · vencida' : ''}</div>
            <span style={{ fontSize: 10, fontWeight: 700, color: typeColor(bill.type), background: 'var(--bg-2)', padding: '1px 6px', borderRadius: 99, marginTop: 3, display: 'inline-block' }}>
              {typeLabel(bill.type || 'recorrente')}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setConfirmDelete(bill)}
            title="Excluir" style={{ color: 'var(--brand-red)', flexShrink: 0 }}>
            <IcoTrash size={15}/>
          </button>
        </div>
      </div>
    );
  };

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

  // Generate month options (12 months back, 12 forward)
  const monthOptions = [];
  for (let i = -12; i <= 12; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const val = d.toISOString().slice(0, 7);
    monthOptions.push(val);
  }

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

      {/* Month navigator */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={prevMonth}><IcoChevronLeft size={16}/></button>
        <span style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: 15, textTransform: 'capitalize' }}>
          {monthLabel(selectedMonth)}
        </span>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={nextMonth}><IcoChevronRight size={16}/></button>
      </div>

      {/* Summary */}
      <div className="grid-3" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Mensal', value: fmt.brl(totalMonthly), color: 'var(--text)',       iconBg: 'var(--bg-2)', icon: <IcoReceipt size={18} style={{ color: 'var(--brand-blue)' }}/> },
          { label: 'Já Pago',     value: fmt.brl(totalPaid),    color: 'var(--brand-green)', iconBg: '#dcfce7',     icon: <IcoCheck size={18} style={{ color: 'var(--brand-green)' }}/> },
          { label: 'A Pagar',     value: fmt.brl(totalPending), color: 'var(--brand-red)',   iconBg: '#fee2e2',     icon: <IcoAlertCircle size={18} style={{ color: 'var(--brand-red)' }}/> },
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

      <Section title="Vencidas"  items={overdue}  color="var(--brand-red)"         icon={<IcoAlertCircle size={16}/>}/>
      <Section title="Pendentes" items={pending}  color="var(--brand-amber)"        icon={<IcoBell size={16}/>}/>
      <Section title="Pagas"     items={paid}     color="var(--brand-green-soft)"   icon={<IcoCheck size={16}/>}/>

      {visibleBills.length === 0 && (
        <Empty icon={<IcoReceipt size={48}/>} title="Nenhuma conta neste mês"
          subtitle="Adicione uma conta recorrente, parcelada ou avulsa."
          action={<button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><IcoPlus size={14}/>Adicionar conta</button>}/>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { deleteBill(confirmDelete.id); setConfirmDelete(null); }}
        title="Excluir conta"
        message={`Tem certeza que deseja excluir "${confirmDelete?.name}"? Ela será removida de todos os meses.`}/>

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Nova Conta" subtitle="Recorrente, parcelada ou avulsa"
        foot={
          <>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={saveBill}>Salvar</button>
          </>
        }>
        <div style={{ display: 'grid', gap: 14 }}>

          {/* Type selector */}
          <div className="field">
            <label>Tipo de conta</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { id: 'recorrente', label: 'Recorrente', sub: 'Todo mês' },
                { id: 'parcelada',  label: 'Parcelada',  sub: 'Ex: 10x' },
                { id: 'avulsa',     label: 'Avulsa',     sub: 'Só 1 mês' },
              ].map(t => (
                <button key={t.id} type="button"
                  onClick={() => setNewBill(b => ({ ...b, type: t.id }))}
                  style={{
                    padding: '10px 8px', borderRadius: 10, border: `2px solid ${newBill.type === t.id ? typeColor(t.id) : 'var(--line)'}`,
                    background: newBill.type === t.id ? 'var(--bg-2)' : 'transparent',
                    cursor: 'pointer', textAlign: 'center',
                  }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: newBill.type === t.id ? typeColor(t.id) : 'var(--text)' }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{t.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Nome da conta</label>
            <input className="input" value={newBill.name} onChange={e => setNewBill(b => ({ ...b, name: e.target.value }))} placeholder="Ex: Netflix, Parcela TV, Conta de luz..."/>
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

          {/* Parcelada: installments + start month */}
          {newBill.type === 'parcelada' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label>Total de parcelas</label>
                <input className="input" type="number" min="2" max="120" value={newBill.installments} onChange={e => setNewBill(b => ({ ...b, installments: e.target.value }))} placeholder="Ex: 10"/>
              </div>
              <div className="field">
                <label>Mês inicial</label>
                <select className="select" value={newBill.startMonth} onChange={e => setNewBill(b => ({ ...b, startMonth: e.target.value }))}>
                  {monthOptions.map(m => <option key={m} value={m} style={{ textTransform: 'capitalize' }}>{monthLabel(m)}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Avulsa: month */}
          {newBill.type === 'avulsa' && (
            <div className="field">
              <label>Mês desta conta</label>
              <select className="select" value={newBill.startMonth} onChange={e => setNewBill(b => ({ ...b, startMonth: e.target.value }))}>
                {monthOptions.map(m => <option key={m} value={m} style={{ textTransform: 'capitalize' }}>{monthLabel(m)}</option>)}
              </select>
            </div>
          )}

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
