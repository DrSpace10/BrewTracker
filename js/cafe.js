// js/cafes.js
import { auth, db } from './firebase.js';
import { collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Função para Salvar na Nuvem
window.saveCafe = async function() {
  const user = auth.currentUser;
  if (!user) { showToast('Você precisa estar logado!'); return; }

  const nome = document.getElementById('c-nome').value.trim();
  if (!nome) { showToast('Informe o nome do café'); return; }

  const prev = document.getElementById('c-foto-preview');
  const foto = (prev && prev._b64) ? prev._b64 : null;

  // Montamos o objeto, agora com a etiqueta 'userId'
  const obj = {
    userId: user.uid, // <-- O PULO DO GATO: Vincula este café a esta conta
    nome, 
    fazenda: document.getElementById('c-fazenda').value.trim(), 
    produtor: document.getElementById('c-produtor').value.trim(),
    pais: document.getElementById('c-pais').value.trim(), 
    regiao: document.getElementById('c-regiao').value.trim(), 
    altitude: document.getElementById('c-altitude').value.trim(),
    especie: document.getElementById('c-especie').value.trim(), 
    variedade: document.getElementById('c-variedade').value.trim(), 
    processo: document.getElementById('c-processo').value.trim(),
    decaf: document.getElementById('c-decaf').checked,
    torrefador: document.getElementById('c-torr').value.trim(), 
    torra: document.getElementById('c-torra').value.trim(), 
    dtorra: document.getElementById('c-dtorra').value.trim(),
    descanso: document.getElementById('c-descanso').value.trim(), 
    notasTorr: document.getElementById('c-notas-torr').value.trim(),
    sca: document.getElementById('c-sca').value.trim(), 
    premios: document.getElementById('c-premios').value.trim(), 
    preco: document.getElementById('c-preco').value.trim(),
    peso: document.getElementById('c-peso').value.trim(), 
    lote: document.getElementById('c-lote').value.trim(),
    abertura: document.getElementById('c-abertura').value.trim(), 
    status: document.getElementById('c-status').value.trim(), 
    obs: document.getElementById('c-obs').value.trim(), 
    foto,
    createdAt: Date.now() // Ajuda a ordenar depois
  };

  try {
    // addDoc substitui o localStorage.setItem
    await addDoc(collection(db, "cafes"), obj);
    showToast('Café salvo na nuvem!');
    toggleForm('form-cafe');
    resetCafeForm();
    renderCafes(); // Atualiza a lista
  } catch (error) {
    console.error("Erro ao salvar café: ", error);
    showToast('Erro ao salvar no banco de dados.');
  }
};

// Função para Puxar da Nuvem
window.renderCafes = async function() {
  const user = auth.currentUser;
  const list = document.getElementById('cafes-list');
  
  if (!user) {
    list.innerHTML = '<div class="empty"><p>Faça login para ver seus cafés.</p></div>';
    return;
  }

  try {
    // Cria uma "pergunta" pro banco: Me dê os cafés onde o userId seja igual ao meu
    const q = query(collection(db, "cafes"), where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);
    
    const data = [];
    querySnapshot.forEach((doc) => {
      // doc.data() é o objeto, doc.id é a chave única gerada pelo Firebase
      data.push({ id: doc.id, ...doc.data() });
    });

    // Ordena do mais recente para o mais antigo (opcional, usando o createdAt)
    data.sort((a, b) => b.createdAt - a.createdAt);

    if (!data.length) { 
      list.innerHTML = '<div class="empty"><i class="ti ti-plant-2"></i><p>Nenhum café cadastrado ainda.</p></div>'; 
      return; 
    }

    // O restante do HTML continua EXATAMENTE igual ao seu código anterior!
    list.innerHTML = data.map(c => {
      const proc = c.processo || '';
      const badgeClass = proc.startsWith('Natural') ? 'b-nat' : proc.startsWith('Lavado') || proc.startsWith('Washed') ? 'b-was' : 'b-hon';
      const statusClass = c.status === 'Ativo' ? 'b-ativo' : 'b-esgotado';
      return `<div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">${c.nome}${c.decaf ? ' <span style="font-size:10px;opacity:.7">(Decaf)</span>' : ''}</div>
            <div class="card-sub">${[c.regiao, c.pais, c.altitude ? c.altitude + 'm' : ''].filter(Boolean).join(' · ')}</div>
          </div>
          <div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap">
            <span class="badge ${badgeClass}">${proc}</span>
            <span class="badge ${statusClass}">${c.status}</span>
          </div>
        </div>
        ${c.foto ? `<img src="${c.foto}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;float:right;margin-left:10px;border:.5px solid var(--bds)">` : '' }
        <div class="meta">
          <div class="mi"><span>Espécie</span>${c.especie}${c.variedade ? ' – ' + c.variedade : ''}</div>
          <div class="mi"><span>Torra</span>${c.torra || '—'}${c.torrefador ? ' · ' + c.torrefador : ''}</div>
          <div class="mi"><span>Data torra</span>${c.dtorra || '—'}</div>
          <div class="mi"><span>Score SCA</span>${c.sca || '—'}</div>
          ${c.fazenda ? `<div class="mi"><span>Fazenda</span>${c.fazenda}</div>` : ''}
          ${c.altitude ? `<div class="mi"><span>Altitude</span>${c.altitude}m</div>` : ''}
        </div>
        ${c.notasTorr ? `<div class="tags">${c.notasTorr.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('')}</div>` : ''}
      </div>`;
    }).join('');

  } catch (error) {
    console.error("Erro ao buscar cafés: ", error);
  }
};

// Precisamos exportar a preview de imagem para o HTML encontrar
window.previewCafeFoto = function(input) {
  // (Cole aqui o mesmo conteúdo da sua função previewCafeFoto antiga)
  // ...
};

window.resetCafeForm = function() {
  // (Cole aqui o mesmo conteúdo da sua função resetCafeForm antiga)
  // ...
};