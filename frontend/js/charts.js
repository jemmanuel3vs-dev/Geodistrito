const chartState = {
  districtChart: null,
  typeChart: null,
  activityChart: null,
  municipalityChart: null
};

function initCharts() {
  if (!document.getElementById('chartByDistrict')) {
    return;
  }

  chartState.districtChart = createBarChart(
    'chartByDistrict',
    [],
    [],
    'Puntos por distrito'
  );

  chartState.typeChart = createPieChart(
    'chartByType',
    [],
    []
  );

  chartState.activityChart = createLineChart(
    'chartActivity',
    [],
    []
  );

  chartState.municipalityChart = createHorizontalBarChart(
    'chartByMunicipality',
    [],
    []
  );
}

function updateCharts({ byDistrict, byType, byMunicipality, activityByDate }) {
  if (chartState.districtChart) {
    updateChart(chartState.districtChart, {
      labels: byDistrict.map(item => item.distrito || 'Sin distrito'),
      data: byDistrict.map(item => Number(item.cantidad) || 0),
      label: 'Puntos'
    });
  }

  if (chartState.typeChart) {
    updateChart(chartState.typeChart, {
      labels: byType.map(item => item.tipo || 'Otro'),
      data: byType.map(item => Number(item.cantidad) || 0)
    });
  }

  if (chartState.activityChart) {
    updateChart(chartState.activityChart, {
      labels: activityByDate.map(item => formatDateLabel(item.date)),
      data: activityByDate.map(item => Number(item.count) || 0),
      label: 'Registros'
    });
  }

  if (chartState.municipalityChart) {
    updateChart(chartState.municipalityChart, {
      labels: byMunicipality.map(item => item.municipio || 'Sin municipio'),
      data: byMunicipality.map(item => Number(item.cantidad) || 0),
      label: 'Puntos'
    });
  }
}

function createChartContext(id) {
  const element = document.getElementById(id);
  if (!element) {
    return null;
  }
  return element.getContext('2d');
}

function createBarChart(id, labels, data, title) {
  const context = createChartContext(id);
  if (!context) return null;

  return new Chart(context, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: title,
        data,
        backgroundColor: 'rgba(56, 189, 248, 0.8)',
        borderColor: 'rgba(56, 189, 248, 1)',
        borderWidth: 1,
        borderRadius: 12,
        maxBarThickness: 30
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: tooltipItem => `${tooltipItem.formattedValue} puntos`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#cbd5e1' },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#cbd5e1' },
          grid: { color: 'rgba(148, 163, 184, 0.15)' }
        }
      }
    }
  });
}

function createHorizontalBarChart(id, labels, data, title) {
  const context = createChartContext(id);
  if (!context) return null;

  return new Chart(context, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: title,
        data,
        backgroundColor: 'rgba(34, 197, 94, 0.85)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
        borderRadius: 12
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
          ticks: { color: '#cbd5e1' },
          grid: { color: 'rgba(148, 163, 184, 0.15)' }
        },
        y: {
          ticks: { color: '#cbd5e1' },
          grid: { display: false }
        }
      }
    }
  });
}

function createPieChart(id, labels, data) {
  const context = createChartContext(id);
  if (!context) return null;

  return new Chart(context, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          '#38bdf8',
          '#f59e0b',
          '#22c55e',
          '#ec4899',
          '#6366f1'
        ],
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
          labels: { color: '#cbd5e1' }
        }
      }
    }
  });
}

function createLineChart(id, labels, data) {
  const context = createChartContext(id);
  if (!context) return null;

  return new Chart(context, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Registros diarios',
        data,
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        pointBackgroundColor: '#fff',
        pointBorderColor: '#a855f7',
        tension: 0.35,
        fill: true,
        borderWidth: 3
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
          ticks: { color: '#cbd5e1' },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#cbd5e1' },
          grid: { color: 'rgba(148, 163, 184, 0.15)' }
        }
      }
    }
  });
}

function updateChart(chart, { labels, data, label }) {
  if (!chart) return;
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  if (label) {
    chart.data.datasets[0].label = label;
  }
  chart.update();
}

function formatDateLabel(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  } catch (error) {
    return dateString;
  }
}
