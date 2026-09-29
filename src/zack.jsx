// ─── Zack global config ───────────────────────────────────────────────────────
// Set claudeKey to enable real AI responses via the Claude (Anthropic) API.
// When empty, the keyword-matching fallback is used automatically.
const ZACK_CONFIG = {
  get claudeKey() { try { return localStorage.getItem('zack_claude_key') || ''; } catch { return ''; } },
  model: 'claude-sonnet-4-6',
};

// ─── Build OpenAI system prompt from user financial data ─────────────────────
function buildSystemPrompt(ctx) {
  const { balance, income, expenses, savingsRate, totalInvested, totalReturn, transactions, investments, bills } = ctx;

  const recentTxns = (transactions || []).slice(0, 10).map(t =>
    `- ${t.date}: ${t.description} (${t.amount > 0 ? '+' : ''}${t.amount.toFixed(2)} BRL, categoria: ${t.category})`
  ).join('\n');

  const invList = (investments || []).map(i =>
    `- ${i.name} (${i.type}): investido R$ ${i.invested.toFixed(2)}, atual R$ ${i.current.toFixed(2)}, retorno ${i.returnPct.toFixed(2)}%`
  ).join('\n');

  const billList = (bills || []).filter(b => b.status !== 'paid').map(b =>
    `- ${b.name}: R$ ${b.amount.toFixed(2)} — vence dia ${b.dueDay} — status: ${b.status}`
  ).join('\n');

  return `Você é o Zack, assistente financeiro pessoal inteligente do app Zack Finance. Responda sempre em português do Brasil, de forma clara, amigável e personalizada com os dados reais do usuário.

## Dados financeiros atuais do usuário (maio 2026):
- Saldo atual: R$ ${balance.toFixed(2)}
- Receitas do mês: R$ ${income.toFixed(2)}
- Despesas do mês: R$ ${expenses.toFixed(2)}
- Taxa de poupança: ${savingsRate}%
- Patrimônio investido total: R$ ${totalInvested.toFixed(2)}
- Retorno total dos investimentos: R$ ${totalReturn.toFixed(2)}

## Transações recentes:
${recentTxns || 'Nenhuma transação disponível'}

## Carteira de investimentos:
${invList || 'Nenhum investimento disponível'}

## Contas pendentes/vencidas:
${billList || 'Nenhuma conta pendente'}

## Instruções:
- Use os dados acima para personalizar TODAS as respostas.
- Seja conciso mas completo. Use markdown simples (negrito com **texto**).
- Nunca invente dados — use apenas os fornecidos acima.
- Ofereça análises práticas e acionáveis.
- Quando perguntado sobre gastos, cite as categorias reais do usuário.
- Encoraje hábitos financeiros saudáveis.`;
}

// ─── Claude API call ──────────────────────────────────────────────────────────
async function callClaude(userMessage, ctx) {
  const key = ZACK_CONFIG.claudeKey.trim();
  if (!key) return null; // will use fallback

  const systemPrompt = buildSystemPrompt(ctx);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: ZACK_CONFIG.model || 'claude-sonnet-4-6',
        max_tokens: 600,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userMessage },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn('[Zack AI] Claude error:', res.status, err?.error?.message);
      return null; // fall back to local
    }

    const data = await res.json();
    return data?.content?.[0]?.text || null;
  } catch (e) {
    console.warn('[Zack AI] fetch error:', e.message);
    return null;
  }
}

