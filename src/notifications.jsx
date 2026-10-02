// ─── Notification Sound (Web Audio API, no external files) ───────────────────
function playZackSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [880, 1108, 1318]; // A5 C#6 E6 — pleasant rising chord
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  } catch (_) {}
}

// ─── Notification Manager ─────────────────────────────────────────────────────
const ZackNotif = {
  sw: null,

  async init() {
    if (!('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.register('./sw.js');
      this.sw = reg;
    } catch (e) {
      console.warn('[ZackNotif] SW register failed:', e);
    }
  },

  get billsEnabled()   { return localStorage.getItem('zf-notif-bills')    !== 'false'; },
  get weeklyEnabled()  { return localStorage.getItem('zf-notif-weekly')   !== 'false'; },
  get insightsEnabled(){ return localStorage.getItem('zf-notif-insights') !== 'false'; },
  get goalsEnabled()   { return localStorage.getItem('zf-notif-goals')    !== 'false'; },

  setBills(v)    { localStorage.setItem('zf-notif-bills',    v ? 'true' : 'false'); },
  setWeekly(v)   { localStorage.setItem('zf-notif-weekly',   v ? 'true' : 'false'); },
  setInsights(v) { localStorage.setItem('zf-notif-insights', v ? 'true' : 'false'); },
  setGoals(v)    { localStorage.setItem('zf-notif-goals',    v ? 'true' : 'false'); },

  async requestPermission() {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    const p = await Notification.requestPermission();
    return p;
  },

  get hasPermission() {
    return typeof Notification !== 'undefined' && Notification.permission === 'granted';
  },

  // Send through SW (works when tab is backgrounded)
  async _send(title, body, tag) {
    playZackSound();
    if (this.hasPermission) {
      if (navigator.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SHOW_NOTIFICATION', title, body, tag });
      } else {
        new Notification(title, { body, icon: './assets/zack-mascot.png', tag });
      }
    }
  },

  // ─── Bill due notifications ───────────────────────────────────────────────
  checkBills(bills) {
    if (!this.billsEnabled || !this.hasPermission) return;
    const today = new Date();
    const day   = today.getDate();
    const month = today.toISOString().slice(0, 7);

    bills.filter(b => b.status === 'pending').forEach(bill => {
      const daysUntil = bill.dueDay - day;
      let msg = null;
      let key = null;

      if (daysUntil === 3) {
        msg = `Faltam 3 dias • ${fmt.brl(bill.amount)}`;
        key = `${bill.id}-${month}-d3`;
      } else if (daysUntil === 2) {
        msg = `Faltam 2 dias • ${fmt.brl(bill.amount)}`;
        key = `${bill.id}-${month}-d2`;
      } else if (daysUntil === 0) {
        msg = `Vence hoje! • ${fmt.brl(bill.amount)}`;
        key = `${bill.id}-${month}-d0`;
      } else if (daysUntil === -1 && bill.status !== 'overdue') {
        msg = `Venceu ontem • ${fmt.brl(bill.amount)}`;
        key = `${bill.id}-${month}-dov`;
      }

      if (msg && key && !localStorage.getItem('zfn-' + key)) {
        localStorage.setItem('zfn-' + key, '1');
        this._send(`${bill.name}`, msg, 'bill-' + bill.id);
      }
    });
  },

  // ─── Goal alert ──────────────────────────────────────────────────────────
  checkGoals(income, expenses, goals) {
    if (!this.goalsEnabled || !this.hasPermission) return;
    const today = new Date().toISOString().slice(0, 10);
    goals.forEach(goal => {
      const savings = income - expenses;
      if (income > 0 && savings < goal.monthlyTarget) {
        const key = `goal-${goal.id}-${today}`;
        if (!localStorage.getItem('zfn-' + key)) {
          localStorage.setItem('zfn-' + key, '1');
          this._send('Meta em risco', `"${goal.name}" pode não ser atingida este mês`, 'goal-' + goal.id);
        }
      }
    });
  },

  // ─── Insights / high spending ─────────────────────────────────────────────
  checkSpending(income, expenses) {
    if (!this.insightsEnabled || !this.hasPermission) return;
    if (income <= 0) return;
    const today = new Date().toISOString().slice(0, 10);
    const key = `spend-${today}`;
    if (!localStorage.getItem('zfn-' + key) && expenses / income > 0.8) {
      localStorage.setItem('zfn-' + key, '1');
      this._send('Alerta de gastos', `Você já gastou ${Math.round(expenses/income*100)}% da sua renda este mês`, 'spend');
    }
  },
};

// ─── Hook: run notification checks whenever data changes ──────────────────────
function useNotifications() {
  const { bills, income, expenses, goals } = useApp();

  React.useEffect(() => {
    ZackNotif.init();
  }, []);

  React.useEffect(() => {
    if (!bills.length) return;
    // Slight delay so UI finishes rendering first
    const t = setTimeout(() => {
      ZackNotif.checkBills(bills);
      ZackNotif.checkGoals(income, expenses, goals);
      ZackNotif.checkSpending(income, expenses);
    }, 2000);
    return () => clearTimeout(t);
  }, [bills, income, expenses, goals]);
}
