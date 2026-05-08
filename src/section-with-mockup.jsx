// ─── Dashboard Mockup Card ────────────────────────────────────────────────────
function DashboardMockupCard() {
  const bars = [
    { h: 55, color: '#1565E0', label: 'D' },
    { h: 70, color: '#1565E0', label: 'J' },
    { h: 65, color: '#1565E0', label: 'F' },
    { h: 80, color: '#1565E0', label: 'M' },
    { h: 85, color: '#1565E0', label: 'A' },
    { h: 75, color: '#2DB36A', label: 'M' },
  ];

  return (
    <div style={{
      width: 210,
      background: '#0E1726',
      borderRadius: 16,
      padding: '14px',
      boxShadow: '0 20px 60px rgba(0,0,0,.5)',
      border: '1px solid rgba(255,255,255,.08)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#A6B0C5', textTransform: 'uppercase', letterSpacing: '.08em' }}>Dashboard</span>
        <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'linear-gradient(135deg, #FFB37A, #E5484D)' }}/>
      </div>

      {/* Balance card */}
      <div style={{
        background: 'linear-gradient(135deg, #1565E0, #0B3FA8)',
        borderRadius: 10,
        padding: '10px 12px',
        marginBottom: 8,
      }}>
        <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,.6)', marginBottom: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Saldo Total</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', fontFamily: 'Sora, sans-serif', letterSpacing: '-.02em' }}>R$ 24.580</div>
        <div style={{ fontSize: 7, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>+R$ 7.107 este mês</div>
      </div>

      {/* Income / Expenses row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
        <div style={{ background: 'rgba(45,179,106,.12)', border: '1px solid rgba(45,179,106,.2)', borderRadius: 8, padding: '7px 8px' }}>
          <div style={{ fontSize: 7, color: '#2DB36A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2 }}>Receitas</div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#2DB36A' }}>R$ 10.300</div>
        </div>
        <div style={{ background: 'rgba(229,72,77,.12)', border: '1px solid rgba(229,72,77,.2)', borderRadius: 8, padding: '7px 8px' }}>
          <div style={{ fontSize: 7, color: '#E5484D', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2 }}>Despesas</div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#E5484D' }}>R$ 3.193</div>
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 7.5, color: '#6F7A93', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Últimos 6 meses</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 44 }}>
          {bars.map((b, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{ width: '100%', height: b.h * 0.44, background: b.color, borderRadius: '3px 3px 0 0', opacity: i === bars.length - 1 ? 1 : 0.55 }}/>
              <span style={{ fontSize: 6, color: '#6F7A93' }}>{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 8 }}>
        <div style={{ fontSize: 7.5, color: '#6F7A93', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Recentes</div>
        {[
          { desc: 'Salário XYZ', cat: '#2DB36A', amount: '+R$ 8.500' },
          { desc: 'Mercado Extra', cat: '#F2A03D', amount: '-R$ 287' },
          { desc: 'Netflix', cat: '#E5484D', amount: '-R$ 56' },
        ].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: t.cat, flexShrink: 0 }}/>
              <span style={{ fontSize: 7.5, color: '#A6B0C5', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.desc}</span>
            </div>
            <span style={{ fontSize: 8, fontWeight: 700, color: t.amount.startsWith('+') ? '#2DB36A' : '#E5484D' }}>{t.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Investment Mockup Card ───────────────────────────────────────────────────
function InvestmentMockupCard() {
  const assets = [
    { name: 'Tesouro Selic', pct: '+8,31%', color: '#1565E0', barW: 78 },
    { name: 'IVVB11',        pct: '+12,31%', color: '#7C5CE0', barW: 52 },
    { name: 'Bitcoin',       pct: '+28,50%', color: '#F2A03D', barW: 36 },
  ];

  return (
    <div style={{
      width: 190,
      background: 'rgba(14,23,38,.85)',
      borderRadius: 16,
      padding: '14px',
      boxShadow: '0 16px 50px rgba(0,0,0,.45)',
      border: '1px solid rgba(255,255,255,.1)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#A6B0C5', textTransform: 'uppercase', letterSpacing: '.08em' }}>Investimentos</span>
        <span style={{ fontSize: 7, color: '#2DB36A', fontWeight: 700, background: 'rgba(45,179,106,.15)', padding: '2px 5px', borderRadius: 999 }}>+9,4%</span>
      </div>

      {/* Donut ring + total */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
          {/* Outer ring */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'conic-gradient(#1565E0 0% 38%, #7C5CE0 38% 57%, #2DB36A 57% 72%, #F2A03D 72% 78%, #E5484D 78% 100%)',
          }}/>
          {/* Inner hole */}
          <div style={{
            position: 'absolute', inset: 10, borderRadius: '50%',
            background: 'rgba(14,23,38,.95)',
            display: 'grid', placeItems: 'center',
          }}>
            <span style={{ fontSize: 6, color: '#A6B0C5', fontWeight: 700 }}>5 ativos</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 7, color: '#6F7A93', fontWeight: 600, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '.04em' }}>Patrimônio</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#EAF0FB', fontFamily: 'Sora, sans-serif', letterSpacing: '-.02em' }}>R$ 45.333</div>
          <div style={{ fontSize: 7, color: '#2DB36A', fontWeight: 600, marginTop: 1 }}>+R$ 4.333 total</div>
        </div>
      </div>

      {/* Asset list */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {assets.map((a, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 7.5, color: '#A6B0C5', fontWeight: 600 }}>{a.name}</span>
              <span style={{ fontSize: 7.5, color: '#2DB36A', fontWeight: 700 }}>{a.pct}</span>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,.06)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${a.barW}%`, background: a.color, borderRadius: 999 }}/>
            </div>
          </div>
        ))}
      </div>

      {/* Legend dots */}
      <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: '4px 8px' }}>
        {[
          { color: '#1565E0', label: 'R. Fixa' },
          { color: '#7C5CE0', label: 'ETF' },
          { color: '#2DB36A', label: 'FII' },
          { color: '#F2A03D', label: 'Cripto' },
        ].map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{ width: 5, height: 5, borderRadius: 2, background: l.color }}/>
            <span style={{ fontSize: 6.5, color: '#6F7A93' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
