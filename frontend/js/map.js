/* =========================
   DISTRITOS
========================= */
const districts = [
  { id: '20', name: 'Distrito 20', lat: 24.809, lng: -107.394 },
  { id: '21', name: 'Distrito 21', lat: 25.783, lng: -109.080 },
  { id: '22', name: 'Distrito 22', lat: 23.249, lng: -106.411 },
  { id: '23', name: 'Distrito 23', lat: 25.565, lng: -108.459 }
];

/* =========================
   ICONOS (TEMPORALES - CDN)
========================= */
const icons = {
  bardas:   L.icon({ iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] }),
  lonas:    L.icon({ iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] }),
  comites:  L.icon({ iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] }),
  casillas: L.icon({ iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] })
};

/* =========================
   INIT MAP
========================= */
function initMap() {

  state.map = L.map('map', {

    zoomControl: false,

    preferCanvas: true

  }).setView(

    [23.2494, -106.4111],

    13

  );

  L.control.zoom({

    position: 'bottomright'

  }).addTo(state.map);

  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
      attribution: '&copy; OpenStreetMap & CARTO'
    }
  ).addTo(state.map);

  state.clusterGroup = L.markerClusterGroup({
    chunkedLoading: true,
    maxClusterRadius: 40,
    showCoverageOnHover: false
  });

  state.heatLayer = L.heatLayer([], {
    radius: 30,
    blur: 20,
    maxZoom: 15,
    gradient: {
      0.2: '#38bdf8',
      0.4: '#60a5fa',
      0.6: '#a855f7',
      0.8: '#f97316',
      1.0: '#ef4444'
    }
  });

  setupMapControls();

  legend.addTo(state.map);

}

/* =========================
   LEYENDA
========================= */

const legend = L.control({
  position: 'bottomright'
});

legend.onAdd = function(){

  const div = L.DomUtil.create(
    'div',
    'info legend'
  );

  div.innerHTML = `
    <h4>Distritos</h4>
    <div>
      <span style="background:#ef4444;"></span>
      Distrito 20
    </div>
    <div>
      <span style="background:#3b82f6;"></span>
      Distrito 21
    </div>
    <div>
      <span style="background:#22c55e;"></span>
      Distrito 22
    </div>
    <div>
      <span style="background:#f59e0b;"></span>
      Distrito 23
    </div>
    <div>
      <span style="background:#a855f7;"></span>
      Distrito 24
    </div>
  `;

  return div;

};


/* =========================
   USER LOCATION
========================= */
function initUserLocation() {
  if (!state.map) return;

  const initialLocation = [23.2494, -106.4111];

  state.marker = L.marker(initialLocation, {
    draggable: false
  }).addTo(state.map);

  state.circle = L.circle(initialLocation, {
    radius: 80,
    color: '#3388ff',
    fillColor: '#3388ff',
    fillOpacity: 0.15
  }).addTo(state.map);
}

function setUserMarker(lat, lng) {
  if (!state.map) return;
  const coords = [lat, lng];

  if (!state.marker) {
    state.marker = L.marker(coords, { draggable: false }).addTo(state.map);
  } else {
    state.marker.setLatLng(coords);
  }

  if (!state.circle) {
    state.circle = L.circle(coords, {
      radius: 80,
      color: '#3388ff',
      fillColor: '#3388ff',
      fillOpacity: 0.15
    }).addTo(state.map);
  } else {
    state.circle.setLatLng(coords);
  }
}

/* =========================
   INIT LAYERS
========================= */
function initLayers() {
  if (!state.map) return;
  Object.values(state.layers).forEach(layer => {
    layer.addTo(state.map);
  });
}

function setupMapControls() {
  const markersButton = document.getElementById('btnMapMarkers');
  const clustersButton = document.getElementById('btnMapClusters');
  const heatButton = document.getElementById('btnMapHeat');

  if (!markersButton || !clustersButton || !heatButton) {
    return;
  }

  markersButton.addEventListener('click', () => setMapOverlayMode('markers'));
  clustersButton.addEventListener('click', () => setMapOverlayMode('clusters'));
  heatButton.addEventListener('click', () => setMapOverlayMode('heat'));

  updateMapToggleButtons();
}

function setMapOverlayMode(mode) {
  state.mapMode = mode;
  updateMapToggleButtons();
  renderMapOverlay(state.filteredPoints.length ? state.filteredPoints : state.points);
}

