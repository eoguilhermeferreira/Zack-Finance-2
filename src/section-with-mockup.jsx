// ─── Dashboard Mockup Card ────────────────────────────────────────────────────
function DashboardMockupCard() {
  const bars = [
    { h: 55, color: '#1565E0' },
    { h: 70, color: '#1565E0' },
    { h: 60, color: '#1565E0' },
    { h: 80, color: '#1565E0' },
    { h: 75, color: '#1565E0' },
    { h: 90, color: '#22c55e' },
  ];
  const txns = [
    { icon: '💼', label: 'Salário', val: '+R$ 8.500', c: '#22c55e' },
    { icon: '🛒', label: 'Mercado', val: '-R$ 287', c: '#ef4444' },
    { icon: '🏠', label: 'Aluguel', val: '-R$ 2.500', c: '#ef4444' },
  ];
  return (
    <div style={{
      width: 210, background: '#0E1726',
      borderRadius: 14, padding: '14px 14px 12px',
      boxShadow: '0 20px 60px rgba(0,0,0,.55)',
      border: '1px solid rgba(255,255,255,.08)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ color: '#a6b0c5', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>Dashboard</span>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg,#FFB37A,#E5484D)', display: 'grid', placeItems: 'center' }}>
          <span style={{ fontSize: 8, color: '#fff', fontWeight: 700 }}>G</span>
        </div>
      </div>

      {/* Balance card */}
      <div style={{
        background: 'linear-gradient(135deg,#1565E0,#0B3FA8)',
        borderRadius: 10, padding: '10px 12px', marginBottom: 8,
      }}>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,.65)', marginBottom: 3, fontWeight: 600 }}>SALDO TOTAL</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-.02em', fontFamily: 'Sora,Inter,sans-serif' }}>R$ 24.580</div>
        <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>Atualizado agora</div>
      </div>

      {/* Income / Expenses grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
        <div style={{ background: 'rgba(34,197,94,.1)', borderRadius: 8, padding: '7px 8px', border: '1px solid rgba(34,197,94,.2)' }}>
          <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,.5)', marginBottom: 2, fontWeight: 600 }}>RECEITAS</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#22c55e' }}>R$ 10.300</div>
        </div>
        <div style={{ background: 'rgba(239,68,68,.1)', borderRadius: 8, padding: '7px 8px', border: '1px solid rgba(239,68,68,.2)' }}>
          <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,.5)', marginBottom: 2, fontWeight: 600 }}>DESPESAS</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444' }}>R$ 3.193</div>
        </div>
      </div>

      {/* Mini bar chart */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,.4)', marginBottom: 5, fontWeight: 600 }}>ÚLTIMOS 6 MESES</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 46 }}>
          {bars.map((b, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              <div style={{
                width: '100%', height: `${b.h}%`,
                background: b.color === '#22c55e'
                  ? 'linear-gradient(180deg,#22c55e,#15803d)'
                  : 'linear-gradient(180deg,#1565E0,#0B3FA8)',
                borderRadius: '3px 3px 1px 1px',
                opacity: i === bars.length - 1 ? 1 : 0.6,
              }}/>
            </div>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div style={{ fontSize: 8, color: 'rgba(255,255,255,.4)', marginBottom: 5, fontWeight: 600 }}>RECENTES</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {txns.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 9 }}>{t.icon}</span>
              <span style={{ fontSize: 8.5, color: 'rgba(255,255,255,.65)', fontWeight: 500 }}>{t.label}</span>
            </div>
            <span style={{ fontSize: 8.5, fontWeight: 700, color: t.c }}>{t.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Investment Mockup Card ────────────────────────────────────────────────────
function InvestmentMockupCard() {
  const assets = [
    { label: 'Tesouro Selic', type: 'Renda Fixa', val: 'R$ 16.245', pct: '+8,3%', c: '#22c55e', dot: '#1565E0' },
    { label: 'IVVB11',        type: 'ETF',         val: 'R$ 7.637',  pct: '+12,3%', c: '#22c55e', dot: '#7C5CE0' },
    { label: 'Bitcoin',       type: 'Cripto',      val: 'R$ 2.698',  pct: '+28,5%', c: '#22c55e', dot: '#F2A03D' },
  ];

  // Donut ring using CSS box-shadow trick
  const donutSegments = [
    { color: '#1565E0', pct: 61 },
    { color: '#7C5CE0', pct: 17 },
    { color: '#22c55e', pct: 16 },
    { color: '#F2A03D', pct: 6  },
  ];

  return (
    <div style={{
      width: 200, background: '#0E1726',
      borderRadius: 14, padding: '14px 14px 12px',
      boxShadow: '0 20px 60px rgba(0,0,0,.45)',
      border: '1px solid rgba(255,255,255,.08)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ color: '#a6b0c5', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>Investimentos</span>
        <span style={{ fontSize: 8.5, color: '#22c55e', fontWeight: 700 }}>▲ +9,1%</span>
      </div>

      {/* Total patrimônio */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 8, color: 'rgba(255,255,255,.45)', marginBottom: 2, fontWeight: 600 }}>PATRIMÔNIO TOTAL</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-.02em', fontFamily: 'Sora,Inter,sans-serif' }}>R$ 45.333</div>
      </div>

      {/* Donut ring (pure CSS) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ position: 'relative', width: 52, height: 52, flexShrink: 0 }}>
          {/* Background ring */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: `conic-gradient(
              #1565E0 0% 61%,
              #7C5CE0 61% 78%,
              #22c55e 78% 94%,
              #F2A03D 94% 100%
            )`,
          }}/>
          {/* Inner circle cutout */}
          <div style={{
            position: 'absolute', inset: 10, borderRadius: '50%',
            background: '#0E1726',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 7, color: 'rgba(255,255,255,.5)', fontWeight: 700 }}>6 ativos</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {[
            { c: '#1565E0', l: 'Renda Fixa 61%' },
            { c: '#7C5CE0', l: 'FII 17%' },
            { c: '#22c55e', l: 'ETF/Ações 16%' },
            { c: '#F2A03D', l: 'Cripto 6%' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 5, height: 5, borderRadius: 2, background: item.c, flexShrink: 0 }}/>
              <span style={{ fontSize: 7, color: 'rgba(255,255,255,.55)', fontWeight: 500 }}>{item.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Asset rows */}
      <div style={{ fontSize: 8, color: 'rgba(255,255,255,.4)', marginBottom: 5, fontWeight: 600 }}>POSIÇÕES</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {assets.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: a.dot, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 7, color: '#fff', fontWeight: 700 }}>{a.label[0]}</span>
              </div>
              <div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,.8)', fontWeight: 600, lineHeight: 1.2 }}>{a.label}</div>
                <div style={{ fontSize: 6.5, color: 'rgba(255,255,255,.35)' }}>{a.type}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>{a.val}</div>
              <div style={{ fontSize: 7, color: a.c, fontWeight: 700 }}>{a.pct}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
