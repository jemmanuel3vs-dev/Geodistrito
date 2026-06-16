/**
 * ENTRY POINT ÚNICO DE LA APLICACIÓN
 *
 * Carga:
 * 1. Estado global (state.js)
 * 2. Servicios (maps, points, geolocation, etc)
 * 3. Módulos (sidebar, filters, exports, dashboard)
 * 4. Componentes UI (toast, modal)
 * 5. Página actual (home, admin, login)
 */

import { config } from './core/config.js';
import { eventBus, EVENTS } from './core/events.js';
import { state } from './core/state.js';

console.log('🚀 GeoDistrito iniciando...');

/**
 * Inicializar aplicación
 */
async function initApp() {
  try {
    console.log('📋 Estado:', state);
    console.log('⚙️ Configuración cargada:', config);
    console.log('📢 Event Bus listo');

    // Determinar página actual y cargar módulo correspondiente
    const page = detectPage();
    await loadPage(page);

    console.log('✅ Aplicación lista');
  } catch (error) {
    console.error('❌ Error iniciando aplicación:', error);
    handleFatalError(error);
  }
}

/**
 * Detectar página actual
 */
function detectPage() {
  const path = window.location.pathname;

  if (path.includes('admin')) return 'admin';
  if (path.includes('login')) return 'login';
  return 'home';
}

/**
 * Cargar módulo de página
 */
async function loadPage(page) {
  switch (page) {
    case 'admin':
      console.log('📄 Página: Admin');
      const { initAdminPage } = await import('./pages/admin.page.js');
      initAdminPage();
      break;

    case 'login':
      console.log('📄 Página: Login');
      const { initLogin } = await import('./pages/login.page.js');
      initLogin();
      break;

    case 'home':
    default:
      // En index.html, cargar home page
      console.log('📄 Página: Home');
      const { initHome } = await import('./pages/home.page.js');
      await initHome();
      break;
  }
}

/**
 * Manejo de errores fatales
 */
function handleFatalError(error) {
  console.error('FATAL ERROR:', error);
  const body = document.body;
  body.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: #f3f4f6;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      <div style="
        background: white;
        padding: 40px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        max-width: 500px;
        text-align: center;
      ">
        <h1 style="color: #ef4444; margin: 0 0 20px 0;">Error Fatal</h1>
        <p style="color: #666; margin: 0 0 20px 0;">
          Hubo un error al inicializar la aplicación.
        </p>
        <pre style="
          background: #f3f4f6;
          padding: 15px;
          border-radius: 4px;
          text-align: left;
          overflow-x: auto;
          color: #ef4444;
        ">${error.message}</pre>
        <button
          onclick="location.reload()"
          style="
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 20px;
          "
        >
          Recargar página
        </button>
      </div>
    </div>
  `;
}

// Iniciar cuando DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Exponer a window para debugging
window.geodistrito = {
  state,
  config,
  eventBus,
  EVENTS
};

console.log('💡 Tip: window.geodistrito disponible para debugging');
