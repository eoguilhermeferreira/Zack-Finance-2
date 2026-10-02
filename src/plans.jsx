function PlansPage() {
  const { addToast } = useApp();
  // Mock current plan — in a real system this comes from the user's subscription
  const [currentPlan, setCurrentPlan] = React.useState('basic');
  const [confirming, setConfirming] = React.useState(null);

  const plans = [
    {
      id: 'basic',
      name: 'Básico',
      price: 'R$ 29,90',
      period: '/mês',
      color: '#1FA8E0',
      colorBg: '#e0f2fe',
      icon: <IcoWallet size={22}/>,
      features: [
        'Dashboard financeiro completo',
        'Controle de transações',
        'Contas a pagar',
        'Metas financeiras',
        'Relatórios básicos',
      ],
      locked: [
        'Zack AI (assistente inteligente)',
        'Relatórios avançados',
        'Múltiplas contas bancárias',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 'R$ 49,90',
      period: '/mês',
      color: '#1565E0',
      colorBg: '#dbeafe',
      icon: <IcoShield size={22}/>,
      highlight: true,
      features: [
        'Tudo do plano Básico',
        'Zack AI ilimitado',
        'Relatórios avançados',
        'Múltiplas contas bancárias',
        'Suporte prioritário',
        'Exportação de dados',
      ],
      locked: [],
    },
  ];

  const handleSwitch = (planId) => {
    if (planId === currentPlan) return;
    setConfirming(planId);
  };

  const confirmSwitch = () => {
    const plan = plans.find(p => p.id === confirming);
    setCurrentPlan(confirming);
    setConfirming(null);
    addToast(`Plano ${plan.name} ativado com sucesso!`);
  };

  return (
    <div className="page fadein">
      <div className="page-head">
        <div>
          <h1>Planos</h1>
          <p className="sub">Escolha o plano ideal para você</p>
        </div>
      </div>

      {/* Current plan banner */}
      <div className="card" style={{ padding: '18px 22px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: plans.find(p => p.id === currentPlan)?.colorBg, display: 'grid', placeItems: 'center', color: plans.find(p => p.id === currentPlan)?.color }}>
          {plans.find(p => p.id === currentPlan)?.icon}
        </div>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 2 }}>Seu plano atual</div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Plano {plans.find(p => p.id === currentPlan)?.name}</div>
        </div>
        <div className="tabular" style={{ marginLeft: 'auto', fontWeight: 700, fontSize: 18, color: plans.find(p => p.id === currentPlan)?.color }}>
          {plans.find(p => p.id === currentPlan)?.price}
          <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-3)' }}>/mês</span>
        </div>
      </div>

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
        {plans.map(plan => {
          const isActive = plan.id === currentPlan;
          return (
            <div key={plan.id} className="card" style={{
              padding: 0, overflow: 'hidden',
              border: isActive ? `2px solid ${plan.color}` : '2px solid var(--line)',
              position: 'relative',
            }}>
              {isActive && (
                <div style={{ position: 'absolute', top: 16, right: 16, background: plan.color, color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, letterSpacing: '.06em' }}>
                  ATUAL
                </div>
              )}

              {/* Card header */}
              <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: plan.colorBg, display: 'grid', placeItems: 'center', color: plan.color }}>
                    {plan.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18 }}>Plano {plan.name}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span className="tabular" style={{ fontSize: 32, fontWeight: 800, color: plan.color }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: 'var(--text-3)' }}>{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <div style={{ padding: '20px 24px 24px' }}>
                <div style={{ marginBottom: 12 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                      <IcoCheck size={15} style={{ color: plan.color, flexShrink: 0, marginTop: 1 }}/>
                      <span style={{ fontSize: 13.5, color: 'var(--text-1)' }}>{f}</span>
                    </div>
                  ))}
                  {plan.locked.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, opacity: .4 }}>
                      <IcoX size={15} style={{ flexShrink: 0, marginTop: 1 }}/>
                      <span style={{ fontSize: 13.5 }}>{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`btn btn-sm ${isActive ? 'btn-ghost' : 'btn-primary'}`}
                  style={{ width: '100%', justifyContent: 'center', marginTop: 8, ...(isActive ? { cursor: 'default', opacity: .6 } : { background: plan.color }) }}
                  onClick={() => handleSwitch(plan.id)}
                  disabled={isActive}>
                  {isActive ? 'Plano atual' : `Mudar para ${plan.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm switch dialog */}
      <ConfirmDialog
        open={!!confirming}
        onClose={() => setConfirming(null)}
        onConfirm={confirmSwitch}
        title={`Mudar para o plano ${plans.find(p => p.id === confirming)?.name}`}
        message={`Deseja mudar seu plano para ${plans.find(p => p.id === confirming)?.name} por ${plans.find(p => p.id === confirming)?.price}/mês?`}
      />
    </div>
  );
}
