function populateDiarioSelects() {
  const cafesAtivos = ls('cafes').filter(c => c.status === 'Ativo');
  const metodosAtivos = ls('metodos').filter(m => m.status === 'Ativo');
  const moedoresAtivos = ls('equipamentos').filter(e => e.status === 'Ativo' && (e.cat === 'Moedor manual' || e.cat === 'Moedor elétrico'));
  const receitas = ls('receitas');

  fillSelect('d-cafe', cafesAtivos, c => ({v: c.id, l: c.nome}));
  fillSelect('d-metodo', metodosAtivos, m => ({v: m.id, l: (m.tipo === 'Outro' ? m.nomeEspecifico : m.tipo) + (m.tamanho ? ' ' + m.tamanho : '')}));
  fillSelect('d-moedor', moedoresAtivos, e => ({v: e.id, l: e.marca + ' ' + e.modelo}));
  fillSelect('d-receita', receitas, r => ({v: r.id, l: r.nome}), '— nenhuma —');

  // defaults
  if (!$('d-data').value) $('d-data').value = today();
  if (!$('d-hora').value) $('d-hora').value = now();
}

function autoFillDiario() {
  const rId = val('d-receita');
  if (!rId) return;
  const r = ls('receitas').find(r => r.id === rId);
  if (!r) return;
  if (r.cafeId) $('d-cafe').value = r.cafeId;
  if (r.metodoId) $('d-metodo').value = r.metodoId;
  if (r.moedorId) $('d-moedor').value = r.moedorId;
  if (r.dose) $('d-dose').value = r.dose;
  if (r.temp) $('d-temp').value = r.temp;
  if (r.clique) $('d-clique').value = r.clique;
  calcDiarioRatio();
}

function calcDiarioRatio() {
  const dose = parseFloat(val('d-dose')), rend = parseFloat(val('d-rend'));
  if (dose > 0 && rend > 0) $('d-prop').value = '1:' + (rend / dose).toFixed(1);
  else $('d-prop').value = '';
  calcEY();
}

function calcEY() {
  const tds = parseFloat(val('d-tds')), rend = parseFloat(val('d-rend')), dose = parseFloat(val('d-dose'));
  if (tds > 0 && rend > 0 && dose > 0) {
    const ey = (tds * rend / dose);
    $('d-ey').value = ey.toFixed(2) + '%';
  } else {
    $('d-ey').value = '';
  }
}

function saveDiario() {
  const obj = {
    id: uid(),
    data: val('d-data') || today(),
    hora: val('d-hora') || now(),
    receitaId: val('d-receita'),
    cafeId: val('d-cafe'),
    metodoId: val('d-metodo'),
    moedorId: val('d-moedor'),
    dose: val('d-dose'), rend: val('d-rend'), prop: val('d-prop'),
    temp: val('d-temp'), clique: val('d-clique'), tempo: val('d-tempo'),
    tds: val('d-tds'), ey: val('d-ey'),
    score: val('d-score'), docura: val('d-docura'), acidez: val('d-acidez'),
    corpo: val('d-corpo'), amargor: $('d-amargor').checked,
    notas: val('d-notas'), obs: val('d-obs')
  };
  // resolve nomes
  obj.cafeNome = (ls('cafes').find(c => c.id === obj.cafeId) || {}).nome || obj.cafeId || '—';
  obj.metodoNome = (() => { const m = ls('metodos').find(m => m.id === obj.metodoId); return m ? (m.tipo === 'Outro' ? m.nomeEspecifico : m.tipo + (m.tamanho ? ' ' + m.tamanho : '')) : '—'; })();
  obj.moedorNome = (() => { const e = ls('equipamentos').find(e => e.id === obj.moedorId); return e ? e.marca + ' ' + e.modelo : '—'; })();
  obj.receitaNome = (ls('receitas').find(r => r.id === obj.receitaId) || {}).nome || '';

  const data = ls('diario'); data.push(obj); lsSet('diario', data);
  showToast('Extração registrada!');
  toggleForm('form-diario');
  resetDiarioForm();
  renderDiario();
}

function resetDiarioForm() {
  ['d-dose', 'd-rend', 'd-prop', 'd-temp', 'd-clique', 'd-tempo', 'd-tds', 'd-ey', 'd-notas', 'd-obs'].forEach(id => { if ($(id)) $(id).value = ''; });
  $('d-amargor').checked = false;
  $('d-score').value = ''; $('d-receita').value = '';
  $('d-data').value = today(); $('d-hora').value = now();
}

function scoreLabel(s) {
  const n = parseFloat(s);
  if (!n) return '';
  if (n >= 9) return 'Excepcional';
  if (n >= 8) return 'Excelente';
  if (n >= 7) return 'Muito bom';
  return 'Bom';
}

function renderDiario() {
  const list = $('diario-list');
  const all = ls('diario');
  const todayStr = today();
  const todayEntries = all.filter(e => e.data === todayStr);

  // stats
  const totalDose = todayEntries.reduce((a, e) => a + (parseFloat(e.dose) || 0), 0);
  const scores = todayEntries.map(e => parseFloat(e.score)).filter(Boolean);
  const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '—';
  $('st-ext').textContent = todayEntries.length;
  $('st-g').textContent = totalDose > 0 ? totalDose.toFixed(0) + 'g' : '0g';
  $('st-score').textContent = avgScore;

  if (!all.length) { list.innerHTML = '<div class="empty"><i class="ti ti-notebook"></i><p>Nenhuma extração registrada ainda.</p></div>'; return; }

  // group by date
  const byDate = {};
  all.forEach(e => { if (!byDate[e.data]) byDate[e.data] = []; byDate[e.data].push(e); });
  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  list.innerHTML = dates.map(date => {
    const label = date === todayStr ? 'Hoje' : new Date(date + 'T12:00').toLocaleDateString('pt-BR', {weekday: 'long', day: 'numeric', month: 'long'});
    return `<div class="sdiv">${label}</div>` + byDate[date].slice().reverse().map(e => {
      const sc = parseFloat(e.score) || 0;
      const filled = Math.round(sc);
      const dots = [...Array(10)].map((_, i) => `<div class="ld${i < filled ? ' on' : ''}"></div>`).join('');
      const sl = scoreLabel(e.score);
      return `<div class="log-entry">
        <div class="log-time">${e.hora || '—'}</div>
        <div class="log-body">
          <div class="log-title">${e.metodoNome || '—'} · ${e.cafeNome || '—'}</div>
          <div class="log-detail">${[e.dose ? e.dose + 'g' : '', e.rend ? e.rend + 'ml' : '', e.clique ? 'Clique ' + e.clique : '', e.tds ? 'TDS ' + e.tds + '%' : '', e.ey ? 'EY ' + e.ey : ''].filter(Boolean).join(' · ')}</div>
          ${e.score ? `<div class="log-score">${dots}<span class="score-val">${e.score}</span>${sl ? `<span class="score-lbl">${sl}</span>` : ''}</div>` : ''}
          ${e.notas ? `<div class="log-detail" style="margin-top:4px;font-style:italic">${e.notas}</div>` : ''}
        </div>
      </div>`;
    }).join('');
  }).join('');
}