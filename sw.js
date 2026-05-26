// BrewTracker — Service Worker
// Atualiza a versão do cache sempre que publicar uma nova build.
const CACHE_NAME = 'brewtracker-v1';

// Arquivos estáticos para cache inicial (ajuste os caminhos se necessário)
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-1024.png'
];

// ── INSTALL: pré-carrega os arquivos estáticos ────────────────
self.addEventListener('install', event => {
  console.log('[SW] Instalando…');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cacheando arquivos estáticos');
      // addAll falha se qualquer arquivo retornar erro —
      // use add() individual para assets opcionais.
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: limpa caches antigos ───────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Ativando…');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Removendo cache antigo:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: Cache-first para assets estáticos ─────────────────
// Estratégia: tenta o cache primeiro; se não encontrar, busca
// na rede e armazena no cache para uso futuro.
self.addEventListener('fetch', event => {
  // Ignora requisições não-GET e requests para outros domínios
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        // Só armazena respostas válidas
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        // Fallback offline: retorna o index.html para navegação
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
