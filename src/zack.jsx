// ─── Zack AI responses ────────────────────────────────────────────────────────
function generateResponse(input, context) {
  const q = input.toLowerCase();
  const { balance, income, expenses, savingsRate, totalInvested } = context;

  if (q.match(/saldo|quanto tenho|dinheiro/)) {
    return `Seu saldo atual é de **${fmt.brl(balance)}**. Este mês você recebeu ${fmt.brl(income)} e gastou ${fmt.brl(expenses)}, resultando em um saldo positivo de ${fmt.brl(income - expenses)}. 💪`;
  }
  if (q.match(/gastr|gasei|despesa|gast/)) {
    return `Em maio, suas despesas totalizaram **${fmt.brl(expenses)}**. As principais categorias foram:\n\n• 🏠 Moradia: R$ 2.500 (maior gasto)\n• 🍔 Alimentação: R$ 287\n• 💊 Saúde: R$ 189\n• 📱 Assinaturas: R$ 78\n\nSua taxa de poupança está em **${savingsRate}%** — excelente!`;
  }
  if (q.match(/poupan|econom|guardar|meta/)) {
    return `Sua taxa de poupança atual é de **${savingsRate}%**, o que é muito bom! 🎯\n\nAlgumas dicas para aumentar ainda mais:\n\n1. **Regra 50/30/20**: 50% necessidades, 30% desejos, 20% poupança\n2. Configure transferências automáticas no dia do salário\n3. Revise suas assinaturas — você tem R$ 77,80/mês em assinaturas\n\nVocê está no caminho certo!`;
  }
  if (q.match(/invest|carteira|ação|fundo|renda fixa|cdb|tesouro/)) {
    return `Sua carteira de investimentos vale **${fmt.brl(totalInvested)}** com retorno positivo! 📈\n\nComposição atual:\n• Renda Fixa: 61% (mais conservador e seguro)\n• ETF & Ações: 28% (exposição ao crescimento)\n• FII: 17% (renda passiva)\n• Cripto: 6% (alta volatilidade)\n\nEm renda fixa o Tesouro Selic e CDB Nubank estão performando bem. O PETR4 está com -4,88% — pode ser momento de revisar.`;
  }
  if (q.match(/conta|pagar|boleto|vencimento|pend/)) {
    return `Você tem **2 contas pendentes** este mês:\n\n• Seguro Saúde: R$ 450,00 — vence dia 25\n• Energia Elétrica: R$ 185,00 — vence dia 20\n\nTotal pendente: **R$ 635,00**\n\nE o PlayStation Plus está **vencido** — recomendo regularizar para evitar suspensão.`;
  }
  if (q.match(/receita|salário|renda|ganho/)) {
    return `Sua renda em maio foi de **${fmt.brl(income)}**:\n\n• 💼 Salário: R$ 8.500 (principal)\n• 💻 Freelance: R$ 1.800 (bônus)\n\nFreelance adicionou +21% à sua renda principal! Considere declarar como MEI para pagar menos impostos.`;
  }
  if (q.match(/relat|analise|análise|resumo/)) {
    return `📊 **Resumo Financeiro — Maio 2026**\n\n• **Saldo atual:** ${fmt.brl(balance)}\n• **Receitas:** ${fmt.brl(income)}\n• **Despesas:** ${fmt.brl(expenses)}\n• **Taxa de poupança:** ${savingsRate}%\n• **Patrimônio investido:** ${fmt.brl(totalInvested)}\n\nSua situação financeira está saudável. Continue assim!`;
  }
  if (q.match(/oi|olá|hello|boa|tudo bem/)) {
    return `Olá! 👋 Sou o Zack, seu assistente financeiro inteligente.\n\nPosso te ajudar com:\n• Análise de despesas e receitas\n• Situação dos seus investimentos\n• Contas a pagar e vencimentos\n• Dicas de economia e planejamento\n• Resumos e relatórios\n\nO que você gostaria de saber?`;
  }
  if (q.match(/dica|conselho|como|melhorar/)) {
    return `Aqui estão 3 dicas personalizadas para você hoje:\n\n1. **Reduzir alimentação fora** 🍔 — Você gastou com iFood e restaurantes. Cozinhar mais em casa pode economizar R$ 200-300/mês.\n\n2. **Investir mais** 📈 — Com ${savingsRate}% de poupança, considere aumentar aportes em Tesouro Direto ou CDB.\n\n3. **Quitar dívidas prioritárias** 💳 — Se usar o cartão de crédito, pague a fatura integral para evitar juros altos.\n\nQuer mais detalhes sobre algum desses pontos?`;
  }
  return `Entendi sua pergunta sobre "${input.slice(0, 50)}..."\n\nEstou aqui para ajudar com suas finanças! Posso analisar:\n\n• 💰 Seus gastos e receitas\n• 📊 Carteira de investimentos\n• 🗓️ Contas a pagar\n• 💡 Dicas de economia\n\nComo posso ajudar?`;
}

