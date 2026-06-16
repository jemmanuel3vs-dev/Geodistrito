import { state } from '../core/state.js';
import { getAllPoints } from '../services/points.service.js';
import {
  locateUser,
  locateFromLink
} from './map.geolocation.js';
import {
  createBaseMap
} from './map.layers.js';
import { loadSections } from './map.sections.js';
import {
  renderPoints,
  renderClusters,
  renderHeatmap
} from './map.markers.js';

/* =========================
   INIT MAP
========================= */

export function initMap() {
  state.map = createBaseMap();
}

/* =========================
   INIT LAYERS
========================= */
export function initLayers() {
  state.clusterGroup = L.markerClusterGroup();
  console.log('🗺️ Layers inicializadas');
}

/* =========================
   LOAD POINTS
========================= */

export async function loadPoints() {
  try {
    const points = await getAllPoints();
    state.points = points;
    state.puntos = points;
  } catch (error) {
    console.error(error);
  }
}

/* =========================
   RENDER OVERLAY
========================= */

export function renderMapOverlay() {
  console.log('🎨 Overlay renderizado');
}

export function setMapMode(mode) {
  console.log(`🗺️ Cambiando vista a: ${mode}`);
  state.mapMode = mode;

  // Cleanup existing layers
  state.savedMarkers.forEach(marker => {
    if (state.map.hasLayer(marker)) {
      state.map.removeLayer(marker);
    }
  });

  if (state.clusterGroup && state.map.hasLayer(state.clusterGroup)) {
    state.map.removeLayer(state.clusterGroup);
  }

  if (state.heatLayer && state.map.hasLayer(state.heatLayer)) {
    state.map.removeLayer(state.heatLayer);
  }

  switch (mode) {
    case 'markers':
      renderPoints();
      break;
    case 'clusters':
      renderClusters();
      state.map.addLayer(state.clusterGroup);
      break;
    case 'heat':
      renderHeatmap();
      state.map.addLayer(state.heatLayer);
      break;
  }
}

export { loadSections, locateUser, locateFromLink };
