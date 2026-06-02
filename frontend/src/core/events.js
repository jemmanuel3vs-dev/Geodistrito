/**
 * Event Bus Global
 * Sistema centralizado de eventos para comunicación entre módulos
 */

class EventBus {
  constructor() {
    this.events = {};
  }

  /**
   * Registrar un listener para un evento
   * @param {string} eventName - Nombre del evento
   * @param {function} callback - Función a ejecutar
   * @returns {function} Función para desuscribirse
   */
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);

    // Retornar función para desuscribirse
    return () => this.off(eventName, callback);
  }

  /**
   * Registrar listener que se ejecuta solo una vez
   * @param {string} eventName - Nombre del evento
   * @param {function} callback - Función a ejecutar
   */
  once(eventName, callback) {
    const unsubscribe = this.on(eventName, (...args) => {
      callback(...args);
      unsubscribe();
    });
    return unsubscribe;
  }

  /**
   * Desuscribirse de un evento
   * @param {string} eventName - Nombre del evento
   * @param {function} callback - Función a remover
   */
  off(eventName, callback) {
    if (!this.events[eventName]) return;
    this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
  }

  /**
   * Emitir un evento
   * @param {string} eventName - Nombre del evento
   * @param {*} payload - Datos a pasar a los listeners
   */
  emit(eventName, payload) {
    if (!this.events[eventName]) return;
    this.events[eventName].forEach(callback => {
      try {
        callback(payload);
      } catch (error) {
        console.error(`Error en evento ${eventName}:`, error);
      }
    });
  }

  /**
   * Limpiar todos los listeners de un evento
   * @param {string} eventName - Nombre del evento (opcional, si no se pasa limpia todo)
   */
  clear(eventName) {
    if (eventName) {
      delete this.events[eventName];
    } else {
      this.events = {};
    }
  }
}

// Instancia singleton
export const eventBus = new EventBus();

// Eventos predefinidos (documentación)
export const EVENTS = {
  // Mapa
  MAP_INITIALIZED: 'map:initialized',
  MAP_CLICKED: 'map:clicked',
  LOCATION_CHANGED: 'location:changed',
  MARKER_UPDATED: 'marker:updated',

  // Puntos
  POINT_SAVED: 'point:saved',
  POINT_DELETED: 'point:deleted',
  POINT_UPDATED: 'point:updated',
  POINTS_LOADED: 'points:loaded',

  // Filtros
  FILTER_CHANGED: 'filter:changed',
  FILTER_CLEARED: 'filter:cleared',

  // UI
  TOAST_SHOW: 'toast:show',
  MODAL_OPEN: 'modal:open',
  MODAL_CLOSE: 'modal:close',

  // Autenticación
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_FAILED: 'auth:failed',

  // Errores
  ERROR_OCCURRED: 'error:occurred'
};

export default eventBus;
