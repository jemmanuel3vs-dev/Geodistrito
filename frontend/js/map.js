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

legend.addTo(state.map);

/* =========================
   USER LOCATION
========================= */
function initUserLocation() {

}

/* =========================
   INIT LAYERS
========================= */
function initLayers() {
  Object.values(state.layers).forEach(layer => {
    layer.addTo(state.map);
  });
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
  if (!point?.lat || !point?.lng) return;

  const marker = L.marker([point.lat, point.lng], {
    icon: icons[point.tipo] || icons.bardas
  });

  marker.bindPopup(createPopup(point));

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
  clearMarkers();
  if (Array.isArray(state.points)) {
    state.points.forEach(point => addMarker(point));
  }
}

function renderFilteredMarkers(points) {
  clearMarkers();
  points.forEach(point => addMarker(point));
}