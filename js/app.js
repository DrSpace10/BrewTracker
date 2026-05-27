// ──────────────────────────────────────────────────────────────
// UTILS
// ──────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const val = id => $(id) ? $(id).value.trim() : '';
const today = () => new Date().toISOString().slice(0,10);
const now = () => { const d = new Date(); return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0'); };

function ls(key) { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch(e) { return [] } }
function lsSet(key, data) { localStorage.setItem(key, JSON.stringify(data)) }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6) }

function showToast(msg) {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function toggleForm(id) {
  const el = $(id);
  if (el.classList.contains('hidden')) { el.classList.remove('hidden'); }
  else { el.classList.add('hidden'); }
}

// ──────────────────────────────────────────────────────────────
// TABS
// ──────────────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    $('panel-' + btn.dataset.tab).classList.add('active');
    if (btn.dataset.tab === 'receitas') populateReceitaSelects();
    if (btn.dataset.tab === 'diario') { populateDiarioSelects(); renderDiario(); }
  });
});

// ──────────────────────────────────────────────────────────────
// HEADER DATE
// ──────────────────────────────────────────────────────────────
(function(){
  const d = new Date();
  $('hd').textContent = d.toLocaleDateString('pt-BR', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'});
})();

// ──────────────────────────────────────────────────────────────
// INIT (Executa após todos os scripts carregarem)
// ──────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  renderEquipFields();
  renderCafes();
  renderEquip();
  renderMetodos();
  renderReceitas();
  populateDiarioSelects();
  renderDiario();
});

// Controle do Menu Lateral (Sidebar)
window.toggleSidebar = function() {
  const sb = document.getElementById('sidebar-menu');
  const ov = document.getElementById('sidebar-overlay');
  
  if (sb.classList.contains('open')) {
    sb.classList.remove('open');
    ov.classList.remove('show');
  } else {
    sb.classList.add('open');
    ov.classList.add('show');
  }
};
