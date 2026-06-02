import {getNearestSection} from './map.sections.js';

import { state } from '../core/state.js';

import {
    setUserMarker
} from './map.markers.js';

import {
    showError,
    showSuccess
} from '../ui/toast.js';

export async function locateUser() {

  if (!navigator.geolocation) {

    showError(
      'Geolocalización no soportada'
    );

    return;

  }

  console.log('📍 Iniciando geolocalización...');

  navigator.geolocation.getCurrentPosition(

    async (position) => {

      const lat =
        position.coords.latitude;

      const lng =
        position.coords.longitude;

      console.log('📍 Ubicación obtenida:', { lat, lng });

      state.currentLocation = {
        lat,
        lng
      };

      // Mostrar marcador
      setUserMarker(lat, lng);
      console.log('📌 Marcador establecido');

      // Centrar mapa
      state.map.setView([lat, lng], 16);

      // Actualizar UI
      document.getElementById('lat').textContent = lat.toFixed(6);
      document.getElementById('lng').textContent = lng.toFixed(6);

      // Hacer reverse geocoding
      await performReverseGeocoding(lat, lng);

      const nearest =
      getNearestSection(
        lat,
        lng
      );

      console.log(
        '📍 Sección detectada:',
        nearest
      );

      if(nearest){

        document.getElementById(
          'nearest-section'
        ).textContent =
        nearest.section.seccion;

        document.getElementById(
          'nearest-district'
        ).textContent =
        nearest.section.distrito_l;

      }

      showSuccess('✅ Ubicación obtenida');

    },

    () => {

      showError(
        'No se pudo obtener ubicación. Verifica los permisos.'
      );

    },

    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }

  );

}

export async function locateFromLink() {

  const input =
  document.getElementById(
    'locationLink'
  );

  const link =
  input?.value?.trim();

  if(!link){

    showError(
      'Pega un enlace de Google Maps'
    );

    return;

  }

  const coords =
  extractCoordinatesFromGoogleMapsLink(
    link
  );

  if(!coords){

    showError(
      'No se pudieron extraer coordenadas'
    );

    return;

  }

  await updateLocationFromCoords(

    coords.lat,
    coords.lng

  );

  showSuccess(
    'Ubicación cargada desde link'
  );

}

function extractCoordinatesFromGoogleMapsLink(
  link
){

  try{

    let match =

    link.match(
      /@(-?\d+\.\d+),(-?\d+\.\d+)/
    );

    if(match){

      return {

        lat:
        parseFloat(match[1]),

        lng:
        parseFloat(match[2])

      };

    }

    match =

    link.match(
      /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/
    );

    if(match){

      return {

        lat:
        parseFloat(match[1]),

        lng:
        parseFloat(match[2])

      };

    }

    return null;

  }

  catch(error){

    console.error(error);

    return null;

  }

}

async function updateLocationFromCoords(
  lat,
  lng
){

  state.currentLocation = {
    lat,
    lng
  };

  setUserMarker(
    lat,
    lng
  );

  state.map.setView(
    [lat, lng],
    16
  );

  document.getElementById(
    'lat'
  ).textContent =
  lat.toFixed(6);

  document.getElementById(
    'lng'
  ).textContent =
  lng.toFixed(6);

  await performReverseGeocoding(
    lat,
    lng
  );

  const nearest =
  getNearestSection(
    lat,
    lng
  );

  if(nearest){

    document.getElementById(
      'nearest-section'
    ).textContent =
    nearest.section.seccion;

    document.getElementById(
      'nearest-district'
    ).textContent =
    nearest.section.distrito_l;

  }

}

async function performReverseGeocoding(lat, lng) {
  try {
    console.log('🌐 Iniciando reverse geocoding...');

    // Usar Nominatim para obtener dirección
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );

    if (!response.ok) throw new Error('Error en reverse geocoding');

    const data = await response.json();
    console.log('🌐 Respuesta Nominatim:', data);

    // Extraer información
    const address = data.address || {};
    const street = address.road || address.street || 'No disponible';
    const neighborhood = address.neighbourhood || address.suburb || 'No disponible';
    const municipality = address.city || address.town || address.county || 'No disponible';

    // Actualizar UI
    document.getElementById('street').textContent = street;
    document.getElementById('neighborhood').textContent = neighborhood;
    document.getElementById('municipio').textContent = municipality;

    console.log('✅ Reverse geocoding completado:', { street, neighborhood, municipality });

  } catch (error) {
    console.error('❌ Error en reverse geocoding:', error);
    // Asignar valores por defecto
    document.getElementById('street').textContent = 'No disponible';
    document.getElementById('neighborhood').textContent = 'No disponible';
    document.getElementById('municipio').textContent = 'No disponible';
  }
}
