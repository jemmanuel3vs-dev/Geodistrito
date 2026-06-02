/* =========================
   STATE GLOBAL
========================= */

export const state = {

  // Authentication / user
  usuario: null,
  token: null,

  // Map objects (Spanish aliases requested)
  mapa: null,
  marker: null,

  // Legacy/compat names (kept for backwards compatibility)
  map: null,
  circle: null,
  sectionsLayer: null,
  nearestSectionLayer: null,
  sectionCentroids: [],
  savedMarkers: [],
  currentLocation: null,

  // Points and filters (Spanish aliases + legacy names)
  puntos: [],
  points: [],
  filteredPuntos: [],
  filteredPoints: [],

  // Filters
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

  mapMode: 'markers',
  clusterGroup: null,
  heatLayer: null,

  layers: {
    // Leaflet layer groups must be created after Leaflet and map initialization.
    bardas: null,
    lonas: null,
    comites: null,
    casillas: null
  }

};

/* =========================
   HELPERS
========================= */

function setPoints(points){

  // keep both english and spanish keys in sync
  state.points = points;
  state.puntos = points;

  state.filteredPoints = points;
  state.filteredPuntos = points;

}

function addPointToState(point){

  state.points.push(point);
  state.puntos.push(point);

  state.filteredPoints.push(point);
  state.filteredPuntos.push(point);

}

function resetFiltersState(){

  const defaultFilters = {
    tipo: 'all',
    distrito: '',
    seccion: '',
    municipio: '',
    encargado: ''
  };

  state.filters = Object.assign({}, defaultFilters);
  state.filtros = Object.assign({}, defaultFilters);
  state.filters = Object.assign({}, defaultFilters);

}

/* -------------------------
   New small API helpers
   ------------------------- */

function setUsuario(user){
  state.usuario = user;
}

function getUsuario(){
  return state.usuario;
}

function setMapa(m){
  state.mapa = m;
  state.map = m; // backward compat
}

function getMapa(){
  return state.mapa || state.map;
}

function setMarker(m){
  state.marker = m;
  state.marker = m;
}

function getMarker(){
  return state.marker;
}

function setFiltros(f){
  state.filtros = Object.assign({}, f);
  state.filters = Object.assign({}, f);
}

function getFiltros(){
  return state.filtros;
}

function setPuntos(arr){
  setPoints(arr);
}

function getPuntos(){
  return state.puntos;
}

if (typeof window !== 'undefined') {
  window.state = state;
}