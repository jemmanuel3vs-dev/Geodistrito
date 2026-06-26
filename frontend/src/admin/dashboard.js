const TYPE_KEYS = [
  'bardas',
  'lonas',
  'comites',
  'casillas'
];

const DISTRICT_KEYS = ['20', '21', '22', '23', '24'];

const TYPE_LABELS = {
  bardas: 'Bardas',
  lonas: 'Lonas',
  comites: 'Comités',
  casillas: 'Casillas'
};

const TYPE_COLORS = ['#22c55e', '#f59e0b', '#a78bfa', '#fb7185'];

const DISTRICT_COLORS = ['#38bdf8', '#22c55e', '#f59e0b', '#a78bfa', '#fb7185'];

const KPI_MAP = {
  bardas: 'kpiBardas',
  lonas: 'kpiLonas',
  comites: 'kpiComites',
  casillas: 'kpiCasillas'
};

const charts = {
  type: null,
  district: null,
  distribution: null,
  horizontalDistrict: null,
  timeline: null
};

function toNumber(value) {
  return Number(value) || 0;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function formatPercent(value, total) {
  if (!total) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

function isValidValue(value) {
  if (value === null || value === undefined) return false;
  const str = String(value).trim().toLowerCase();
  return str && str !== 'null' && str !== 'none' && str !== 'not available' && str !== '-';
}

function normalizeDashboard(stats = {}) {
  const tipos = stats.tipos || {};
  const distritos = stats.distritos || {};

  return {
    total: toNumber(stats.total),
    tipos: TYPE_KEYS.reduce((result, key) => {
      result[key] = toNumber(tipos[key]);
      return result;
    }, {}),
    distritos: DISTRICT_KEYS.reduce((result, key) => {
      result[key] = toNumber(distritos[key]);
      return result;
    }, {})
  };
}

function calculateStatsFromPoints(points) {
  const total = points.length;

  const tipos = TYPE_KEYS.reduce((acc, key) => {
    acc[key] = points.filter(p => normalize(p.tipo) === key).length;
    return acc;
  }, {});

  const distritos = DISTRICT_KEYS.reduce((acc, key) => {
    acc[key] = points.filter(p => {
      const d = normalize(p.distrito);
      return d === key || d === `distrito ${key}`;
    }).length;
    return acc;
  }, {});

  return { total, tipos, distritos };
}

function normalize(value) {
  return String(value ?? '').trim().toLowerCase();
}

function getSectionStats(points) {
  const counts = {};
  points.forEach(p => {
    if (!isValidValue(p.seccion)) return;
    const sec = String(p.seccion).trim();
    counts[sec] = (counts[sec] || 0) + 1;
  });
  const total = points.filter(p => isValidValue(p.seccion)).length;
  return Object.entries(counts)
    .map(([seccion, cantidad]) => ({
      seccion,
      cantidad,
      porcentaje: formatPercent(cantidad, total)
    }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10);
}

function getNeighborhoodStats(points) {
  const counts = {};
  points.forEach(p => {
    if (!isValidValue(p.colonia)) return;
    const nbh = String(p.colonia).trim();
    counts[nbh] = (counts[nbh] || 0) + 1;
  });
  const total = points.filter(p => isValidValue(p.colonia)).length;
  return Object.entries(counts)
    .map(([colonia, cantidad]) => ({
      colonia,
      cantidad,
      porcentaje: formatPercent(cantidad, total)
    }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10);
}

function getMunicipioStats(points) {
  const counts = {};
  points.forEach(p => {
    if (!isValidValue(p.municipio)) return;
    const mpo = String(p.municipio).trim();
    counts[mpo] = (counts[mpo] || 0) + 1;
  });
  const total = points.filter(p => isValidValue(p.municipio)).length;
  return Object.entries(counts)
    .map(([municipio, cantidad]) => ({
      municipio,
      cantidad,
      porcentaje: formatPercent(cantidad, total)
    }))
    .sort((a, b) => b.cantidad - a.cantidad);
}

function getManagerStats(points) {
  const counts = {};
  points.forEach(p => {
    if (!isValidValue(p.encargado)) return;
    const mgr = String(p.encargado).trim();
    counts[mgr] = (counts[mgr] || 0) + 1;
  });
  const total = points.filter(p => isValidValue(p.encargado)).length;
  return Object.entries(counts)
    .map(([encargado, cantidad]) => ({
      encargado,
      cantidad,
      porcentaje: formatPercent(cantidad, total)
    }))
    .sort((a, b) => b.cantidad - a.cantidad);
}

function getRecentActivity(points) {
  return [...points]
    .sort((a, b) => {
      const dateA = new Date(a.created_at || a.updated_at || 0);
      const dateB = new Date(b.created_at || b.updated_at || 0);
      return dateB - dateA;
    })
    .slice(0, 10)
    .map(p => ({
      date: p.created_at || p.updated_at || '-',
      tipo: p.tipo || '-',
      distrito: p.distrito || '-',
      seccion: p.seccion || '-',
      colonia: p.colonia || '-'
    }));
}

function getChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#f8fafc' }
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(148,163,184,0.12)' }
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#94a3b8', precision: 0 },
        grid: { color: 'rgba(148,163,184,0.12)' }
      }
    }
  };
}

