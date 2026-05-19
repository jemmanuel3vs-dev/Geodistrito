async function initDashboard() {
  const dashboardRoot = document.getElementById('dashboardRoot');
  if (!dashboardRoot) {
    return;
  }

  initCharts();

  const refreshButton = document.getElementById('btnRefreshDashboard');
  if (refreshButton) {
    refreshButton.addEventListener('click', updateDashboardData);
  }

  await updateDashboardData();
  setInterval(updateDashboardData, 30000);
}

function gatherDashboardFilters() {
  const type = document.getElementById('filterType')?.value || 'all';
  const distrito = document.getElementById('filterDistrict')?.value.trim();
  const seccion = document.getElementById('filterSection')?.value.trim();
  const municipio = document.getElementById('filterMunicipio')?.value.trim();
  const encargado = document.getElementById('filterEncargado')?.value.trim();

  const filters = {};
  if (type && type !== 'all') filters.tipo = type;
  if (distrito) filters.distrito = distrito;
  if (seccion) filters.seccion = seccion;
  if (municipio) filters.municipio = municipio;
  if (encargado) filters.encargado = encargado;
  return filters;
}

async function updateDashboardData() {
  try {
    const filters = gatherDashboardFilters();
    const [overview, byDistrict, byType, byMunicipality, activityByDate] = await Promise.all([
      fetchDashboardStats(filters),
      fetchStatsByDistrict(filters),
      fetchStatsByType(filters),
      fetchStatsByMunicipality(filters),
      fetchActivityByDate(30, filters)
    ]);

    renderDashboardCards(overview);
    updateCharts({
      byDistrict,
      byType,
      byMunicipality,
      activityByDate
    });
    updateDashboardTimestamp();
  } catch (error) {
    console.error(error);
    showError('No se pudieron cargar las estadísticas del dashboard');
  }
}

function renderDashboardCards(overview) {
  document.getElementById('kpiTotalPoints').textContent = overview.total_puntos || 0;
  document.getElementById('kpiDistricts').textContent = overview.total_distritos || 0;
  document.getElementById('kpiSections').textContent = overview.total_secciones || 0;
  document.getElementById('kpiMunicipalities').textContent = overview.total_municipios || 0;
  document.getElementById('kpiComites').textContent = overview.total_comites || 0;
  document.getElementById('kpiActiveUsers').textContent = overview.usuarios_activos || 0;
}

function updateDashboardTimestamp() {
  const timestampEl = document.getElementById('dashboardUpdated');
  if (!timestampEl) {
    return;
  }
  const now = new Date();
  timestampEl.textContent = `Última actualización: ${now.toLocaleTimeString('es-MX')}`;
}

document.addEventListener('DOMContentLoaded', async () => {
  initDashboard();
});
