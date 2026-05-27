import { auth, db } from './firebase.js';
import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

window.populateDiarioSelects = async function() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const [cafesSnap, metodosSnap, equipsSnap, receitasSnap] = await Promise.all([
      getDocs(query(collection(db, "cafes"), where("userId", "==", user.uid), where("status", "==", "Ativo"))),
      getDocs(query(collection(db, "metodos"), where("userId", "==", user.uid), where("status", "==", "Ativo"))),
      getDocs(query(collection(db, "equipamentos"), where("userId", "==", user.uid), where("status", "==", "Ativo"))),
      getDocs(query(collection(db, "receitas"), where("userId", "==", user.uid)))
    ]);

    const cafes = []; cafesSnap.forEach(d => cafes.push({id: d.id, ...d.data()}));
    const metodos = []; metodosSnap.forEach(d => metodos.push({id: d.id, ...d.data()}));
    const moedores = []; equipsSnap.forEach(d => { if(d.data().cat.includes('Moedor')) moedores.push({id: d.id, ...d.data()}); });
    const receitas = []; receitasSnap.forEach(d => receitas.push({id: d.id, ...d.data()}));

    fillSelect('d-cafe', cafes, c => ({v: c.id, l: c.nome}));
    fillSelect('d-metodo', metodos, m => ({v: m.id, l: (m.tipo === 'Outro' ? m.nomeEspecifico : m.tipo)}));
    fillSelect('d-moedor', moedores, e => ({v: e.id, l: e.marca + ' ' + e.modelo}));
    fillSelect('d-receita', receitas, r => ({v: r.id, l: r.nome}), '— nenhuma —');

    if (!$('d-data').value) $('d-data').value = today();
    if (!$('d-hora').value) $('d-hora').value = now();
  } catch (e) { console.error(e); }
};

function fillSelect(id, arr, fn, empty = '— selecionar —') {
  const sel = $(id); if (!sel) return;
  sel.innerHTML = `<option value="">${empty}</option>` + arr.map(i => { const {v, l} = fn(i); return `<option value="${v}">${l}</option>`; }).join('');
}

window.autoFillDiario = async function() {
  const rId = val('d-receita');
  if (!rId) return;
  try {
    const receitasSnap = await getDocs(query(collection(db, "receitas"), where("userId", "==", auth.currentUser.uid)));
    let r = null;
    receitasSnap.forEach(d => { if(d.id === rId) r = d.data(); });
    if (!r) return;

    if (r.cafeId) $('d-cafe').value = r.cafeId;
    if (r.metodoId) $('d-metodo').value = r.metodoId;
    if (r.moedorId) $('d-moedor').value = r.moedorId;
    if (r.dose) $('d-dose').value = r.dose;
    if (r.temp) $('d-temp').value = r.temp;
    if (r.clique) $('d-clique').value = r.clique;
    calcDiarioRatio();
  } catch(err) { console.error(err); }
};

window.calcDiarioRatio = function() {
  const dose = parseFloat(val('d-dose')), rend = parseFloat(val('d-rend'));
  if (dose > 0 && rend > 0) $('d-prop').value = '1:' + (rend / dose).toFixed(1);
  else $('d-prop').value = '';
  calcEY();
};

window.calcEY = function() {
  const tds = parseFloat(val('d-tds')), rend = parseFloat(val('d-rend')), dose = parseFloat(val('d-dose'));
  if (tds > 0 && rend > 0 && dose > 0) {
    $('d-ey').value = (tds * rend / dose).toFixed(2) + '%';
  } else {
    $('d-ey').value = '';
  }
};

