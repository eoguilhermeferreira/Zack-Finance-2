// ─── Toast Host ───────────────────────────────────────────────────────────────
function ToastHost() {
  const { toasts } = useApp();
  const dotColor = t => t.type === 'error' ? 'var(--brand-red)' : t.type === 'warning' ? 'var(--brand-amber)' : 'var(--brand-green-soft)';
  return (
    <div className="toast-host">
      {toasts.map(t => (
        <div key={t.id} className="toast">
          <span className="dot" style={{ background: dotColor(t) }}/>
          <span style={{ fontSize: 13.5, fontWeight: 500 }}>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, subtitle, children, foot, maxWidth = 520 }) {
  React.useEffect(() => {
    if (!open) return;
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth }}>
        <div className="modal-head">
          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><IcoX size={18}/></button>
        </div>
        <div className="modal-body">{children}</div>
        {foot && <div className="modal-foot">{foot}</div>}
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth={420}
      foot={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-danger" onClick={() => { onConfirm(); onClose(); }}>Confirmar</button>
        </>
      }
    >
      <p style={{ color: 'var(--text-2)', margin: 0, lineHeight: 1.6 }}>{message}</p>
    </Modal>
  );
}

// ─── Category Pill ────────────────────────────────────────────────────────────
function CatPill({ category }) {
  const cat = CATEGORIES[category] || CATEGORIES.other;
  return (
    <span className="cat-pill" style={{ background: cat.bg, color: cat.color }}>
      {cat.label}
    </span>
  );
}

// ─── Amount display ───────────────────────────────────────────────────────────
function AmountDisplay({ amount }) {
  const isIncome = amount > 0;
  return (
    <span className="tabular" style={{ fontWeight: 600, fontSize: 13.5, color: isIncome ? 'var(--brand-green-soft)' : 'var(--brand-red)' }}>
      {isIncome ? '+' : ''}{fmt.brl(amount)}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skel({ h = 16, w = '100%', r = 8, style: s }) {
  return <div className="skel" style={{ height: h, width: w, borderRadius: r, ...s }} />;
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function Empty({ icon, title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', gap: 12 }}>
      {icon && <div style={{ color: 'var(--text-3)', opacity: .5 }}>{icon}</div>}
      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-2)' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 320, color: 'var(--text-3)', lineHeight: 1.6 }}>{subtitle}</div>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHead({ title, action, style: s }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, ...s }}>
      <h3 style={{ fontSize: 15.5, fontWeight: 700 }}>{title}</h3>
      {action}
    </div>
  );
}

// ─── Transaction Form ─────────────────────────────────────────────────────────
function TransactionForm({ initial = {}, onSave, onCancel }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = React.useState({
    date: today, description: '', amount: '',
    type: 'expense', category: 'food', account: 'checking', notes: '',
    ...initial,
  });
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const incCats = Object.entries(CATEGORIES).filter(([, c]) => c.type === 'income');
  const expCats = Object.entries(CATEGORIES).filter(([, c]) => c.type === 'expense');
  const cats = form.type === 'income' ? incCats : expCats;

  const handleSubmit = () => {
    if (!form.description.trim() || !form.amount) return;
    const raw = parseFloat(String(form.amount).replace(',', '.'));
    if (isNaN(raw) || raw <= 0) return;
    onSave({
      date: form.date,
      description: form.description.trim(),
      amount: form.type === 'expense' ? -Math.abs(raw) : Math.abs(raw),
      category: form.category,
      account: form.account,
      notes: form.notes.trim(),
    });
  };

  const typeBtn = (t, label, col) => (
    <button key={t} onClick={() => { setF('type', t); setF('category', t === 'income' ? 'salary' : 'food'); }}
      className="btn btn-sm" style={form.type === t ? { background: col + '22', color: col, borderColor: col + '55', flex: 1 } : { flex: 1 }}>
      {label}
    </button>
  );

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div className="field">
        <label>Tipo</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {typeBtn('expense', '− Despesa', 'var(--brand-red)')}
          {typeBtn('income',  '+ Receita', 'var(--brand-green-soft)')}
        </div>
      </div>
      <div className="field">
        <label>Descrição</label>
        <input className="input" value={form.description} onChange={e => setF('description', e.target.value)} placeholder="Ex: Supermercado, Salário..."/>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="field">
          <label>Valor (R$)</label>
          <input className="input" value={form.amount} onChange={e => setF('amount', e.target.value)} placeholder="0,00" inputMode="decimal"/>
        </div>
        <div className="field">
          <label>Data</label>
          <input className="input" type="date" value={form.date} onChange={e => setF('date', e.target.value)}/>
        </div>
        <div className="field">
          <label>Categoria</label>
          <select className="select" value={form.category} onChange={e => setF('category', e.target.value)}>
            {cats.map(([id, c]) => <option key={id} value={id}>{c.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Conta</label>
          <select className="select" value={form.account} onChange={e => setF('account', e.target.value)}>
            {ACCOUNTS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label>Observações (opcional)</label>
        <textarea className="textarea" value={form.notes} onChange={e => setF('notes', e.target.value)} placeholder="Nota adicional..." style={{ minHeight: 60 }}/>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
        <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
        <button className="btn btn-primary" onClick={handleSubmit}>Salvar transação</button>
      </div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    paid:    { label: 'Pago',      color: 'var(--brand-green-soft)', bg: '#dcfce7' },
    pending: { label: 'Pendente',  color: 'var(--brand-amber)',      bg: '#fef3c7' },
    overdue: { label: 'Vencido',   color: 'var(--brand-red)',        bg: '#fee2e2' },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}
