function renderEquipFields() {
  const cat = val('e-cat');
  const specs = $('e-specs');
  let html = '';
  if (cat === 'Moedor manual' || cat === 'Moedor elétrico') {
    html = `
      <div class="fg"><label>Tipo de mó</label>
        <select id="e-mo-tipo"><option>Cônico (aço)</option><option>Cônico (cerâmica)</option><option>Plano (aço)</option><option>Plano (cerâmica)</option></select>
      </div>
      <div class="fg"><label>Tamanho da mó [mm]</label><input type="number" id="e-mo-mm" placeholder="38"></div>
      <div class="fg"><label>Tipo de ajuste</label>
        <select id="e-mo-ajuste"><option>Stepless (contínuo)</option><option>Stepped (cliques)</option><option>Numérico</option></select>
      </div>`;
  } else if (cat === 'Máquina de espresso') {
    html = `
      <div class="fg"><label>Portafiltro [mm]</label><input type="number" id="e-esp-pf" placeholder="58"></div>
      <div class="fg"><label>Tipo de caldeira</label>
        <select id="e-esp-boiler"><option>Single boiler</option><option>Heat Exchange (HX)</option><option>Dual boiler</option><option>Thermoblock</option><option>Thermojet</option></select>
      </div>
      <div class="fg fg-check"><input type="checkbox" id="e-esp-pid"><label for="e-esp-pid">PID</label></div>`;
  } else if (cat === 'Chaleira') {
    html = `
      <div class="fg fg-check"><input type="checkbox" id="e-chal-el"><label for="e-chal-el">Elétrica</label></div>
      <div class="fg fg-check"><input type="checkbox" id="e-chal-temp"><label for="e-chal-temp">Controle de temp. preciso</label></div>`;
  } else if (cat === 'Balança') {
    html = `
      <div class="fg"><label>Precisão</label>
        <select id="e-bal-prec"><option>1g</option><option>0.1g</option><option>0.01g</option></select>
      </div>`;
  }
  specs.innerHTML = html;
}

function getEquipSpecs() {
  const cat = val('e-cat');
  const specs = {};
  if (cat === 'Moedor manual' || cat === 'Moedor elétrico') {
    specs.moTipo = val('e-mo-tipo'); specs.moMm = val('e-mo-mm'); specs.moAjuste = val('e-mo-ajuste');
  } else if (cat === 'Máquina de espresso') {
    specs.espPf = val('e-esp-pf'); specs.espBoiler = val('e-esp-boiler');
    specs.espPid = $('e-esp-pid') && $('e-esp-pid').checked;
  } else if (cat === 'Chaleira') {
    specs.chalEl = $('e-chal-el') && $('e-chal-el').checked;
    specs.chalTemp = $('e-chal-temp') && $('e-chal-temp').checked;
  } else if (cat === 'Balança') {
    specs.balPrec = val('e-bal-prec');
  }
  return specs;
}

function saveEquip() {
  const marca = val('e-marca'), modelo = val('e-modelo');
  if (!marca || !modelo) { showToast('Informe marca e modelo'); return; }
  const obj = {
    id: uid(), cat: val('e-cat'), marca, modelo,
    versao: val('e-versao'), status: val('e-status'),
    compra: val('e-compra'), manut: val('e-manut'),
    serial: val('e-serial'), notas: val('e-notas'),
    specs: getEquipSpecs()
  };
  const data = ls('equipamentos'); data.push(obj); lsSet('equipamentos', data);
  showToast('Equipamento salvo!');
  toggleForm('form-equip');
  renderEquip();
}

const equipIcons = {
  'Moedor manual': 'ti-rotate-clockwise', 'Moedor elétrico': 'ti-settings',
  'Máquina de espresso': 'ti-device-desktop', 'Chaleira': 'ti-droplet',
  'Balança': 'ti-scale', 'Termômetro': 'ti-temperature', 'Refratômetro': 'ti-eye',
  'Acessório': 'ti-adjustments', 'Outros': 'ti-tool'
};

function renderEquip() {
  const list = $('equip-list');
  const data = ls('equipamentos');
  if (!data.length) { list.innerHTML = '<div class="empty"><i class="ti ti-tool"></i><p>Nenhum equipamento cadastrado ainda.</p></div>'; return; }
  const cats = [...new Set(data.map(e => e.cat))];
  list.innerHTML = cats.map(cat => {
    const items = data.filter(e => e.cat === cat);
    return `<div class="sdiv">${cat}</div>` + items.slice().reverse().map(e => {
      const icon = equipIcons[e.cat] || 'ti-tool';
      const sc = e.status === 'Ativo' ? 'b-ativo' : e.status === 'Inativo' ? 'b-inativo' : 'b-vendido';
      let specsStr = '';
      if (e.specs) {
        const s = e.specs;
        const parts = [];
        if (s.moTipo) parts.push(s.moTipo);
        if (s.moMm) parts.push(s.moMm + 'mm');
        if (s.moAjuste) parts.push(s.moAjuste);
        if (s.espBoiler) parts.push(s.espBoiler);
        if (s.espPf) parts.push(s.espPf + 'mm');
        if (s.espPid) parts.push('PID');
        if (s.chalEl) parts.push('Elétrica');
        if (s.chalTemp) parts.push('Temp. preciso');
        if (s.balPrec) parts.push('Precisão ' + s.balPrec);
        specsStr = parts.join(' · ');
      }
      return `<div class="equip-card">
        <div class="eq-icon"><i class="ti ${icon}"></i></div>
        <div class="eq-body">
          <div class="eq-name">${e.marca} ${e.modelo}${e.versao ? ' <span style="font-size:10px;color:var(--tm)">' + e.versao + '</span>' : ''}</div>
          <div class="eq-detail">${e.cat}${specsStr ? ' · ' + specsStr : ''}</div>
          <div class="eq-tags"><span class="eq-tag ${sc}">${e.status}</span>${e.compra ? `<span class="eq-tag">Compra: ${e.compra}</span>` : ''}</div>
        </div>
      </div>`;
    }).join('');
  }).join('');
}