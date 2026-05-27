function populateReceitaSelects() {
  const cafesAtivos = ls('cafes').filter(c => c.status === 'Ativo');
  const metodosAtivos = ls('metodos').filter(m => m.status === 'Ativo');
  const moedoresAtivos = ls('equipamentos').filter(e => e.status === 'Ativo' && (e.cat === 'Moedor manual' || e.cat === 'Moedor elétrico'));

  fillSelect('r-cafe', cafesAtivos, c => ({v: c.id, l: c.nome}));
  fillSelect('r-metodo', metodosAtivos, m => ({v: m.id, l: (m.tipo === 'Outro' ? m.nomeEspecifico : m.tipo) + (m.tamanho ? ' ' + m.tamanho : '')}));
  fillSelect('r-moedor', moedoresAtivos, e => ({v: e.id, l: e.marca + ' ' + e.modelo}));
}

function fillSelect(id, arr, fn, empty = '— selecionar —') {
  const sel = $(id); if (!sel) return;
  sel.innerHTML = `<option value="">${empty}</option>` + arr.map(i => { const {v, l} = fn(i); return `<option value="${v}">${l}</option>`; }).join('');
}

function calcReceitaRatio() {
  const dose = parseFloat(val('r-dose')), agua = parseFloat(val('r-agua'));
  if (dose > 0 && agua > 0) $('r-prop').value = '1:' + (agua / dose).toFixed(1);
  else $('r-prop').value = '';
}

function saveReceita() {
  const nome = val('r-nome');
  if (!nome) { showToast('Informe o nome da receita'); return; }
  const tecs = [...document.querySelectorAll('.r-tec:checked')].map(c => c.value);
  const obj = {
    id: uid(), nome,
    cafeId: val('r-cafe'), metodoId: val('r-metodo'), moedorId: val('r-moedor'),
    filtro: val('r-filtro'),
    dose: val('r-dose'), agua: val('r-agua'), prop: val('r-prop'),
    yield: val('r-yield'), temp: val('r-temp'), aguaTipo: val('r-agua-tipo'),
    clique: val('r-clique'), tempo: val('r-tempo'),
    bloomT: val('r-bloom-t'), bloomMl: val('r-bloom-ml'),
    despejos: val('r-despejos'), descDesp: val('r-desc-desp'), tecnicas: tecs,
    nota: val('r-nota'), docura: val('r-docura'), acidez: val('r-acidez'),
    corpo: val('r-corpo'), amargor: $('r-amargor').checked,
    notas: val('r-notas'), obs: val('r-obs')
  };
  // resolve nomes para display
  obj.cafeNome = (ls('cafes').find(c => c.id === obj.cafeId) || {}).nome || obj.cafeId || '';
  obj.metodoNome = (() => { const m = ls('metodos').find(m => m.id === obj.metodoId); return m ? (m.tipo === 'Outro' ? m.nomeEspecifico : m.tipo + (m.tamanho ? ' ' + m.tamanho : '')) : '—'; })();
  obj.moedorNome = (() => { const e = ls('equipamentos').find(e => e.id === obj.moedorId); return e ? e.marca + ' ' + e.modelo : '—'; })();

  const data = ls('receitas'); data.push(obj); lsSet('receitas', data);
  showToast('Receita salva!');
  toggleForm('form-receita');
  renderReceitas();
}

const metodosEmoji = {'V60': '▽', 'Melitta': '△', 'AeroPress': '⊚', 'Chemex': '⬡', 'Kalita Wave': '⌇', 'Espresso': '◉', 'Prensa Francesa': '⊡', 'Moka Pot': '⬟', 'Sifão': '⊕'};

function renderReceitas() {
  const list = $('receitas-list');
  const data = ls('receitas');
  if (!data.length) { list.innerHTML = '<div class="empty"><i class="ti ti-clipboard-list"></i><p>Nenhuma receita cadastrada ainda.</p></div>'; return; }
  list.innerHTML = data.slice().reverse().map(r => {
    const emoji = metodosEmoji[r.metodoNome] || '☕';
    return `<div class="recipe-card">
      <div class="rc-header">
        <div class="rc-icon">${emoji}</div>
        <div><div class="rc-title">${r.nome}</div><div class="rc-sub">${r.metodoNome || '—'} · ${r.cafeNome || '—'}</div></div>
        ${r.nota ? `<span class="badge b-info" style="margin-left:auto">${r.nota}</span>` : ''}
      </div>
      <div class="params-row">
        ${r.dose ? `<div class="param"><span>Dose</span><b>${r.dose}g</b></div>` : ''}
        ${r.agua ? `<div class="param"><span>Água</span><b>${r.agua}ml</b></div>` : ''}
        ${r.prop ? `<div class="param"><span>Proporção</span><b>${r.prop}</b></div>` : ''}
        ${r.temp ? `<div class="param"><span>Temp.</span><b>${r.temp}°C</b></div>` : ''}
        ${r.clique ? `<div class="param"><span>Clique</span><b>${r.clique}</b></div>` : ''}
        ${r.tempo ? `<div class="param"><span>Tempo</span><b>${r.tempo}</b></div>` : ''}
        ${r.bloomT ? `<div class="param"><span>Bloom</span><b>${r.bloomMl || '?'}ml/${r.bloomT}s</b></div>` : ''}
      </div>
      <div style="font-size:11px;color:var(--ts)">${r.filtro || ''}${r.moedorNome && r.moedorNome !== '—' ? ' · ' + r.moedorNome : ''}${r.tecnicas && r.tecnicas.length ? ' · ' + r.tecnicas.join(', ') : ''}</div>
      ${r.notas ? `<div class="tags">${r.notas.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('')}</div>` : ''}
    </div>`;
  }).join('');
}