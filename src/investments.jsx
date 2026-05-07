function InvestmentsPage() {
  const { investments, totalInvested, totalReturn } = useApp();
  const [tab, setTab] = React.useState('holdings');

  const totalBase  = investments.reduce((s, i) => s + i.invested, 0);
  const totalReturnPct = ((totalInvested - totalBase) / totalBase * 100);

  // Allocation by type
  const byType = {};
  investments.forEach(i => { byType[i.type] = (byType[i.type] || 0) + i.current; });
  const typeColors = { 'Renda Fixa': '#1F8A4C', 'ETF': '#1FA8E0', 'Ações': '#1565E0', 'FII': '#F2A03D', 'Cripto': '#7C5CE0' };
  const allocationData = Object.entries(byType).map(([label, value]) => ({ label, value, color: typeColors[label] || '#8A93A6' }));

  // Performance history (mock monthly data)
  const perfData = [
    { month: 'Dez', value: 35800 },
    { month: 'Jan', value: 37200 },
    { month: 'Fev', value: 38600 },
    { month: 'Mar', value: 40100 },
    { month: 'Abr', value: 42800 },
    { month: 'Mai', value: totalInvested },
  ];

  return (
    <div className="page fadein">
      <div className="page-head">
        <div>
          <h1>Investimentos</h1>
          <p className="sub">Acompanhe sua carteira e rentabilidade</p>
        </div>
        <button className="btn btn-primary btn-sm"><IcoPlus size={15}/>Adicionar ativo</button>
      </div>

      {/* Summary cards */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        {[
          {
            label: 'Patrimônio Total',
            value: fmt.brl(totalInvested),
            iconEl: <IcoTrendingUp size={18} style={{ color: '#1565E0' }}/>,
            iconBg: '#dbeafe',
            delta: fmt.pct(totalReturnPct),
            deltaUp: totalReturnPct >= 0,
            sub: 'rentabilidade total',
          },
          {
            label: 'Valor Investido',
            value: fmt.brl(totalBase),
            iconEl: <IcoWallet size={18} style={{ color: '#1F8A4C' }}/>,
            iconBg: '#dcfce7',
            delta: fmt.num(investments.length) + ' ativos',
            deltaUp: true,
            sub: 'na carteira',
          },
          {
            label: 'Retorno Total',
            value: (totalReturn >= 0 ? '+' : '') + fmt.brl(totalReturn),
            iconEl: <IcoBarChart size={18} style={{ color: '#7C5CE0' }}/>,
            iconBg: '#ede9fe',
            delta: fmt.pct(totalReturnPct),
            deltaUp: totalReturn >= 0,
            sub: 'vs. aportado',
          },
          {
            label: 'Yield Médio',
            value: '9,4% a.a.',
            iconEl: <IcoTarget size={18} style={{ color: '#F2A03D' }}/>,
            iconBg: '#fef3c7',
            delta: 'CDI +2,1%',
            deltaUp: true,
            sub: 'acima do CDI',
          },
        ].map(s => (
          <div key={s.label} className="card stat">
            <div className="stat-head">
              <span className="label">{s.label}</span>
              <span className="stat-icon" style={{ background: s.iconBg }}>{s.iconEl}</span>
            </div>
            <div className="stat-value tabular">{s.value}</div>
            <div className="stat-foot">
              <span className={s.deltaUp ? 'delta-up' : 'delta-down'}>{s.delta}</span>
              <span>{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2-1" style={{ marginBottom: 20 }}>
        {/* Performance chart */}
        <div className="card chart-card">
          <div className="chart-head">
            <h3>Evolução do Patrimônio</h3>
            <div className="chip" style={{ fontSize: 12 }}>Últimos 6 meses</div>
          </div>
          <LineChart
            data={perfData.map(d => ({ month: d.month, value: d.value }))}
            keys={['value']}
            colors={['#1565E0']}
            height={200}/>
        </div>

        {/* Allocation donut */}
        <div className="card chart-card">
          <div className="chart-head"><h3>Alocação</h3></div>
          <DonutWithLegend data={allocationData} size={148} thickness={28}/>
        </div>
      </div>

      {/* Holdings table */}
      <div className="card">
        <div style={{ padding: '18px 18px 0' }}>
          <SectionHead title="Ativos na Carteira"/>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Ativo</th>
                <th>Tipo</th>
                <th style={{ textAlign: 'right' }}>Aportado</th>
                <th style={{ textAlign: 'right' }}>Atual</th>
                <th style={{ textAlign: 'right' }}>Retorno</th>
                <th style={{ textAlign: 'right' }}>Yield a.a.</th>
                <th style={{ textAlign: 'right' }}>Peso</th>
              </tr>
            </thead>
            <tbody>
              {investments.map(inv => {
                const weight = (inv.current / totalInvested * 100).toFixed(1);
                const isPos = inv.returnPct >= 0;
                return (
                  <tr key={inv.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{inv.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'JetBrains Mono' }}>{inv.ticker}</div>
                    </td>
                    <td>
                      <span className="inv-type" style={{ background: (typeColors[inv.type] || '#888') + '20', color: typeColors[inv.type] || '#888' }}>
                        {inv.type}
                      </span>
                    </td>
                    <td className="tabular" style={{ textAlign: 'right', color: 'var(--text-2)' }}>{fmt.brl(inv.invested)}</td>
                    <td className="tabular" style={{ textAlign: 'right', fontWeight: 600 }}>{fmt.brl(inv.current)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className={`tabular ${isPos ? 'delta-up' : 'delta-down'}`} style={{ fontWeight: 700 }}>
                        {isPos ? '+' : ''}{fmt.brl(inv.current - inv.invested)}
                      </div>
                      <div className={`tabular ${isPos ? 'delta-up' : 'delta-down'}`} style={{ fontSize: 12 }}>
                        {fmt.pct(inv.returnPct)}
                      </div>
                    </td>
                    <td className="tabular" style={{ textAlign: 'right', color: inv.yieldPct > 0 ? 'var(--brand-green-soft)' : 'var(--text-3)' }}>
                      {inv.yieldPct > 0 ? inv.yieldPct.toFixed(2).replace('.', ',') + '%' : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                        <div style={{ width: 48, height: 6, background: 'var(--line)', borderRadius: 99 }}>
                          <div style={{ width: weight + '%', height: '100%', background: typeColors[inv.type] || '#888', borderRadius: 99 }}/>
                        </div>
                        <span className="tabular" style={{ fontSize: 12.5, color: 'var(--text-2)', width: 36, textAlign: 'right' }}>{weight}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Footer totals */}
        <div style={{ padding: '14px 18px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', background: 'var(--surface-2)', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>{investments.length} ativos</span>
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginBottom: 2 }}>Aportado</div>
              <div className="tabular" style={{ fontWeight: 700 }}>{fmt.brl(totalBase)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginBottom: 2 }}>Atual</div>
              <div className="tabular" style={{ fontWeight: 700 }}>{fmt.brl(totalInvested)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginBottom: 2 }}>Retorno</div>
              <div className={`tabular ${totalReturn >= 0 ? 'delta-up' : 'delta-down'}`} style={{ fontWeight: 700 }}>
                {totalReturn >= 0 ? '+' : ''}{fmt.brl(totalReturn)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