window.saveDiario = async function() {
  const user = auth.currentUser;
  if (!user) return;

  const obj = {
    userId: user.uid,
    data: val('d-data') || today(), hora: val('d-hora') || now(),
    receitaId: val('d-receita'), cafeId: val('d-cafe'), metodoId: val('d-metodo'), moedorId: val('d-moedor'),
    dose: val('d-dose'), rend: val('d-rend'), prop: val('d-prop'),
    temp: val('d-temp'), clique: val('d-clique'), tempo: val('d-tempo'),
    tds: val('d-tds'), ey: val('d-ey'), score: val('d-score'),
    docura: val('d-docura'), acidez: val('d-acidez'), corpo: val('d-corpo'),
    amargor: $('d-amargor').checked, notas: val('d-notes'), obs: val('d-obs'),
    createdAt: Date.now()
  };

  try {
    await addDoc(collection(db, "diario"), obj);
    showToast('Extração registrada na nuvem!');
    toggleForm('form-diario');
    resetDiarioForm();
    renderDiario();
  } catch (e) { showToast('Erro ao salvar logs da extração.'); }
};

window.resetDiarioForm = function() {
  ['d-dose', 'd-rend', 'd-prop', 'd-temp', 'd-clique', 'd-tempo', 'd-tds', 'd-ey', 'd-notes', 'd-obs'].forEach(id => { if ($(id)) $(id).value = ''; });
  $('d-amargor').checked = false; $('d-score').value = ''; $('d-receita').value = '';
  $('d-data').value = today(); $('d-hora').value = now();
};

window.renderDiario = async function() {
  const user = auth.currentUser;
  const list = $('diario-list');
  if (!user || !list) return;

  try {
    const [diarioSnap, cafesSnap, metodosSnap] = await Promise.all([
      getDocs(query(collection(db, "diario"), where("userId", "==", user.uid))),
      getDocs(query(collection(db, "cafes"), where("userId", "==", user.uid))),
      getDocs(query(collection(db, "metodos"), where("userId", "==", user.uid)))
    ]);

    const cafes = {}; cafesSnap.forEach(d => cafes[d.id] = d.data().nome);
    const metodos = {}; metodosSnap.forEach(d => metodos[d.id] = d.data().tipo === 'Outro' ? d.data().nomeEspecifico : d.data().tipo);

    const all = []; diarioSnap.forEach(doc => all.push({ id: doc.id, ...doc.data() }));
    const todayStr = today();
    const todayEntries = all.filter(e => e.data === todayStr);

    const totalDose = todayEntries.reduce((a, e) => a + (parseFloat(e.dose) || 0), 0);
    const scores = todayEntries.map(e => parseFloat(e.score)).filter(Boolean);
    const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : '—';
    $('st-ext').textContent = todayEntries.length;
    $('st-g').textContent = totalDose > 0 ? totalDose.toFixed(0) + 'g' : '0g';
    $('st-score').textContent = avgScore;

    if (!all.length) { list.innerHTML = '<div class="empty"><i class="ti ti-notebook"></i><p>Nenhuma extração registrada ainda.</p></div>'; return; }

    const byDate = {}; all.forEach(e => { if (!byDate[e.data]) byDate[e.data] = []; byDate[e.data].push(e); });
    const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

    list.innerHTML = dates.map(date => {
      const label = date === todayStr ? 'Hoje' : new Date(date + 'T12:00').toLocaleDateString('pt-BR', {weekday: 'long', day: 'numeric', month: 'long'});
      return `<div class="sdiv">${label}</div>` + byDate[date].map(e => {
        const sc = parseFloat(e.score) || 0; const filled = Math.round(sc);
        const dots = [...Array(10)].map((_, i) => `<div class="ld${i < filled ? ' on' : ''}"></div>`).join('');
        return `<div class="log-entry">
          <div class="log-time">${e.hora || '—'}</div>
          <div class="log-body">
            <div class="log-title">${metodos[e.metodoId] || '—'} · ${cafes[e.cafeId] || '—'}</div>
            <div class="log-detail">${[e.dose ? e.dose+'g':'', e.rend ? e.rend+'ml':'', e.clique ? 'Clique '+e.clique:'', e.ey ? 'EY '+e.ey:''].filter(Boolean).join(' · ')}</div>
            ${e.score ? `<div class="log-score">${dots}<span class="score-val">${e.score}</span></div>` : ''}
          </div>
        </div>`;
      }).join('');
    }).join('');
  } catch (err) { console.error(err); }
};