
import { state } from '../core/state.js';

/**
 * Establecer marcador de usuario único
 * Elimina marcador anterior si existe
 */
export function setUserMarker(lat, lng) {

  console.log('📌 setUserMarker:', { lat, lng });

  // Eliminar marcador anterior si existe
  if (
  state.marker &&
  state.map.hasLayer(
    state.marker
  )
) {

  state.map.removeLayer(
    state.marker
  );

}

  // Crear nuevo marcador
  state.marker = L.marker(
    [lat, lng],
    {
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
    }
  ).bindPopup('📍 Tu ubicación actual').addTo(state.map);

  console.log('✅ Marcador creado y agregado al mapa');

}

/**
 * Renderizar puntos guardados
 */
export function renderPoints() {

  console.log('📍 Renderizando puntos');

  if (!state.points?.length) {

    console.warn(
      '⚠️ No hay puntos'
    );

    return;

  }

  state.savedMarkers.forEach(marker => {
    state.map.removeLayer(marker);
  });

  state.savedMarkers = [];

  state.points.forEach(point => {

    const lat =
      parseFloat(point.lat);

    const lng =
      parseFloat(point.lng);

    if (
      isNaN(lat) ||
      isNaN(lng)
    ) {
      return;
    }

    const marker =
      L.marker([
        lat,
        lng
      ],
      {
        pane: 'markersPane'
      })
      .bindPopup(`
        <strong>${point.tipo}</strong><br>
        Distrito: ${point.distrito}<br>
        Sección: ${point.seccion}
      `)
      .addTo(state.map);

    state.savedMarkers.push(
      marker
    );

  });

  console.log(
    `✅ ${state.savedMarkers.length} marcadores renderizados`
  );

}

export function renderClusters() {

  if (!state.points?.length) {
    return;
  }

  state.clusterGroup.clearLayers();

  state.points.forEach(point => {

    const lat =
      parseFloat(point.lat);

    const lng =
      parseFloat(point.lng);

    if (
      isNaN(lat) ||
      isNaN(lng)
    ) {
      return;
    }

    const marker =
      L.marker(
        [lat, lng],
        {
          pane: 'markersPane'
        }
      )
      .bindPopup(`
        <strong>${point.tipo}</strong><br>
        Distrito: ${point.distrito}<br>
        Sección: ${point.seccion}
      `);

    state.clusterGroup.addLayer(
      marker
    );

  });

}

export function renderHeatmap() {

  if (!state.points?.length) {
    return;
  }

  const heatData = [];

  state.points.forEach(point => {

    const lat = parseFloat(point.lat);
    const lng = parseFloat(point.lng);

    if (
      isNaN(lat) ||
      isNaN(lng)
    ) {
      return;
    }

    heatData.push([
      lat,
      lng,
      1
    ]);

  });

 if (state.heatLayer) {

  state.map.removeLayer(
    state.heatLayer
  );

  state.heatLayer = null;

}

  state.heatLayer =
    L.heatLayer(
      heatData,
      {
        radius: 25,
        blur: 15,
        maxZoom: 17
      }
    );

}
