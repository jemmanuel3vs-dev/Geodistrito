/**
 * Configuración centralizada
 * URLs, constantes, valores por defecto
 */

export const config = {
  // API
  api: {
    baseUrl: 'http://localhost:3000',
    endpoints: {
      auth: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        logout: '/api/auth/logout'
      },
      puntos: {
        list: '/api/puntos',
        create: '/api/puntos',
        update: (id) => `/api/puntos/${id}`,
        delete: (id) => `/api/puntos/${id}`,
        getById: (id) => `/api/puntos/${id}`
      },
      stats: {
        overview: '/api/stats/overview',
        byDistrict: '/api/stats/by-district',
        byType: '/api/stats/by-type',
        byMunicipality: '/api/stats/by-municipality',
        activityByDate: '/api/stats/activity-by-date',
        byUser: '/api/stats/by-user',
        byState: '/api/stats/by-state'
      }
    }
  },

  // Mapa
  map: {
    defaultCenter: [23.2494, -106.4111],
    defaultZoom: 13,
    minZoom: 10,
    maxZoom: 18,
    tileLayer: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
  },

  // Tipos de puntos permitidos
  pointTypes: [
    { value: 'bardas', label: 'Bardas' },
    { value: 'lonas', label: 'Lonas' },
    { value: 'comites', label: 'Comités' },
    { value: 'casillas', label: 'Casillas' }
  ],

  // Distritos
  districts: [
    { id: '20', name: 'Distrito 20', lat: 24.809, lng: -107.394 },
    { id: '21', name: 'Distrito 21', lat: 25.783, lng: -109.080 },
    { id: '22', name: 'Distrito 22', lat: 23.249, lng: -106.411 },
    { id: '23', name: 'Distrito 23', lat: 25.565, lng: -108.459 }
  ],

  // Colores por distrito
  districtColors: {
    20: '#ef4444', // rojo
    21: '#3b82f6', // azul
    22: '#22c55e', // verde
    23: '#f59e0b', // naranja
    24: '#a855f7'  // morado
  },

  // Storage
  storage: {
    tokenKey: 'geodistrito_token',
    userKey: 'geodistrito_user',
    filterKey: 'geodistrito_filters'
  },

  // Timeouts
  timeouts: {
    api: 10000,           // 10 segundos
    geolocation: 15000,   // 15 segundos
    debounce: 300         // 300ms
  },

  // Nominatim (Reverse Geocoding)
  nominatim: {
    baseUrl: 'https://nominatim.openstreetmap.org',
    timeout: 5000
  },

  // Uploads
  uploads: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  }
};

export default config;
