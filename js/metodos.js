import { auth, db } from './firebase.js';
import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

window.toggleMetodoOutro = function() {
  const tipo = val('m-tipo');
  $('m-outro-wrap').classList.toggle('hidden', tipo !== 'Outro');
};

window.saveMetodo = async function() {
  const user = auth.currentUser;
  if (!user) return;

  const tipo = val('m-tipo');
  const nomeEspecifico = tipo === 'Outro' ? val('m-outro') : '';
  if (tipo === 'Outro' && !nomeEspecifico) { showToast('Informe o nome específico'); return; }

  const obj = {
    userId: user.uid,
    tipo, nomeEspecifico, marca: val('m-marca'),
    tamanho: val('m-tamanho'), material: val('m-material'),
    principio: val('m-principio'), formato: val('m-formato'),
    status: val('m-status'), obs: val('m-obs'),
    createdAt: Date.now()
  };

  try {
    await addDoc(collection(db, "metodos"), obj);
    showToast('Método salvo na nuvem!');
    toggleForm('form-metodo');
    renderMetodos();
  } catch (e) {
    showToast('Erro ao salvar método.');
  }
};

window.renderMetodos = async function() {
  const user = auth.currentUser;
  const list = $('metodos-list');
  if (!user || !list) return;

  try {
    const q = query(collection(db, "metodos"), where("userId", "==", user.uid));
    const snap = await getDocs(q);
    const data = [];
    snap.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
    data.sort((a,b) => b.createdAt - a.createdAt);

    if (!data.length) { list.innerHTML = '<div class="empty"><i class="ti ti-filter"></i><p>Nenhum método cadastrado ainda.</p></div>'; return; }

    const cats = [...new Set(data.map(m => m.principio))];
    list.innerHTML = cats.map(cat => {
      const items = data.filter(m => m.principio === cat);
      return `<div class="sdiv">${cat}</div>` + items.map(m => {
        const sc = m.status === 'Ativo' ? 'b-ativo' : m.status === 'Inativo' ? 'b-inativo' : 'b-esgotado';
        const nome = m.tipo === 'Outro' ? (m.nomeEspecifico || m.tipo) : m.tipo;
        return `<div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">${nome}${m.marca ? ' – ' + m.marca : ''}</div>
              <div class="card-sub">${[m.tamanho, m.material].filter(Boolean).join(' · ')}</div>
            </div>
            <span class="badge ${sc}">${m.status}</span>
          </div>
          <div class="meta">
            <div class="mi"><span>Princípio</span>${m.principio || '—'}</div>
            <div class="mi"><span>Base</span>${m.formato || '—'}</div>
          </div>
        </div>`;
      }).join('');
    }).join('');
  } catch (err) { console.error(err); }
};