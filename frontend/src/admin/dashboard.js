const TYPE_KEYS = [
  'bardas',
  'lonas',
  'comites',
  'casillas'
];

const DISTRICT_KEYS = [
  '20',
  '21',
  '22',
  '23',
  '24'
];

const TYPE_LABELS = {
  bardas: 'Bardas',
  lonas: 'Lonas',
  comites: 'Comités',
  casillas: 'Casillas'
};

const TYPE_COLORS = [
  '#22c55e',
  '#f59e0b',
  '#a78bfa',
  '#fb7185'
];

const DISTRICT_COLORS = [
  '#38bdf8',
  '#22c55e',
  '#f59e0b',
  '#a78bfa',
  '#fb7185'
];

const KPI_MAP = {
  bardas: 'kpiBardas',
  lonas: 'kpiLonas',
  comites: 'kpiComites',
  casillas: 'kpiCasillas'
};

const charts = {
  type: null,
  district: null
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
  DISTRICT_KEYS.forEach(key => {
    const total = data.distritos[key];
    setText(`district${key}Total`, total);
    setText(`district${key}Percent`, formatPercent(total, data.total));
  });
}

export function renderAdminDashboard(stats) {
  const data = normalizeDashboard(stats);

  setText('kpiTotalPoints', data.total);

  // Render each type KPI using the correct element IDs
  Object.entries(KPI_MAP).forEach(([key, elementId]) => {
    setText(elementId, data.tipos[key]);
  });

  renderDistrictCards(data);
  renderTypeChart(data);
  renderDistrictChart(data);

  setText('dashboardUpdated', `Última actualización: ${new Date().toLocaleString('es-MX')}`);
}
