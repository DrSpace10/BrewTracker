function toggleMetodoOutro() {
  const tipo = val('m-tipo');
  $('m-outro-wrap').classList.toggle('hidden', tipo !== 'Outro');
}

function saveMetodo() {
  const tipo = val('m-tipo');
  const nomeEspecifico = tipo === 'Outro' ? val('m-outro') : '';
  if (tipo === 'Outro' && !nomeEspecifico) { showToast('Informe o nome específico'); return; }
  const obj = {
    id: uid(), tipo, nomeEspecifico, marca: val('m-marca'),
    tamanho: val('m-tamanho'), material: val('m-material'),
    principio: val('m-principio'), formato: val('m-formato'),
    status: val('m-status'), obs: val('m-obs')
  };
  const data = ls('metodos'); data.push(obj); lsSet('metodos', data);
  showToast('Método salvo!');
  toggleForm('form-metodo');
  renderMetodos();
}

function renderMetodos() {
  const list = $('metodos-list');
  const data = ls('metodos');
  if (!data.length) { list.innerHTML = '<div class="empty"><i class="ti ti-filter"></i><p>Nenhum método cadastrado ainda.</p></div>'; return; }
  const cats = [...new Set(data.map(m => m.principio))];
  list.innerHTML = cats.map(cat => {
    const items = data.filter(m => m.principio === cat);
    return `<div class="sdiv">${cat}</div>` + items.slice().reverse().map(m => {
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
}