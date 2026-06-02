
import { state } from '../core/state.js';

/**
 * Establecer marcador de usuario único
 * Elimina marcador anterior si existe
 */
export function setUserMarker(lat, lng) {

  console.log('📌 setUserMarker:', { lat, lng });

  // Eliminar marcador anterior si existe
  if (state.marker) {

    console.log('🗑️ Removiendo marcador anterior');

    state.map.removeLayer(state.marker);

    state.marker = null;

  }

  // Crear nuevo marcador
  state.marker = L.marker(
    [lat, lng],
    {
      title: 'Ubicación actual',
      icon: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    }
  ).bindPopup('📍 Tu ubicación actual').addTo(state.map);

  console.log('✅ Marcador creado y agregado al mapa');

}

/**
 * Renderizar puntos guardados
 */
export function renderPoints() {

  console.log('📍 Renderizando puntos...');

  if (!state.points || state.points.length === 0) {
    console.log('⚠️ No hay puntos para renderizar');
    return;
  }

  console.log(`📍 Renderizando ${state.points.length} puntos`);

}

