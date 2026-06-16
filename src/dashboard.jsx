function DashboardPage({ onNavigate }) {
  const {
    balance, income, expenses, savingsRate, totalInvested, totalReturn,
    transactions, bills, monthlyData, alerts, goals,
  } = useApp();

  const recentTxns  = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const pendingBills = bills.filter(b => b.status !== 'paid');
  const pendingTotal = pendingBills.reduce((s, b) => s + b.amount, 0);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMo = transactions.filter(t => t.date.startsWith(currentMonth) && t.amount < 0);
  const byCat  = {};
  thisMo.forEach(t => { byCat[t.category] = (byCat[t.category] || 0) + Math.abs(t.amount); });
  const donutData = Object.entries(byCat)
    .map(([cat, val]) => ({ label: CATEGORIES[cat]?.label || cat, value: val, color: CATEGORIES[cat]?.color || '#ccc' }))
    .sort((a, b) => b.value - a.value).slice(0, 5);

  const sparkIncome  = [8200, 8500, 8500, 10138, 10842, income];
  const sparkExpense = [5120, 5551, 5847, 5854, 5252, expenses];
  const sparkBalance = [18200, 20400, 22000, 24500, 26100, balance];

  const statCards = [
    { label: 'Saldo Total',      value: fmt.brl(balance),    icon: <IcoWallet size={18} style={{ color: '#1565E0' }}/>,          iconBg: '#dbeafe', delta: '+R$ 2.180', deltaUp: true,  sub: 'vs. mês anterior', spark: sparkBalance,  sparkColor: '#1565E0' },
    { label: 'Receitas Mai.',    value: fmt.brl(income),     icon: <IcoArrowUpRight size={18} style={{ color: '#1F8A4C' }}/>,    iconBg: '#dcfce7', delta: '+R$ 1.458', deltaUp: true,  sub: 'vs. abril',        spark: sparkIncome,   sparkColor: '#2DB36A' },
    { label: 'Despesas Mai.',    value: fmt.brl(expenses),   icon: <IcoArrowDown size={18} style={{ color: '#E5484D' }}/>,       iconBg: '#fee2e2', delta: '-R$ 2.059', deltaUp: true,  sub: 'vs. abril',        spark: sparkExpense,  sparkColor: '#E5484D' },
    { label: 'Taxa de Poupança', value: savingsRate + '%',   icon: <IcoPiggyBank size={18} style={{ color: '#7C5CE0' }}/>,       iconBg: '#ede9fe', delta: '+8%',       deltaUp: true,  sub: 'vs. abril',        spark: [32,30,35,38,40,savingsRate], sparkColor: '#7C5CE0' },
  ];

  // Top alert for dashboard banner
  const topAlert = alerts.find(a => a.type === 'error') || alerts.find(a => a.type === 'warning');

  // Goals summary for widget
  const currentSavings = Math.max(0, income - expenses);
  const primaryGoal    = goals[0];

  return (
    <div className="page fadein">
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="sub">
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} · Visão geral das suas finanças
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-sm" onClick={() => onNavigate('transactions')}>
            <IcoPlus size={15}/>Nova transação
          </button>
        </div>
      </div>

      {/* Smart alert banner */}
      {topAlert && (
        <div className={`alert-banner ${topAlert.type}`}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>{topAlert.emoji}</span>
          <div>
            <strong>{topAlert.title}:</strong> {topAlert.msg}
          </div>
          <button
            onClick={() => onNavigate('goals')}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
              color: 'inherit', fontWeight: 700, fontSize: 12.5, whiteSpace: 'nowrap', flexShrink: 0 }}>
            Ver metas →
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        {statCards.map(s => (
          <div key={s.label} className="card stat">
            <div className="stat-head">
              <span className="label">{s.label}</span>
              <span className="stat-icon" style={{ background: s.iconBg }}>{s.icon}</span>
            </div>
            <div className="stat-value tabular">{s.value}</div>
            <div className="stat-foot">
              <span className={s.deltaUp ? 'delta-up' : 'delta-down'}>{s.delta}</span>
              <span>{s.sub}</span>
            </div>
            <div className="spark-bg">
              <Sparkline data={s.spark} color={s.sparkColor} width={160} height={52}/>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid-2-1" style={{ marginBottom: 20 }}>
        <div className="card chart-card">
          <div className="chart-head">
            <h3>Evolução Mensal</h3>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Últimos 6 meses</span>
          </div>
          <LineChart
            data={monthlyData}
            keys={['income', 'expense']}
            colors={['#2DB36A', '#E5484D']}
            labels={['Receitas', 'Despesas']}
            height={210}/>
        </div>

        <div className="card chart-card">
          <div className="chart-head"><h3>Despesas por Categoria</h3></div>
          {donutData.length > 0
            ? <DonutWithLegend data={donutData} size={136} thickness={24}/>
            : <Empty icon={<IcoPieChart size={36}/>} title="Sem despesas" subtitle="Nenhuma despesa este mês."/>
          }
        </div>
      </div>

      {/* Recent transactions + sidebar panel */}
      <div className="grid-2-1">
        <div className="card">
          <div style={{ padding: '18px 18px 0' }}>
            <SectionHead title="Transações Recentes"
              action={<button className="btn btn-sm btn-ghost" onClick={() => onNavigate('transactions')}>Ver todas <IcoChevronRight size={14}/></button>}/>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th className="mobile-hide">Categoria</th>
                  <th className="mobile-hide">Data</th>
                  <th style={{ textAlign: 'right' }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {recentTxns.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13.5 }}>{t.description}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>
                        {fmt.dateShort(t.date)} · <span className="mobile-hide">{ACCOUNTS.find(a => a.id === t.account)?.label}</span>
                      </div>
                    </td>
                    <td className="mobile-hide"><CatPill category={t.category}/></td>
                    <td className="mobile-hide" style={{ color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{fmt.dateShort(t.date)}</td>
                    <td style={{ textAlign: 'right' }}><AmountDisplay amount={t.amount}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Investments summary */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{ background: 'linear-gradient(135deg, #0B3FA8, #1565E0)', borderRadius: 12, padding: '18px', color: '#fff', marginBottom: 16 }}>
              <div style={{ fontSize: 11.5, opacity: .75, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                Carteira de Investimentos
              </div>
              <div style={{ fontFamily: 'Sora', fontSize: 24, fontWeight: 700 }}>{fmt.brl(totalInvested)}</div>
              <div style={{ fontSize: 13, marginTop: 6, opacity: .85 }}>
                Retorno total:{' '}
                <span style={{ fontWeight: 700, color: totalReturn >= 0 ? '#6EF0A0' : '#FF8A8A' }}>
                  {totalReturn >= 0 ? '+' : ''}{fmt.brl(totalReturn)}
                </span>
              </div>
              <button className="btn btn-sm" onClick={() => onNavigate('investments')}
                style={{ marginTop: 14, background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.25)', fontSize: 12.5 }}>
                Ver carteira <IcoChevronRight size={13}/>
              </button>
            </div>

            {/* Goals widget */}
            {primaryGoal && (
              <>
                <SectionHead title="Meta principal"
                  action={<button className="btn btn-sm btn-ghost" onClick={() => onNavigate('goals')}>Ver metas <IcoChevronRight size={14}/></button>}/>
                <div style={{ padding: '14px', background: 'var(--surface-2)', borderRadius: 12, border: '1px solid var(--line)' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{primaryGoal.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
                    <span style={{ color: 'var(--text-2)' }}>Meta: {fmt.brl(primaryGoal.monthlyTarget)}</span>
                    <span className="tabular" style={{ fontWeight: 700 }}>
                      {fmt.brl(Math.min(currentSavings, primaryGoal.monthlyTarget))}
                    </span>
                  </div>
                  <div className="goal-progress-bar">
                    <div className="goal-progress-fill" style={{
                      width: (Math.min(100, (currentSavings / primaryGoal.monthlyTarget) * 100)) + '%',
                      background: currentSavings >= primaryGoal.monthlyTarget
                        ? 'linear-gradient(90deg,#2DB36A,#1F8A4C)' : 'linear-gradient(90deg,#F2A03D,#d97706)',
                    }}/>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>
                    {currentSavings >= primaryGoal.monthlyTarget
                      ? '🎉 Meta atingida este mês!'
                      : `Faltam ${fmt.brl(primaryGoal.monthlyTarget - currentSavings)} para atingir`}
                  </div>
                </div>
              </>
            )}
            {!primaryGoal && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <button className="btn btn-sm btn-primary" onClick={() => onNavigate('goals')}>
                  <IcoTarget size={14}/>Criar meta de poupança
                </button>
              </div>
            )}
          </div>

          {/* Upcoming bills */}
          <div className="card" style={{ padding: 18 }}>
            <SectionHead title="Contas a Pagar"
              action={<button className="btn btn-sm btn-ghost" onClick={() => onNavigate('bills')}>Ver todas <IcoChevronRight size={14}/></button>}/>

            {pendingBills.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--text-3)', fontSize: 13 }}>
                Nenhuma conta pendente 🎉
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {pendingBills.slice(0, 4).map(b => (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: CATEGORIES[b.category]?.bg || 'var(--bg-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          <IcoReceipt size={16} style={{ color: CATEGORIES[b.category]?.color || 'var(--text-2)' }}/>
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13.5 }}>{b.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Dia {b.dueDay}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div className="tabular" style={{ fontWeight: 600, fontSize: 13.5 }}>{fmt.brl(b.amount)}</div>
                        <StatusBadge status={b.status}/>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{pendingBills.length} pendente(s)</span>
                  <span className="tabular" style={{ fontWeight: 700, fontSize: 14 }}>{fmt.brl(pendingTotal)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
