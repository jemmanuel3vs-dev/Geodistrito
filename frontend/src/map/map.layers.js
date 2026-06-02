
import { state } from '../core/state.js';

export function createBaseMap() {

  const map = L.map('map').setView(
    [23.2494, -106.4111],
    12
  );

  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution:
        '&copy; OpenStreetMap'
    }
  ).addTo(map);

  return map;

}
