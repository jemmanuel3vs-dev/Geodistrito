/* =========================
   STATE GLOBAL
========================= */

export const state = {

  // Usuario / autenticación
  usuario: null,
  token: null,

  // Mapa
  mapa: null,
  map: null,
  marker: null,
  circle: null,
  currentLocation: null,

  // Capas de secciones
  sectionsLayer: null,
  nearestSectionLayer: null,
  sectionCentroids: [],
  savedMarkers: [],
  clusterGroup: null,
  heatLayer: null,

  // Puntos (ambos nombres para compatibilidad)
  puntos: [],
  points: [],
  filteredPuntos: [],
  filteredPoints: [],

  // Filtros (ambos nombres para compatibilidad)
  filtros: {
    tipo: 'all',
    distrito: '',
    seccion: '',
    municipio: '',
    encargado: ''
  },
  filters: {
    tipo: 'all',
    distrito: '',
    seccion: '',
    municipio: '',
    encargado: ''
  },

  // Modo de visualización del mapa
  mapMode: 'markers',

  // Capas Leaflet por tipo
  layers: {
    bardas: null,
    lonas: null,
    comites: null,
    casillas: null
  }

};

/* =========================
   HELPERS — mantener sincronización español/inglés
========================= */

export function setPuntos(points) {
  state.points = points;
  state.puntos = points;
  state.filteredPoints = points;
  state.filteredPuntos = points;
}

export function addPunto(point) {
  state.points.push(point);
  state.puntos.push(point);
  state.filteredPoints.push(point);
  state.filteredPuntos.push(point);
}

export function setFiltros(f) {
  const synced = { tipo: 'all', distrito: '', seccion: '', municipio: '', encargado: '', ...f };
  state.filtros = { ...synced };
  state.filters = { ...synced };
}

export function resetFilters() {
  const defaults = { tipo: 'all', distrito: '', seccion: '', municipio: '', encargado: '' };
  state.filtros = { ...defaults };
  state.filters = { ...defaults };
}

export function setUsuario(user) {
  state.usuario = user;
}

export function getUsuario() {
  return state.usuario;
}

export function setMapa(m) {
  state.mapa = m;
  state.map = m;
}

export function getMapa() {
  return state.mapa || state.map;
}
