import { auth, db } from './firebase.js';
import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

window.populateReceitaSelects = async function() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const [cafesSnap, metodosSnap, equipsSnap] = await Promise.all([
      getDocs(query(collection(db, "cafes"), where("userId", "==", user.uid), where("status", "==", "Ativo"))),
      getDocs(query(collection(db, "metodos"), where("userId", "==", user.uid), where("status", "==", "Ativo"))),
      getDocs(query(collection(db, "equipamentos"), where("userId", "==", user.uid), where("status", "==", "Ativo")))
    ]);

    const cafes = []; cafesSnap.forEach(d => cafes.push({id: d.id, ...d.data()}));
    const metodos = []; metodosSnap.forEach(d => metodos.push({id: d.id, ...d.data()}));
    const moedores = []; equipsSnap.forEach(d => {
      const e = d.data();
      if (e.cat === 'Moedor manual' || e.cat === 'Moedor elétrico') moedores.push({id: d.id, ...e});
    });

    fillSelect('r-cafe', cafes, c => ({v: c.id, l: c.nome}));
    fillSelect('r-metodo', metodos, m => ({v: m.id, l: (m.tipo === 'Outro' ? m.nomeEspecifico : m.tipo) + (m.tamanho ? ' ' + m.tamanho : '')}));
    fillSelect('r-moedor', moedores, e => ({v: e.id, l: e.marca + ' ' + e.modelo}));
  } catch (err) { console.error(err); }
};

function fillSelect(id, arr, fn, empty = '— selecionar —') {
  const sel = $(id); if (!sel) return;
  sel.innerHTML = `<option value="">${empty}</option>` + arr.map(i => { const {v, l} = fn(i); return `<option value="${v}">${l}</option>`; }).join('');
}

window.calcReceitaRatio = function() {
  const dose = parseFloat(val('r-dose')), agua = parseFloat(val('r-agua'));
  if (dose > 0 && agua > 0) $('r-prop').value = '1:' + (agua / dose).toFixed(1);
  else $('r-prop').value = '';
};

window.saveReceita = async function() {
  const user = auth.currentUser;
  const nome = val('r-nome');
  if (!user || !nome) { showToast('Informe o nome da receita'); return; }

  const tecs = [...document.querySelectorAll('.r-tec:checked')].map(c => c.value);
  const obj = {
    userId: user.uid, nome,
    cafeId: val('r-cafe'), metodoId: val('r-metodo'), moedorId: val('r-moedor'),
    filtro: val('r-filtro'), dose: val('r-dose'), agua: val('r-agua'), prop: val('r-prop'),
    yield: val('r-yield'), temp: val('r-temp'), aguaTipo: val('r-agua-tipo'),
    clique: val('r-clique'), tempo: val('r-tempo'), bloomT: val('r-bloom-t'), bloomMl: val('r-bloom-ml'),
    despejos: val('r-despejos'), descDesp: val('r-desc-desp'), tecnicas: tecs,
    nota: val('r-nota'), docura: val('r-docura'), acidez: val('r-acidez'), corpo: val('r-corpo'),
    amargor: $('r-amargor').checked, notas: val('r-notes'), obs: val('r-obs'),
    createdAt: Date.now()
  };

  try {
    await addDoc(collection(db, "receitas"), obj);
    showToast('Receita salva na nuvem!');
    toggleForm('form-receita');
    renderReceitas();
  } catch (e) { showToast('Erro ao salvar receita.'); }
};

window.renderReceitas = async function() {
  const user = auth.currentUser;
  const list = $('receitas-list');
  if (!user || !list) return;

  try {
    const [receitasSnap, cafesSnap, metodosSnap, equipsSnap] = await Promise.all([
      getDocs(query(collection(db, "receitas"), where("userId", "==", user.uid))),
      getDocs(query(collection(db, "cafes"), where("userId", "==", user.uid))),
      getDocs(query(collection(db, "metodos"), where("userId", "==", user.uid))),
      getDocs(query(collection(db, "equipamentos"), where("userId", "==", user.uid)))
    ]);

    const cafes = {}; cafesSnap.forEach(d => cafes[d.id] = d.data().nome);
    const metodos = {}; metodosSnap.forEach(d => metodos[d.id] = d.data().tipo === 'Outro' ? d.data().nomeEspecifico : d.data().tipo);
    const moedores = {}; equipsSnap.forEach(d => moedores[d.id] = d.data().marca + ' ' + d.data().modelo);

    const data = []; receitasSnap.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
    data.sort((a,b) => b.createdAt - a.createdAt);

    if (!data.length) { list.innerHTML = '<div class="empty"><i class="ti ti-clipboard-list"></i><p>Nenhuma receita cadastrada ainda.</p></div>'; return; }

    const metodosEmoji = {'V60': '▽', 'Melitta': '△', 'AeroPress': '⊚', 'Chemex': '⬡', 'Kalita Wave': '⌇', 'Espresso': '◉', 'Prensa Francesa': '⊡', 'Moka Pot': '⬟', 'Sifão': '⊕'};

    list.innerHTML = data.map(r => {
      const mNome = metodos[r.metodoId] || '—';
      const cNome = cafes[r.cafeId] || '—';
      const moNome = moedores[r.moedorId] || '—';
      const emoji = metodosEmoji[mNome] || '☕';

      return `<div class="recipe-card">
        <div class="rc-header">
          <div class="rc-icon">${emoji}</div>
          <div><div class="rc-title">${r.nome}</div><div class="rc-sub">${mNome} · ${cNome}</div></div>
          ${r.nota ? `<span class="badge b-info" style="margin-left:auto">${r.nota}</span>` : ''}
        </div>
        <div class="params-row">
          ${r.dose ? `<div class="param"><span>Dose</span><b>${r.dose}g</b></div>` : ''}
          ${r.agua ? `<div class="param"><span>Água</span><b>${r.agua}ml</b></div>` : ''}
          ${r.prop ? `<div class="param"><span>Proporção</span><b>${r.prop}</b></div>` : ''}
          ${r.temp ? `<div class="param"><span>Temp.</span><b>${r.temp}°C</b></div>` : ''}
          ${r.clique ? `<div class="param"><span>Clique</span><b>${r.clique}</b></div>` : ''}
        </div>
        <div style="font-size:11px;color:var(--ts)">${r.filtro || ''} · Moedor: ${moNome}</div>
      </div>`;
    }).join('');
  } catch (err) { console.error(err); }
};