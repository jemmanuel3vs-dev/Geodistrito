/* =========================
   STATE GLOBAL
========================= */

const state = {

  map: null,

  marker: null,

  circle: null,

  sectionsLayer: null,

  nearestSectionLayer: null,

  sectionCentroids: [],

  savedMarkers: [],

  currentLocation: null,

  points: [],

  filteredPoints: [],

  mapMode: 'markers',

  filters: {

    tipo: 'all',

    distrito: '',

    seccion: '',

    municipio: '',

    encargado: ''

  },

  clusterGroup: null,

  heatLayer: null,

  layers: {

    bardas: L.layerGroup(),

    lonas: L.layerGroup(),

    comites: L.layerGroup(),

    casillas: L.layerGroup()

  }

};

/* =========================
   HELPERS
========================= */

function setPoints(points){

  state.points = points;

  state.filteredPoints = points;

}

function addPointToState(point){

  state.points.push(point);

  state.filteredPoints.push(point);

}

function resetFiltersState(){

  state.filters = {

    tipo: 'all',

    distrito: '',

    seccion: '',

    municipio: '',

    encargado: ''

  };

}