// ─── Keyword-matching fallback responses ──────────────────────────────────────
function generateFallbackResponse(input, context) {
  const q = input.toLowerCase();
  const { balance, income, expenses, savingsRate, totalInvested, totalReturn, transactions, investments, bills } = context;

  const pendingBills = (bills || []).filter(b => b.status !== 'paid');
  const overdueBills = (bills || []).filter(b => b.status === 'overdue');
  const totalPending = pendingBills.reduce((s, b) => s + (b.amount || 0), 0);

  if (q.match(/saldo|quanto tenho|dinheiro/)) {
    if (balance === 0 && income === 0) return `Ainda não tem nenhuma transação registrada. Adiciona suas receitas e despesas na aba Transações!`;
    return `Seu saldo atual é **${fmt.brl(balance)}**. Esse mês entrou ${fmt.brl(income)} e saiu ${fmt.brl(expenses)}.`;
  }
  if (q.match(/despesa|gast/)) {
    const cats = {};
    (transactions || []).filter(t => t.amount < 0).forEach(t => { cats[t.category] = (cats[t.category] || 0) + Math.abs(t.amount); });
    const top = Object.entries(cats).sort((a,b) => b[1]-a[1]).slice(0,4).map(([c,v]) => `• ${CATEGORIES[c]?.label || c}: ${fmt.brl(v)}`).join('\n');
    if (!top) return `Ainda não tem despesas registradas esse mês.`;
    return `Esse mês você gastou **${fmt.brl(expenses)}** no total:\n\n${top}\n\nTaxa de poupança: **${savingsRate}%**`;
  }
  if (q.match(/poupan|econom|guardar/)) {
    if (income === 0) return `Adiciona sua receita do mês pra eu calcular sua taxa de poupança!`;
    return `Você está poupando **${savingsRate}%** da sua renda esse mês. ${savingsRate >= 20 ? 'Ótimo!' : savingsRate >= 10 ? 'Razoável, mas dá pra melhorar!' : 'Tenta chegar em pelo menos 10%.'}`;
  }
  if (q.match(/invest|carteira|ação|fundo|renda fixa|cdb|tesouro/)) {
    if (!investments || investments.length === 0) return `Você ainda não tem investimentos cadastrados. Adiciona na aba Investimentos!`;
    const list = investments.map(i => `• ${i.name}: ${fmt.brl(i.current)} (${i.returnPct >= 0 ? '+' : ''}${i.returnPct.toFixed(1)}%)`).join('\n');
    return `Sua carteira está em **${fmt.brl(totalInvested)}** com retorno de ${totalReturn >= 0 ? '+' : ''}**${fmt.brl(totalReturn)}**:\n\n${list}`;
  }
  if (q.match(/conta|pagar|boleto|vencimento|pend/)) {
    if (pendingBills.length === 0) return `Nenhuma conta pendente. Tudo em dia! ✅`;
    const list = pendingBills.map(b => `• ${b.name}: ${fmt.brl(b.amount)} — dia ${b.dueDay}${b.status === 'overdue' ? ' (**atrasada**)' : ''}`).join('\n');
    return `Você tem ${pendingBills.length} conta${pendingBills.length > 1 ? 's' : ''} pendente${pendingBills.length > 1 ? 's' : ''}:\n\n${list}\n\nTotal: **${fmt.brl(totalPending)}**`;
  }
  if (q.match(/receita|salário|renda|ganho/)) {
    if (income === 0) return `Ainda não registrou receita esse mês.`;
    return `Sua receita esse mês foi de **${fmt.brl(income)}**.`;
  }
  if (q.match(/relat|analise|análise|resumo/)) {
    return `Aqui está seu resumo:\n\n• Saldo: **${fmt.brl(balance)}**\n• Receitas: **${fmt.brl(income)}**\n• Despesas: **${fmt.brl(expenses)}**\n• Poupança: **${savingsRate}%**\n• Investido: **${fmt.brl(totalInvested)}**\n• Contas pendentes: **${pendingBills.length}**`;
  }
  if (q.match(/^(oi|olá|ola|hey|e aí|eai|eaí|salve|bom dia|boa tarde|boa noite|hello)[\s!?]*$/)) {
    return `Oi! Tudo certo por aqui. O que você quer saber sobre suas finanças?`;
  }
  if (q.match(/tudo (bem|bom|certo|ok)|como (vai|tá|ta|estás)/)) {
    return `Tudo ótimo! E com você? Me fala o que posso te ajudar hoje.`;
  }
  if (q.match(/^(vlw|valeu|obrigad|obg|thanks|tmj|boa|show|ok|okay|certo|entendi|perfeito|massa|top|legal)[\s!?]*$/)) {
    return `De nada! Se precisar de mais alguma coisa é só chamar. 😊`;
  }
  if (q.match(/dica|conselho|melhorar/)) {
    const tips = [];
    if (savingsRate < 10) tips.push('Tenta guardar pelo menos 10% da sua renda todo mês.');
    if (overdueBills.length > 0) tips.push(`Você tem ${overdueBills.length} conta(s) vencida(s) — vale regularizar logo pra evitar juros.`);
    if (!investments || investments.length === 0) tips.push('Ainda não tem investimentos cadastrados. Mesmo R$ 50/mês no Tesouro Selic já é um bom começo.');
    if (tips.length === 0) tips.push('Sua situação tá boa! Continue controlando os gastos e aportando todo mês.');
    return tips.join('\n\n');
  }
  return `Não entendi muito bem. Pode me perguntar sobre seu saldo, despesas, contas a pagar ou investimentos que eu respondo certinho.`;
}

// ─── Main response dispatcher ─────────────────────────────────────────────────
async function generateResponse(input, context) {
  // Try Claude first; fall back to keyword matching if key not set or API fails
  const aiReply = await callClaude(input, context);
  if (aiReply) return aiReply;
  return generateFallbackResponse(input, context);
}

