/* =========================
   SECTIONS UTILS
========================= */

export function calculateCentroid(coordinates) {
  let ring;

  if (Array.isArray(coordinates[0][0][0])) {
    ring = coordinates[0][0];
  } else {
    ring = coordinates[0];
  }

  let lng = 0;
  let lat = 0;

  ring.forEach(coord => {
    lng += coord[0];
    lat += coord[1];
  });

  return [lat / ring.length, lng / ring.length];
}
