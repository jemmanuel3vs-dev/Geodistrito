function uniqueCount(
  points,
  field
) {

  const values =
    new Set();

  points.forEach(point => {

    const value =
      point[field];

    if (value !== undefined && value !== null && value !== '') {
      values.add(String(value));
    }

  });

  return values.size;

}

function setText(
  id,
  value
) {

  const element =
    document.getElementById(id);

  if (element) {
    element.textContent = value;
  }

}

export function renderAdminDashboard(points) {

  setText(
    'kpiTotalPoints',
    points.length
  );

  setText(
    'kpiDistricts',
    uniqueCount(points, 'distrito')
  );

  setText(
    'kpiSections',
    uniqueCount(points, 'seccion')
  );

  setText(
    'kpiMunicipalities',
    uniqueCount(points, 'municipio')
  );

  setText(
    'kpiComites',
    points.filter(point => point.tipo === 'comites').length
  );

  setText(
    'kpiActiveUsers',
    uniqueCount(points, 'usuario_id')
  );

  setText(
    'dashboardUpdated',
    `Última actualización: ${new Date().toLocaleString('es-MX')}`
  );

}
