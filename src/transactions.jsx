function TransactionsPage() {
  const { transactions, addTransaction, editTransaction, deleteTransaction } = useApp();
  const [search, setSearch] = React.useState('');
  const [filterCat, setFilterCat] = React.useState('');
  const [filterType, setFilterType] = React.useState('');
  const [filterMonth, setFilterMonth] = React.useState('');
  const [showAdd, setShowAdd] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [deleting, setDeleting] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const PER_PAGE = 15;

  const months = React.useMemo(() => {
    const s = new Set(transactions.map(t => t.date.slice(0, 7)));
    return [...s].sort().reverse();
  }, [transactions]);

  const filtered = React.useMemo(() => {
    return transactions
      .filter(t => {
        if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterCat && t.category !== filterCat) return false;
        if (filterType === 'income' && t.amount <= 0) return false;
        if (filterType === 'expense' && t.amount >= 0) return false;
        if (filterMonth && !t.date.startsWith(filterMonth)) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, search, filterCat, filterType, filterMonth]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const totalIncome  = filtered.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalExpense = Math.abs(filtered.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));

  React.useEffect(() => { setPage(1); }, [search, filterCat, filterType, filterMonth]);

  const clearFilters = () => { setSearch(''); setFilterCat(''); setFilterType(''); setFilterMonth(''); };
  const hasFilters = search || filterCat || filterType || filterMonth;

  const editTxn = t => setEditing({ ...t, amount: String(Math.abs(t.amount)), type: t.amount > 0 ? 'income' : 'expense' });

  return (
    <div className="page fadein">
      <div className="page-head">
        <div>
          <h1>Transações</h1>
          <p className="sub">{fmt.num(filtered.length)} registro{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button className="btn btn-sm mobile-hide"><IcoUpload size={14}/>Importar</button>
          <button className="btn btn-sm mobile-hide"><IcoDownload size={14}/>Exportar</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><IcoPlus size={15}/>Nova</button>
        </div>
      </div>

      {/* Summary pills */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#dcfce7', borderRadius: 10, border: '1px solid #bbf7d0' }}>
          <IcoArrowUpRight size={15} style={{ color: 'var(--brand-green-soft)' }}/>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-green)' }}>+{fmt.brl(totalIncome)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#fee2e2', borderRadius: 10, border: '1px solid #fecaca' }}>
          <IcoArrowDown size={15} style={{ color: 'var(--brand-red)' }}/>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-red)' }}>-{fmt.brl(totalExpense)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--bg-2)', borderRadius: 10, border: '1px solid var(--line)' }}>
          <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>Saldo filtrado:</span>
          <span className="tabular" style={{ fontSize: 13, fontWeight: 700, color: (totalIncome - totalExpense) >= 0 ? 'var(--brand-green-soft)' : 'var(--brand-red)' }}>
            {(totalIncome - totalExpense) >= 0 ? '+' : ''}{fmt.brl(totalIncome - totalExpense)}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 14, marginBottom: 16 }}>
        <div className="filter-row">
          <div className="search" style={{ maxWidth: '100%', flex: 'unset' }}>
            <IcoSearch size={16}/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar transação..."/>
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 0 }}><IcoX size={14}/></button>}
          </div>
          <select className="select" style={{ width: 'auto' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">Tipo</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
          <select className="select" style={{ width: 'auto' }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">Categoria</option>
            {Object.entries(CATEGORIES).map(([id, c]) => <option key={id} value={id}>{c.label}</option>)}
          </select>
          <select className="select" style={{ width: 'auto' }} value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
            <option value="">Mês</option>
            {months.map(m => <option key={m} value={m}>{new Date(m + '-15').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</option>)}
          </select>
        </div>
        {hasFilters && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Filtros ativos:</span>
            <button className="btn btn-sm btn-ghost" style={{ fontSize: 12, padding: '4px 10px', color: 'var(--brand-red)' }} onClick={clearFilters}>
              <IcoX size={12}/> Limpar
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card">
        {paginated.length === 0 ? (
          <Empty icon={<IcoArrowRightLeft size={40}/>} title="Nenhuma transação encontrada"
            subtitle="Tente ajustar os filtros ou adicione uma nova transação."
            action={<button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><IcoPlus size={14}/>Adicionar</button>}/>
        ) : (
          <>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th className="mobile-hide">Data</th>
                    <th>Descrição</th>
                    <th className="mobile-hide">Categoria</th>
                    <th className="mobile-hide">Conta</th>
                    <th style={{ textAlign: 'right' }}>Valor</th>
                    <th style={{ width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(t => (
                    <tr key={t.id}>
                      <td className="mobile-hide" style={{ color: 'var(--text-2)', whiteSpace: 'nowrap', fontSize: 13 }}>{fmt.date(t.date)}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{t.description}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{fmt.dateShort(t.date)}<span className="mobile-hide"> · {ACCOUNTS.find(a => a.id === t.account)?.label}</span></div>
                      </td>
                      <td className="mobile-hide"><CatPill category={t.category}/></td>
                      <td className="mobile-hide" style={{ color: 'var(--text-2)', fontSize: 13 }}>{ACCOUNTS.find(a => a.id === t.account)?.label}</td>
                      <td style={{ textAlign: 'right' }}><AmountDisplay amount={t.amount}/></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => editTxn(t)} title="Editar">
                            <IcoEdit size={14}/>
                          </button>
                          <button className="btn btn-ghost btn-icon btn-sm btn-danger" onClick={() => setDeleting(t.id)} title="Excluir">
                            <IcoTrash size={14}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--line)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
                  Página {page} de {totalPages} · {filtered.length} registros
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-sm btn-ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                    <IcoChevronLeft size={14}/>Anterior
                  </button>
                  <button className="btn btn-sm btn-ghost" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                    Próxima<IcoChevronRight size={14}/>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Nova Transação" subtitle="Registre uma receita ou despesa">
        <TransactionForm
          onSave={d => { addTransaction(d); setShowAdd(false); }}
          onCancel={() => setShowAdd(false)}/>
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar Transação">
        {editing && (
          <TransactionForm
            initial={editing}
            onSave={d => { editTransaction(editing.id, d); setEditing(null); }}
            onCancel={() => setEditing(null)}/>
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteTransaction(deleting)}
        title="Excluir transação"
        message="Esta ação não pode ser desfeita. Tem certeza que deseja excluir esta transação?"/>
    </div>
  );
}