function renderTypeChart(data) {
  const canvas = document.getElementById('chartByType');

  if (!canvas || typeof Chart === 'undefined') return;

  if (charts.type) {
    charts.type.destroy();
    charts.type = null;
  }

  charts.type = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: TYPE_KEYS.map(key => TYPE_LABELS[key]),
      datasets: [{
        label: 'Puntos',
        data: TYPE_KEYS.map(key => data.tipos[key]),
        backgroundColor: TYPE_COLORS,
        borderRadius: 8
      }]
    },
    options: getChartOptions()
  });
}

function renderDistrictChart(data) {
  const canvas = document.getElementById('chartByDistrict');

  if (!canvas || typeof Chart === 'undefined') return;

  if (charts.district) {
    charts.district.destroy();
    charts.district = null;
  }

  charts.district = new Chart(canvas, {
    type: 'pie',
    data: {
      labels: DISTRICT_KEYS.map(key => `Distrito ${key}`),
      datasets: [{
        data: DISTRICT_KEYS.map(key => data.distritos[key]),
        backgroundColor: DISTRICT_COLORS,
        borderColor: '#0f172a',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#f8fafc' }
        }
      }
    }
  });
}

function renderDistrictCards(data) {
  const sortedDistricts = [...DISTRICT_KEYS].sort((a, b) => data.distritos[b] - data.distritos[a]);
  sortedDistricts.forEach(key => {
    const total = data.distritos[key];
    setText(`district${key}Total`, total);
    setText(`district${key}Percent`, formatPercent(total, data.total));
  });
}

function renderDistributionDonut(data) {
  const canvas = document.getElementById('chartDistribution');
  if (!canvas || typeof Chart === 'undefined') return;

  if (charts.distribution) {
    charts.distribution.destroy();
    charts.distribution = null;
  }

  const labels = TYPE_KEYS.map(key => TYPE_LABELS[key]);
  const values = TYPE_KEYS.map(key => data.tipos[key]);

  charts.distribution = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: TYPE_COLORS,
        borderColor: '#0f172a',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#f8fafc', padding: 16 }
        }
      }
    }
  });
}

function renderHorizontalDistrictChart(data) {
  const canvas = document.getElementById('chartHorizontalDistricts');
  if (!canvas || typeof Chart === 'undefined') return;

  if (charts.horizontalDistrict) {
    charts.horizontalDistrict.destroy();
    charts.horizontalDistrict = null;
  }

  const sorted = [...DISTRICT_KEYS].sort((a, b) => data.distritos[b] - data.distritos[a]);
  const labels = sorted.map(key => `Distrito ${key}`);
  const values = sorted.map(key => data.distritos[key]);

  charts.horizontalDistrict = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Puntos',
        data: values,
        backgroundColor: sorted.map(key => DISTRICT_COLORS[DISTRICT_KEYS.indexOf(key)]),
        borderRadius: 6
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { color: '#94a3b8', precision: 0 },
          grid: { color: 'rgba(148,163,184,0.12)' }
        },
        y: {
          ticks: { color: '#94a3b8' },
          grid: { display: false }
        }
      }
    }
  });
}

function renderTimelineChart(points) {
  const canvas = document.getElementById('chartActivityTimeline');
  if (!canvas || typeof Chart === 'undefined') return;

  if (charts.timeline) {
    charts.timeline.destroy();
    charts.timeline = null;
  }

  const activity = getRecentActivity(points);

  charts.timeline = new Chart(canvas, {
    type: 'line',
    data: {
      labels: activity.map(a => {
        const d = new Date(a.date);
        return isNaN(d.getTime()) ? a.date : d.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
      }),
      datasets: [{
        label: 'Actividad',
        data: activity.map(a => TYPE_KEYS.indexOf(normalize(a.tipo)) + 1 || 0),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.2)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(148,163,184,0.12)' }
        },
        y: {
          min: 0,
          max: TYPE_KEYS.length + 0.5,
          ticks: {
            color: '#94a3b8',
            callback: v => TYPE_LABELS[TYPE_KEYS[v - 1]] || ''
          },
          grid: { color: 'rgba(148,163,184,0.12)' }
        }
      }
    }
  });
}

