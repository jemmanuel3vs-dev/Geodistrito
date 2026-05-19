function getExportPoints() {
  return state.filteredPoints?.length ? state.filteredPoints : state.points;
}

function normalizeExportPoints(points) {
  return points.map(point => ({
    id: point.id,
    tipo: point.tipo,
    distrito: point.distrito,
    seccion: point.seccion,
    municipio: point.municipio,
    calle: point.calle,
    colonia: point.colonia,
    encargado: point.encargado,
    estado: point.estado,
    usuario_id: point.usuario_id,
    created_at: point.created_at,
    updated_at: point.updated_at,
    url: point.url
  }));
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function exportToExcel() {
  const points = getExportPoints();
  if (!points.length) {
    alert('No hay datos para exportar.');
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(normalizeExportPoints(points));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'GeoDistrito');
  XLSX.writeFile(workbook, 'GeoDistrito.xlsx');
}

function exportToCsv() {
  const points = getExportPoints();
  if (!points.length) {
    alert('No hay datos para exportar.');
    return;
  }

  const rows = normalizeExportPoints(points);
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(',')].concat(
    rows.map(row => headers.map(field => JSON.stringify(row[field] ?? '')).join(','))
  ).join('\r\n');

  downloadFile(csv, 'GeoDistrito.csv', 'text/csv;charset=utf-8;');
}

function exportToGeoJSON() {
  const points = getExportPoints();
  if (!points.length) {
    alert('No hay datos para exportar.');
    return;
  }

  const features = points
    .filter(point => point.lat != null && point.lng != null)
    .map(point => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [Number(point.lng), Number(point.lat)]
      },
      properties: {
        id: point.id,
        tipo: point.tipo,
        distrito: point.distrito,
        seccion: point.seccion,
        municipio: point.municipio,
        calle: point.calle,
        colonia: point.colonia,
        encargado: point.encargado,
        estado: point.estado,
        usuario_id: point.usuario_id,
        created_at: point.created_at,
        updated_at: point.updated_at,
        url: point.url
      }
    }));

  const featureCollection = {
    type: 'FeatureCollection',
    features
  };

  downloadFile(JSON.stringify(featureCollection, null, 2), 'GeoDistrito.geojson', 'application/geo+json;charset=utf-8;');
}