function updateMapToggleButtons() {
  const buttons = [
    { id: 'btnMapMarkers', mode: 'markers' },
    { id: 'btnMapClusters', mode: 'clusters' },
    { id: 'btnMapHeat', mode: 'heat' }
  ];

  buttons.forEach(({ id, mode }) => {
    const button = document.getElementById(id);
    if (!button) return;
    button.classList.toggle('btn-active', state.mapMode === mode);
  });
}

function renderMapOverlay(points = []) {
  if (!state.map) return;

  clearMapOverlays();

  if (state.mapMode === 'clusters') {
    renderClusterMarkers(points);
    return;
  }

  if (state.mapMode === 'heat') {
    renderHeatmap(points);
    return;
  }

  renderStandardMarkers(points);
}

function renderStandardMarkers(points) {
  clearMarkers();
  points.forEach(point => addMarker(point));
}

function renderClusterMarkers(points) {
  if (!state.clusterGroup) return;

  state.clusterGroup.clearLayers();
  points.forEach(point => {
    const marker = createPointMarker(point);
    if (marker) {
      state.clusterGroup.addLayer(marker);
    }
  });

  if (!state.map.hasLayer(state.clusterGroup)) {
    state.clusterGroup.addTo(state.map);
  }
}

function renderHeatmap(points) {
  if (!state.heatLayer) return;

  const heatPoints = points
    .filter(point => point.lat && point.lng)
    .map(point => [point.lat, point.lng, 0.6]);

  state.heatLayer.setLatLngs(heatPoints);

  if (!state.map.hasLayer(state.heatLayer)) {
    state.heatLayer.addTo(state.map);
  }
}

function clearMapOverlays() {
  clearMarkers();
  if (state.clusterGroup) {
    state.clusterGroup.clearLayers();
    if (state.map && state.map.hasLayer(state.clusterGroup)) {
      state.map.removeLayer(state.clusterGroup);
    }
  }
  if (state.heatLayer) {
    state.heatLayer.setLatLngs([]);
    if (state.map && state.map.hasLayer(state.heatLayer)) {
      state.map.removeLayer(state.heatLayer);
    }
  }
}

function createPointMarker(point) {
  if (!state.map || !point?.lat || !point?.lng) return null;

  return L.marker([point.lat, point.lng], {
    icon: icons[point.tipo] || icons.bardas
  }).bindPopup(createPopup(point));
}

/* =========================
   DISTANCIA Y DISTRITO
========================= */
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function toRadians(value) {
  return value * Math.PI / 180;
}

function getNearestDistrict(lat, lng) {
  return districts.reduce((closest, current) => {
    const dist = distanceKm(lat, lng, current.lat, current.lng);
    if (!closest || dist < closest.dist) {
      return { district: current, dist };
    }
    return closest;
  }, null);
}

/* =========================
   DIRECCIÓN (NOMINATIM)
========================= */
async function getAddress(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    const address = data.address || {};

    return {
      calle: address.road || address.pedestrian || 'Sin calle',
      colonia: address.suburb || address.neighbourhood || 'Sin colonia',
      municipio: address.city || address.town || 'Sin municipio'
    };
  } catch (error) {
    console.error(error);
    return { calle: 'Sin calle', colonia: 'Sin colonia', municipio: 'Sin municipio' };
  }
}

/* =========================
   MARCADORES Y POPUPS
========================= */
function addMarker(point) {
  const marker = createPointMarker(point);
  if (!marker) return;

  const layer = state.layers[point.tipo];
  if (layer) marker.addTo(layer);
}

function createPopup(point) {
  return `
    <div style="width:240px; font-family:sans-serif;">
      ${point.url ? `<img src="${point.url}" style="width:100%; height:150px; object-fit:cover; border-radius:12px; margin-bottom:10px;">` : ''}
      <h3>${(point.tipo || '').toUpperCase()}</h3>
      <p><strong>Distrito:</strong> ${point.distrito || '-'}</p>
      <p><strong>Sección:</strong> ${point.seccion || '-'}</p>
      <p><strong>Municipio:</strong> ${point.municipio || '-'}</p>
      <p><strong>Calle:</strong> ${point.calle || '-'}</p>
      <p><strong>Colonia:</strong> ${point.colonia || '-'}</p>
      ${point.encargado ? `<p><strong>Encargado:</strong> ${point.encargado}</p>` : ''}
    </div>
  `;
}

function clearMarkers() {
  Object.values(state.layers).forEach(layer => layer.clearLayers());
}

function renderAllMarkers() {
  renderMapOverlay(state.points);
}

function renderFilteredMarkers(points) {
  renderMapOverlay(points);
}