function renderSectionsTable(points) {
  const tbody = document.getElementById('sectionsTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  const stats = getSectionStats(points);
  const total = points.filter(p => isValidValue(p.seccion)).length;

  if (!stats.length) {
    tbody.innerHTML = '<tr><td colspan="3" class="table-empty">No hay datos disponibles</td></tr>';
    return;
  }

  const fragment = document.createDocumentFragment();
  stats.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${item.seccion}</td><td>${item.cantidad}</td><td>${item.porcentaje}</td>`;
    fragment.appendChild(tr);
  });
  tbody.appendChild(fragment);
}

function renderNeighborhoodsTable(points) {
  const tbody = document.getElementById('neighborhoodsTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  const stats = getNeighborhoodStats(points);

  if (!stats.length) {
    tbody.innerHTML = '<tr><td colspan="3" class="table-empty">No hay datos disponibles</td></tr>';
    return;
  }

  const fragment = document.createDocumentFragment();
  stats.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${item.colonia}</td><td>${item.cantidad}</td><td>${item.porcentaje}</td>`;
    fragment.appendChild(tr);
  });
  tbody.appendChild(fragment);
}

function renderMunicipioTable(points) {
  const tbody = document.getElementById('municipioTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  const stats = getMunicipioStats(points);

  if (!stats.length) {
    tbody.innerHTML = '<tr><td colspan="3" class="table-empty">No hay datos disponibles</td></tr>';
    return;
  }

  const fragment = document.createDocumentFragment();
  stats.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${item.municipio}</td><td>${item.cantidad}</td><td>${item.porcentaje}</td>`;
    fragment.appendChild(tr);
  });
  tbody.appendChild(fragment);
}

function renderManagersTable(points) {
  const tbody = document.getElementById('managersTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  const stats = getManagerStats(points);

  if (!stats.length) {
    tbody.innerHTML = '<tr><td colspan="3" class="table-empty">No hay datos disponibles</td></tr>';
    return;
  }

  const fragment = document.createDocumentFragment();
  stats.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${item.encargado}</td><td>${item.cantidad}</td><td>${item.porcentaje}</td>`;
    fragment.appendChild(tr);
  });
  tbody.appendChild(fragment);
}

function renderActivityTable(points) {
  const tbody = document.getElementById('activityTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  const activity = getRecentActivity(points);

  if (!activity.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="table-empty">No hay actividad reciente</td></tr>';
    return;
  }

  const fragment = document.createDocumentFragment();
  activity.forEach(item => {
    const tr = document.createElement('tr');
    const date = new Date(item.date);
    const dateStr = isNaN(date.getTime()) ? item.date : date.toLocaleDateString('es-MX');
    tr.innerHTML = `
      <td>${dateStr}</td>
      <td>${item.tipo}</td>
      <td>${item.distrito}</td>
      <td>${item.seccion}</td>
      <td>${item.colonia}</td>
    `;
    fragment.appendChild(tr);
  });
  tbody.appendChild(fragment);
}

function showDashboardSkeleton(show) {
  const cards = document.querySelectorAll('.kpi-card, .district-card, .chart-card, .stat-table-card');
  cards.forEach(card => {
    if (show) {
      card.classList.add('skeleton-loading');
    } else {
      card.classList.remove('skeleton-loading');
    }
  });
}

export function renderAdminDashboard(stats, points = []) {
  const data = normalizeDashboard(stats);

  setText('kpiTotalPoints', data.total);

  Object.entries(KPI_MAP).forEach(([key, elementId]) => {
    setText(elementId, data.tipos[key]);
  });

  renderDistrictCards(data);
  renderTypeChart(data);
  renderDistrictChart(data);
  renderDistributionDonut(data);
  renderHorizontalDistrictChart(data);
  renderTimelineChart(points);

  renderSectionsTable(points);
  renderNeighborhoodsTable(points);
  renderMunicipioTable(points);
  renderManagersTable(points);
  renderActivityTable(points);

  setText('dashboardUpdated', `Última actualización: ${new Date().toLocaleString('es-MX')}`);
}

export function updateDashboardFromPoints(points) {
  const data = calculateStatsFromPoints(points);

  setText('kpiTotalPoints', data.total);

  Object.entries(KPI_MAP).forEach(([key, elementId]) => {
    setText(elementId, data.tipos[key]);
  });

  renderDistrictCards(data);
  renderTypeChart(data);
  renderDistrictChart(data);
  renderDistributionDonut(data);
  renderHorizontalDistrictChart(data);
  renderTimelineChart(points);

  renderSectionsTable(points);
  renderNeighborhoodsTable(points);
  renderMunicipioTable(points);
  renderManagersTable(points);
  renderActivityTable(points);

  setText('dashboardUpdated', `Última actualización: ${new Date().toLocaleString('es-MX')}`);
}

export { showDashboardSkeleton };
