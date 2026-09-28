function GoalsPage() {
  const { goals, addGoal, editGoal, deleteGoal, income, expenses, addToast } = useApp();
  const [showAdd,   setShowAdd]   = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const [form,      setForm]      = React.useState({ name: '', monthlyTarget: '', description: '' });
  const [delId,     setDelId]     = React.useState(null);

  const currentSavings = Math.max(0, income - expenses);

  const openAdd = () => {
    setForm({ name: '', monthlyTarget: '', description: '' });
    setEditingId(null);
    setShowAdd(true);
  };

  const openEdit = goal => {
    setForm({ name: goal.name, monthlyTarget: String(goal.monthlyTarget), description: goal.description || '' });
    setEditingId(goal.id);
    setShowAdd(true);
  };

  const saveForm = () => {
    const target = parseFloat(String(form.monthlyTarget).replace(',', '.'));
    if (!form.name.trim()) { addToast('Informe o nome da meta.', 'error'); return; }
    if (isNaN(target) || target <= 0) { addToast('Informe um valor válido.', 'error'); return; }
    const data = { name: form.name.trim(), monthlyTarget: target, description: form.description.trim() };
    if (editingId) editGoal(editingId, data);
    else           addGoal(data);
    setShowAdd(false);
  };

  const getStatus = goal => {
    const pct = income > 0 ? currentSavings / goal.monthlyTarget : 0;
    if (pct >= 1)   return { label: 'Meta atingida!',  color: 'var(--brand-green-soft)', bg: '#dcfce7' };
    if (pct >= 0.7) return { label: 'No caminho certo', color: 'var(--brand-amber)',      bg: '#fef3c7' };
    return                { label: 'Abaixo da meta',    color: 'var(--brand-red)',         bg: '#fee2e2' };
  };

  const totalTarget   = goals.reduce((s, g) => s + g.monthlyTarget, 0);
  const savingsPct    = totalTarget > 0 ? Math.min(1, currentSavings / totalTarget) * 100 : 0;
  const surplus       = income - expenses - totalTarget;

  return (
    <div className="page fadein">
      <div className="page-head">
        <div>
          <h1>Metas Financeiras</h1>
          <p className="sub">Defina quanto deseja poupar por mês e acompanhe seu progresso</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>
          <IcoPlus size={15}/>Nova meta
        </button>
      </div>

      {/* Summary cards */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        {[
          {
            label: 'Poupança atual', value: fmt.brl(currentSavings),
            icon: <IcoPiggyBank size={18} style={{ color: 'var(--brand-green-soft)' }}/>,
            iconBg: '#dcfce7',
          },
          {
            label: 'Meta total mensal', value: fmt.brl(totalTarget),
            icon: <IcoTarget size={18} style={{ color: 'var(--brand-blue)' }}/>,
            iconBg: '#dbeafe',
          },
          {
            label: surplus >= 0 ? 'Margem livre' : 'Déficit',
            value: fmt.brl(Math.abs(surplus)),
            icon: surplus >= 0
              ? <IcoArrowUpRight size={18} style={{ color: 'var(--brand-green-soft)' }}/>
              : <IcoAlertCircle  size={18} style={{ color: 'var(--brand-red)' }}/>,
            iconBg: surplus >= 0 ? '#dcfce7' : '#fee2e2',
          },
          {
            label: 'Progresso geral', value: Math.round(savingsPct) + '%',
            icon: <IcoBarChart size={18} style={{ color: 'var(--brand-violet)' }}/>,
            iconBg: '#ede9fe',
          },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px' }}>
            <div className="sc-row">
              <div className="sc-icon" style={{ background: s.iconBg }}>{s.icon}</div>
              <div className="sc-body">
                <div className="sc-label">{s.label}</div>
                <div className="sc-value tabular">{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      {totalTarget > 0 && (
        <div className="card" style={{ padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Progresso total das metas</span>
              <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 2 }}>
                {fmt.brl(currentSavings)} de {fmt.brl(totalTarget)} este mês
              </div>
            </div>
            <span style={{
              padding: '4px 12px', borderRadius: 99, fontWeight: 700, fontSize: 13,
              background: savingsPct >= 100 ? '#dcfce7' : savingsPct >= 70 ? '#fef3c7' : '#fee2e2',
              color: savingsPct >= 100 ? 'var(--brand-green)' : savingsPct >= 70 ? '#92400e' : 'var(--brand-red)',
            }}>
              {Math.round(savingsPct)}%
            </span>
          </div>
          <div className="goal-progress-bar">
            <div className="goal-progress-fill" style={{
              width: savingsPct + '%',
              background: savingsPct >= 100 ? 'linear-gradient(90deg,#2DB36A,#1F8A4C)'
                        : savingsPct >= 70  ? 'linear-gradient(90deg,#F2A03D,#d97706)'
                        :                    'linear-gradient(90deg,#E5484D,#b91c1c)',
            }}/>
          </div>
        </div>
      )}

      {/* Alert: savings below goals */}
      {totalTarget > 0 && currentSavings < totalTarget && income > 0 && (
        <div className="alert-banner warning" style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <strong>Atenção!</strong> Você está guardando {fmt.brl(currentSavings)} este mês, mas suas metas somam {fmt.brl(totalTarget)}.
            {surplus < 0 && ` Faltam ${fmt.brl(Math.abs(surplus))} para atingir todos os objetivos.`}
          </div>
        </div>
      )}

      {/* Goals list */}
      {goals.length === 0 ? (
        <Empty
          icon={<IcoTarget size={52}/>}
          title="Nenhuma meta cadastrada"
          subtitle="Crie uma meta mensal para acompanhar sua poupança e receber alertas inteligentes."
          action={
            <button className="btn btn-primary btn-sm" onClick={openAdd}>
              <IcoPlus size={14}/>Criar primeira meta
            </button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {goals.map(goal => {
            const pct    = income > 0 ? Math.min(100, (currentSavings / goal.monthlyTarget) * 100) : 0;
            const status = getStatus(goal);
            const savingsForGoal = Math.min(currentSavings, goal.monthlyTarget);
            return (
              <div key={goal.id} className="card goal-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700 }}>{goal.name}</h3>
                      <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700,
                        background: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                    </div>
                    {goal.description && (
                      <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.5 }}>
                        {goal.description}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button className="btn btn-sm btn-ghost" onClick={() => openEdit(goal)}>
                      <IcoPen size={14}/>
                    </button>
                    <button className="btn btn-sm btn-ghost btn-danger" onClick={() => setDelId(goal.id)}>
                      <IcoTrash size={14}/>
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Progresso este mês</span>
                    <span className="tabular" style={{ fontSize: 13, fontWeight: 700, color: status.color }}>
                      {fmt.brl(savingsForGoal)} / {fmt.brl(goal.monthlyTarget)}
                    </span>
                  </div>
                  <div className="goal-progress-bar">
                    <div className="goal-progress-fill" style={{
                      width: pct + '%',
                      background: pct >= 100 ? 'linear-gradient(90deg,#2DB36A,#1F8A4C)'
                                : pct >= 70  ? 'linear-gradient(90deg,#F2A03D,#d97706)'
                                :              'linear-gradient(90deg,#E5484D,#b91c1c)',
                    }}/>
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '12px 0', borderTop: '1px solid var(--line-2)' }}>
                  {[
                    { label: 'Meta mensal',   value: fmt.brl(goal.monthlyTarget)              },
                    { label: 'Já guardado',   value: fmt.brl(savingsForGoal)                  },
                    { label: 'Falta',         value: fmt.brl(Math.max(0, goal.monthlyTarget - currentSavings)) },
                    { label: 'Progresso',     value: Math.round(pct) + '%'                    },
                  ].map(s => (
                    <div key={s.label} style={{ flex: 1, minWidth: 90 }}>
                      <div style={{ fontSize: 11.5, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>
                        {s.label}
                      </div>
                      <div className="tabular" style={{ fontWeight: 700, fontSize: 15 }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Projection message */}
                <div style={{ padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 10,
                  border: '1px solid var(--line)', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55 }}>
                  {pct >= 100
                    ? `Parabéns! Você já atingiu sua meta "${goal.name}" este mês. Continue assim!`
                    : income > 0
                    ? `Para atingir esta meta, você pode gastar no máximo ${fmt.brl(income - goal.monthlyTarget)} este mês. Restam ${fmt.brl(Math.max(0, goal.monthlyTarget - currentSavings))} para atingir o objetivo.`
                    : 'Registre sua renda mensal para ver a projeção desta meta.'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)}
        title={editingId ? 'Editar meta' : 'Nova meta financeira'}
        subtitle="Defina quanto deseja poupar por mês"
        foot={
          <>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={saveForm}>{editingId ? 'Atualizar' : 'Criar meta'}</button>
          </>
        }>
        <div className="field">
          <label>Nome da meta</label>
          <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Ex: Reserva de emergência, Viagem..."/>
        </div>
        <div className="field">
          <label>Valor mensal a poupar (R$)</label>
          <input className="input" value={form.monthlyTarget} inputMode="decimal"
            onChange={e => setForm(f => ({ ...f, monthlyTarget: e.target.value }))}
            placeholder="Ex: 1000"/>
          <span style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
            Quanto você deseja guardar por mês para esta meta
          </span>
        </div>
        <div className="field">
          <label>Descrição (opcional)</label>
          <input className="input" value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Ex: Guardar 3-6 meses de despesas"/>
        </div>
        {income > 0 && form.monthlyTarget && !isNaN(parseFloat(form.monthlyTarget)) && (
          <div style={{ padding: '12px 14px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe',
            fontSize: 13, color: '#1e40af', lineHeight: 1.6 }}>
            💡 Com renda de {fmt.brl(income)}, você poderá gastar no máximo{' '}
            <strong>{fmt.brl(income - parseFloat(form.monthlyTarget.replace(',', '.')))}</strong>{' '}
            por mês para atingir esta meta.
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={Boolean(delId)} onClose={() => setDelId(null)}
        onConfirm={() => { deleteGoal(delId); setDelId(null); }}
        title="Excluir meta"
        message="Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita."/>
    </div>
  );
}
