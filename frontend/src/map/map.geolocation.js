import { state } from '../core/state.js';
import { getNearestSection } from './map.sections.js';
import { setUserMarker } from './map.markers.js';
import { showError, showSuccess } from '../ui/toast.js';

export async function locateUser() {
  if (!navigator.geolocation) {
    showError('Geolocalización no soportada');
    return;
  }

  console.log('📍 Iniciando geolocalización...');

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      console.log('📍 Ubicación obtenida:', { lat, lng });

      state.currentLocation = { lat, lng };

      setUserMarker(lat, lng);
      state.map.setView([lat, lng], 16);

      document.getElementById('lat').textContent = lat.toFixed(6);
      document.getElementById('lng').textContent = lng.toFixed(6);

      await performReverseGeocoding(lat, lng);

      const nearest = getNearestSection(lat, lng);
      console.log('📍 Sección detectada:', nearest);

      if (nearest) {
        document.getElementById('nearest-section').textContent = nearest.section.seccion;
        document.getElementById('nearest-district').textContent = nearest.section.distrito_l;
      }

      showSuccess('✅ Ubicación obtenida');
    },
    () => {
      showError('No se pudo obtener ubicación. Verifica los permisos.');
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

export async function locateFromLink() {
  const input = document.getElementById('locationLink');
  const link = input?.value?.trim();

  if (!link) {
    showError('Pega un enlace de Google Maps o Apple Maps');
    return;
  }

  const coords = extractCoordinatesFromGoogleMapsLink(link);
  if (!coords) {
    showError('No se pudieron extraer coordenadas');
    return;
  }

  await updateLocationFromCoords(coords.lat, coords.lng);
  showSuccess('Ubicación cargada desde link');
}

function extractCoordinatesFromGoogleMapsLink(link) {
  try {
    let match = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }

    match = link.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (match) {
      return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }

    match = link.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }

    match = link.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function updateLocationFromCoords(lat, lng) {
  state.currentLocation = { lat, lng };
  setUserMarker(lat, lng);
  state.map.setView([lat, lng], 16);

  document.getElementById('lat').textContent = lat.toFixed(6);
  document.getElementById('lng').textContent = lng.toFixed(6);

  await performReverseGeocoding(lat, lng);

  const nearest = getNearestSection(lat, lng);
  if (nearest) {
    document.getElementById('nearest-section').textContent = nearest.section.seccion;
    document.getElementById('nearest-district').textContent = nearest.section.distrito_l;
  }
}

async function performReverseGeocoding(lat, lng) {
  try {
    console.log('🌐 Iniciando reverse geocoding...');

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );

    if (!response.ok) throw new Error('Error en reverse geocoding');

    const data = await response.json();
    console.log('🌐 Respuesta Nominatim:', data);

    const address = data.address || {};
    const street = address.road || address.street || 'No disponible';
    const colonia =
      address.neighbourhood ??
      address.suburb ??
      address.residential ??
      address.quarter ??
      address.hamlet ??
      null;
    const municipality = address.city || address.town || address.county || 'No disponible';

    document.getElementById('street').textContent = street;
    document.getElementById('neighborhood').textContent = colonia;
    document.getElementById('municipio').textContent = municipality;

    console.log('✅ Reverse geocoding completado:', { street, colonia, municipality });
  } catch (error) {
    console.error('❌ Error en reverse geocoding:', error);
    document.getElementById('street').textContent = 'No disponible';
    document.getElementById('neighborhood').textContent = 'No disponible';
    document.getElementById('municipio').textContent = 'No disponible';
  }
}
