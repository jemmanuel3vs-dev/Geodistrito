import { state } from '../core/state.js';

/* =========================
   MAP MARKERS HELPERS
========================= */

function normalizePointLatLng(point) {
  const lat = parseFloat(point.lat);
  const lng = parseFloat(point.lng);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }

  return { lat, lng };
}

function buildPopupContent(point) {
  return `
    <strong>${point.tipo}</strong><br>
    Distrito: ${point.distrito}<br>
    Sección: ${point.seccion}
  `;
}

function forEachValidPoint(callback) {
  if (!state.points?.length) {
    return;
  }

  state.points.forEach(point => {
    const coordinates = normalizePointLatLng(point);

    if (!coordinates) {
      return;
    }

    callback(point, coordinates.lat, coordinates.lng);
  });
}

/* =========================
   USER LOCATION MARKER
========================= */
export function setUserMarker(lat, lng) {
  if (state.marker && state.map.hasLayer(state.marker)) {
    state.map.removeLayer(state.marker);
  }

  state.marker = L.marker([lat, lng], {
    pane: 'userPane',
    title: 'Ubicación actual',
    icon: L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })
  })
    .bindPopup('📍 Tu ubicación actual')
    .addTo(state.map);
}

/* =========================
   RENDER POINTS
========================= */
export function renderPoints() {
  if (!state.points?.length) {
    return;
  }

  state.savedMarkers.forEach(marker => {
    state.map.removeLayer(marker);
  });

  state.savedMarkers = [];

  forEachValidPoint((point, lat, lng) => {
    const marker = L.marker([lat, lng], {
      pane: 'markersPane'
    })
      .bindPopup(buildPopupContent(point))
      .addTo(state.map);

    state.savedMarkers.push(marker);
  });
}

/* =========================
   RENDER CLUSTERS
========================= */
export function renderClusters() {
  if (!state.points?.length) {
    return;
  }

  state.clusterGroup.clearLayers();

  forEachValidPoint((point, lat, lng) => {
    const marker = L.marker([lat, lng], {
      pane: 'markersPane'
    }).bindPopup(buildPopupContent(point));

    state.clusterGroup.addLayer(marker);
  });
}

/* =========================
   RENDER HEATMAP
========================= */
export function renderHeatmap() {
  if (!state.points?.length) {
    return;
  }

  const heatData = [];

  forEachValidPoint((point, lat, lng) => {
    heatData.push([lat, lng, 1]);
  });

  if (state.heatLayer) {
    state.map.removeLayer(state.heatLayer);
    state.heatLayer = null;
  }

  state.heatLayer = L.heatLayer(heatData, {
    radius: 25,
    blur: 15,
    maxZoom: 17
  });
}
