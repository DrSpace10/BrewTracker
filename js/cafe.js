function previewCafeFoto(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const max = 300;
      let w = img.width, h = img.height;
      if (w > h) { if (w > max) { h = Math.round(h * max / w); w = max; } }
      else { if (h > max) { w = Math.round(w * max / h); h = max; } }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const b64 = canvas.toDataURL('image/jpeg', 0.8);
      const prev = $('c-foto-preview');
      prev.src = b64; prev.style.display = 'block';
      prev._b64 = b64;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function saveCafe() {
  const nome = val('c-nome');
  if (!nome) { showToast('Informe o nome do café'); return; }
  const foto = ($('c-foto-preview') && $('c-foto-preview')._b64) ? $('c-foto-preview')._b64 : null;
  const obj = {
    id: uid(), nome, fazenda: val('c-fazenda'), produtor: val('c-produtor'),
    pais: val('c-pais'), regiao: val('c-regiao'), altitude: val('c-altitude'),
    especie: val('c-especie'), variedade: val('c-variedade'), processo: val('c-processo'),
    decaf: $('c-decaf').checked,
    torrefador: val('c-torr'), torra: val('c-torra'), dtorra: val('c-dtorra'),
    descanso: val('c-descanso'), notasTorr: val('c-notas-torr'),
    sca: val('c-sca'), premios: val('c-premios'), preco: val('c-preco'),
    peso: val('c-peso'), lote: val('c-lote'),
    abertura: val('c-abertura'), status: val('c-status'), obs: val('c-obs'), foto
  };
  const data = ls('cafes'); data.push(obj); lsSet('cafes', data);
  showToast('Café salvo!');
  toggleForm('form-cafe');
  resetCafeForm();
  renderCafes();
}

function resetCafeForm() {
  ['c-nome','c-fazenda','c-produtor','c-pais','c-regiao','c-altitude',
   'c-variedade','c-torr','c-dtorra','c-descanso','c-notas-torr',
   'c-sca','c-premios','c-preco','c-peso','c-lote','c-abertura','c-obs'].forEach(id => {
    if ($(id)) $(id).value = '';
  });
  $('c-decaf').checked = false;
  $('c-foto-preview').style.display = 'none'; $('c-foto-preview').src = ''; delete $('c-foto-preview')._b64;
  $('c-foto').value = '';
}

function renderCafes() {
  const list = $('cafes-list');
  const data = ls('cafes');
  if (!data.length) { list.innerHTML = '<div class="empty"><i class="ti ti-plant-2"></i><p>Nenhum café cadastrado ainda.</p></div>'; return; }
  list.innerHTML = data.slice().reverse().map(c => {
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
}