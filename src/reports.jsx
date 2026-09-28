function ReportsPage() {
  const { transactions, monthlyData } = useApp();
  const [period, setPeriod] = React.useState('6m');
  const [chartType, setChartType] = React.useState('bar');

  // Stats for selected period
  const allIncome  = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const allExpense = Math.abs(transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
  const net = allIncome - allExpense;
  const avgMonthly = allExpense / 5;

  // Expense by category (all time)
  const byCat = {};
  transactions.filter(t => t.amount < 0).forEach(t => {
    byCat[t.category] = (byCat[t.category] || 0) + Math.abs(t.amount);
  });
  const catData = Object.entries(byCat)
    .map(([cat, val]) => ({ label: CATEGORIES[cat]?.label || cat, value: val, color: CATEGORIES[cat]?.color || '#888' }))
    .sort((a, b) => b.value - a.value);
  const catTotal = catData.reduce((s, d) => s + d.value, 0);

  // Income by category
  const byIncomeCat = {};
  transactions.filter(t => t.amount > 0).forEach(t => {
    byIncomeCat[t.category] = (byIncomeCat[t.category] || 0) + t.amount;
  });
  const incomeData = Object.entries(byIncomeCat)
    .map(([cat, val]) => ({ label: CATEGORIES[cat]?.label || cat, value: val, color: CATEGORIES[cat]?.color || '#888' }))
    .sort((a, b) => b.value - a.value);

  const summaryCards = [
    { label: 'Receitas totais',    value: fmt.brl(allIncome),   color: 'var(--brand-green-soft)', icon: <IcoArrowUpRight size={18}/> },
    { label: 'Despesas totais',    value: fmt.brl(allExpense),  color: 'var(--brand-red)',        icon: <IcoArrowDown size={18}/>    },
    { label: 'Saldo líquido',      value: fmt.brl(net),         color: net >= 0 ? 'var(--brand-blue)' : 'var(--brand-red)', icon: <IcoTarget size={18}/> },
    { label: 'Gasto médio/mês',    value: fmt.brl(avgMonthly),  color: 'var(--brand-amber)',      icon: <IcoBarChart size={18}/>     },
  ];

  return (
    <div className="page fadein">
      <div className="page-head">
        <div>
          <h1>Relatórios</h1>
          <p className="sub">Análise detalhada das suas finanças</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sm"><IcoDownload size={14}/>Exportar PDF</button>
        </div>
      </div>

      {/* Period selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>Período:</span>
        <div className="chart-tabs">
          {[['3m','3 meses'],['6m','6 meses'],['12m','12 meses'],['all','Tudo']].map(([v, l]) => (
            <button key={v} className={`chart-tab ${period === v ? 'active' : ''}`} onClick={() => setPeriod(v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        {summaryCards.map(s => (
          <div key={s.label} className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.color + '18', display: 'grid', placeItems: 'center', color: s.color, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '.03em', textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
              <div className="tabular" style={{ fontFamily: 'Sora', fontSize: 20, fontWeight: 700 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly chart */}
      <div className="card chart-card" style={{ marginBottom: 20 }}>
        <div className="chart-head">
          <h3>Receitas × Despesas</h3>
          <div className="chart-tabs">
            <button className={`chart-tab ${chartType === 'bar' ? 'active' : ''}`} onClick={() => setChartType('bar')}>Barras</button>
            <button className={`chart-tab ${chartType === 'line' ? 'active' : ''}`} onClick={() => setChartType('line')}>Linhas</button>
          </div>
        </div>
        {chartType === 'bar' ? (
          <BarChart
            data={monthlyData}
            keys={['income', 'expense']}
            colors={['#2DB36A', '#E5484D']}
            labels={['Receitas', 'Despesas']}
            height={240}/>
        ) : (
          <LineChart
            data={monthlyData}
            keys={['income', 'expense']}
            colors={['#2DB36A', '#E5484D']}
            labels={['Receitas', 'Despesas']}
            height={240}/>
        )}
      </div>

      {/* Category breakdown */}
      <div className="grid-2-1" style={{ marginBottom: 20 }}>
        {/* Expense breakdown */}
        <div className="card" style={{ padding: 20 }}>
          <SectionHead title="Despesas por Categoria" style={{ marginBottom: 20 }}/>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <DonutChart data={catData} size={140} thickness={26} centerValue={fmt.brl(catTotal, true)} centerLabel="despesas"/>
            <div style={{ flex: 1, minWidth: 200 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', paddingBottom: 8, color: 'var(--text-3)', fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>Categoria</th>
                    <th style={{ textAlign: 'right', paddingBottom: 8, color: 'var(--text-3)', fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>Valor</th>
                    <th style={{ textAlign: 'right', paddingBottom: 8, color: 'var(--text-3)', fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {catData.map((d, i) => (
                    <tr key={i}>
                      <td style={{ padding: '6px 0', borderBottom: '1px solid var(--line-2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }}/>
                          {d.label}
                        </div>
                      </td>
                      <td className="tabular" style={{ textAlign: 'right', padding: '6px 0', borderBottom: '1px solid var(--line-2)', fontWeight: 600 }}>{fmt.brl(d.value)}</td>
                      <td className="tabular" style={{ textAlign: 'right', padding: '6px 0', borderBottom: '1px solid var(--line-2)', color: 'var(--text-3)' }}>
                        {((d.value / catTotal) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Income breakdown */}
        <div className="card" style={{ padding: 20 }}>
          <SectionHead title="Fontes de Receita"/>
          <DonutWithLegend data={incomeData} size={130} thickness={24}/>
        </div>
      </div>

      {/* Insights */}
      <div className="card" style={{ padding: 20 }}>
        <SectionHead title="Insights do Período"/>
        <div style={{ display: 'grid', gap: 12 }}>
          {[
            { icon: <IcoSparkles size={16}/>, color: 'var(--brand-blue)', text: `Você poupou ${Math.round((allIncome - allExpense) / allIncome * 100)}% da sua renda no período — acima da meta recomendada de 20%.` },
            { icon: <IcoAlertCircle size={16}/>, color: 'var(--brand-amber)', text: `Alimentação representa ${((byCat.food || 0) / catTotal * 100).toFixed(0)}% das suas despesas. Considere revisar gastos com restaurantes e iFood.` },
            { icon: <IcoCheck size={16}/>, color: 'var(--brand-green-soft)', text: `Sua renda de freelance adicionou ${fmt.brl([...transactions].filter(t => t.category === 'freelance').reduce((s, t) => s + t.amount, 0))} ao período — ótima fonte extra!` },
            { icon: <IcoTrendingUp size={16}/>, color: 'var(--brand-violet)', text: `Suas assinaturas custam ${fmt.brl((byCat.subscriptions || 0) / 5)} por mês. Revise se todas ainda são utilizadas.` },
          ].map((ins, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--line)' }}>
              <span style={{ color: ins.color, flexShrink: 0, marginTop: 1 }}>{ins.icon}</span>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-2)' }}>{ins.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