// ─── API Key Config Modal ─────────────────────────────────────────────────────
function ZackConfigModal({ onClose }) {
  const [key, setKey] = React.useState(ZACK_CONFIG.claudeKey);
  const [model, setModel] = React.useState(ZACK_CONFIG.model);
  const [show, setShow] = React.useState(false);

  const save = () => {
    ZACK_CONFIG.claudeKey = key.trim();
    ZACK_CONFIG.model = model.trim() || 'claude-sonnet-4-6';
    onClose(true);
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose(false)}>
      <div className="modal" style={{ maxWidth: 460 }}>
        <div className="modal-head">
          <div>
            <h3>Configurar Zack AI</h3>
            <p>Conecte sua chave da API Claude (Anthropic) para respostas com IA real.</p>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => onClose(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label>Chave da API Claude</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={show ? 'text' : 'password'}
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="sk-ant-..."
                style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShow(s => !s)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}>
                {show ? <IcoEyeOff size={16}/> : <IcoEye size={16}/>}
              </button>
            </div>
            <span style={{ fontSize: 11.5, color: 'var(--text-3)' }}>
              A chave é armazenada apenas na memória desta sessão (não persiste após recarregar).
            </span>
          </div>
          <div className="field">
            <label>Modelo</label>
            <select className="select" value={model} onChange={e => setModel(e.target.value)}>
              <option value="claude-sonnet-4-6">Claude Sonnet 4.6 (equilibrado)</option>
              <option value="claude-opus-4-8">Claude Opus 4.8 (mais inteligente)</option>
              <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 (rápido e econômico)</option>
            </select>
          </div>
          {!key && (
            <div style={{ padding: '10px 12px', background: 'var(--bg-2)', borderRadius: 10, border: '1px solid var(--line)', fontSize: 12.5, color: 'var(--text-2)' }}>
              Sem chave configurada, o Zack usa respostas automáticas baseadas nos seus dados financeiros — funciona offline, sem custo.
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={() => onClose(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>Salvar configuração</button>
        </div>
      </div>
    </div>
  );
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
  const [showConfig, setShowConfig] = React.useState(false);
  const [aiEnabled, setAiEnabled] = React.useState(Boolean(ZACK_CONFIG.claudeKey));
  const bottomRef = React.useRef(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg || typing) return;
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setMessages(ms => [...ms, { id: Date.now(), role: 'user', text: msg, time: now }]);
    setInput('');
    setTyping(true);

    generateResponse(msg, ctx).then(reply => {
      setTyping(false);
      setMessages(ms => [...ms, { id: Date.now() + 1, role: 'assistant', text: reply || 'Desculpe, não consegui processar sua pergunta. Tente novamente.', time: now }]);
    }).catch(() => {
      const fallback = generateFallbackResponse(msg, ctx);
      setTyping(false);
      setMessages(ms => [...ms, { id: Date.now() + 1, role: 'assistant', text: fallback, time: now }]);
    });

    inputRef.current?.focus();
  };

  const handleConfigClose = (saved) => {
    setShowConfig(false);
    if (saved) {
      setAiEnabled(Boolean(ZACK_CONFIG.claudeKey));
    }
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
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--line)', background: 'var(--surface-2)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Zack avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <ZackAvatar size={44} style={{ borderRadius: '50%' }}/>
            <span style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: '50%', background: 'var(--brand-green-soft)', border: '2px solid var(--surface-2)' }}/>
          </div>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Zack AI</h2>
            <div style={{ fontSize: 12.5, color: aiEnabled ? 'var(--brand-green-soft)' : 'var(--text-3)', fontWeight: 600 }}>
              {aiEnabled ? '● Online — Claude conectado' : '● Online — modo offline'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
            <button className="btn btn-sm btn-ghost" onClick={() => setMessages([{
              id: Date.now(), role: 'assistant', text: `Conversa reiniciada! Olá novamente, ${user.name}. Como posso ajudar?`,
              time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            }])}>
              <IcoRefresh size={14}/>Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" style={{ flex: 1 }}>
        {messages.map(m => (
          <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 4 }}>
            {m.role === 'assistant' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <ZackAvatar size={22} style={{ borderRadius: '50%' }}/>
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
            <ZackAvatar size={22} style={{ borderRadius: '50%', marginTop: 4 }}/>
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

      {/* Config modal */}
      {showConfig && <ZackConfigModal onClose={handleConfigClose}/>}

      <style>{`
        @keyframes pulseDot {
          0%, 60%, 100% { transform: translateY(0); opacity: .4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