// ─── Zack Page ────────────────────────────────────────────────────────────────
function ZackPage() {
  const ctx = useApp();
  const { user } = ctx;
  const [messages, setMessages] = React.useState([
    {
      id: 1, role: 'assistant',
      text: `Olá, ${user.name}! 👋 Sou o **Zack**, seu assistente financeiro pessoal.\n\nAnalisei suas finanças e estou pronto para ajudar. O que você quer saber hoje?`,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = React.useState('');
  const [typing, setTyping] = React.useState(false);
  const bottomRef = React.useRef(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setMessages(ms => [...ms, { id: Date.now(), role: 'user', text: msg, time: now }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = generateResponse(msg, ctx);
      setTyping(false);
      setMessages(ms => [...ms, { id: Date.now() + 1, role: 'assistant', text: reply, time: now }]);
    }, 900 + Math.random() * 600);
    inputRef.current?.focus();
  };

  const quickActions = [
    'Qual meu saldo?',
    'Como estão meus investimentos?',
    'Tenho contas pendentes?',
    'Me dê dicas de economia',
  ];

  const renderText = text =>
    text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
      i % 2 === 1
        ? <strong key={i}>{part}</strong>
        : part.split('\n').map((line, j) => <React.Fragment key={j}>{j > 0 && <br/>}{line}</React.Fragment>)
    );

  return (
    <div className="page fadein" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--line)', background: 'var(--surface-2)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-blue-deep))', display: 'grid', placeItems: 'center', color: '#fff', position: 'relative' }}>
            <IcoBot size={22}/>
            <span style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: '50%', background: 'var(--brand-green-soft)', border: '2px solid var(--surface-2)' }}/>
          </div>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Zack AI</h2>
            <div style={{ fontSize: 12.5, color: 'var(--brand-green-soft)', fontWeight: 600 }}>● Online — pronto para ajudar</div>
          </div>
          <button className="btn btn-sm btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => setMessages([{
            id: Date.now(), role: 'assistant', text: `Conversa reiniciada! Olá novamente, ${user.name}. Como posso ajudar?`,
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          }])}>
            <IcoRefresh size={14}/>Limpar
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" style={{ flex: 1 }}>
        {messages.map(m => (
          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 4 }}>
            {m.role === 'assistant' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-blue-deep))', display: 'grid', placeItems: 'center' }}>
                  <IcoBot size={13} style={{ color: '#fff' }}/>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)' }}>Zack</span>
              </div>
            )}
            <div className={`chat-bubble ${m.role}`} style={{ lineHeight: 1.65 }}>
              {renderText(m.text)}
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{m.time}</span>
          </div>
        ))}

        {typing && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand-blue), var(--brand-blue-deep))', display: 'grid', placeItems: 'center' }}>
              <IcoBot size={13} style={{ color: '#fff' }}/>
            </div>
            <div className="chat-bubble assistant" style={{ display: 'flex', gap: 5, padding: '12px 16px' }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--text-3)', display: 'inline-block', animation: `pulseDot 1.2s ease ${i * 0.2}s infinite` }}/>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Quick actions */}
      {messages.length <= 2 && (
        <div style={{ padding: '0 20px 12px', display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
          {quickActions.map(a => (
            <button key={a} className="btn btn-sm" onClick={() => send(a)} style={{ fontSize: 12.5 }}>{a}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="chat-input-row" style={{ flexShrink: 0 }}>
        <input ref={inputRef} className="input" style={{ flex: 1 }}
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Pergunte sobre suas finanças..." disabled={typing}/>
        <button className="btn btn-primary" style={{ padding: '10px 14px', flexShrink: 0 }} onClick={() => send()} disabled={!input.trim() || typing}>
          <IcoSend size={16}/>
        </button>
      </div>

      <style>{`
        @keyframes pulseDot {
          0%, 60%, 100% { transform: translateY(0); opacity: .4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
