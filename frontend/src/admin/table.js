import { isImageUrl } from '../utils/media.js';

let sortConfig = { column: null, direction: 'asc' };

function text(value) {
  return value ?? '-';
}

function appendCell(row, value) {
  const cell = document.createElement('td');
  cell.textContent = text(value);
  row.appendChild(cell);
}

function createImageCell(point) {
  const cell = document.createElement('td');

  if (!isImageUrl(point.url)) {
    cell.textContent = 'Sin imagen';
    cell.className = 'table-image-empty';
    return cell;
  }

  const image = document.createElement('img');
  image.src = point.url;
  image.alt = `Imagen del punto ${point.id}`;
  image.className = 'table-thumbnail';
  image.loading = 'lazy';

  cell.appendChild(image);
  return cell;
}

function createActionButton(label, action, id, className) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.dataset.action = action;
  button.dataset.id = id;
  button.className = className;
  return button;
}

function createActionsCell(point) {
  const cell = document.createElement('td');
  const actions = document.createElement('div');
  actions.className = 'table-action-buttons';

  actions.append(
    createActionButton('Ver', 'view', point.id, 'btn-view'),
    createActionButton('Editar', 'edit', point.id, 'btn-edit'),
    createActionButton('Eliminar', 'delete', point.id, 'btn-delete')
  );

  cell.appendChild(actions);
  return cell;
}

function createPointRow(point) {
  const row = document.createElement('tr');

  row.dataset.id = point.id;

  appendCell(row, point.id);
  appendCell(row, point.tipo);
  appendCell(row, point.distrito);
  appendCell(row, point.seccion);
  appendCell(row, point.colonia);
  appendCell(row, point.calle);
  appendCell(row, point.encargado);
  appendCell(row, point.municipio);
  row.appendChild(createImageCell(point));
  row.appendChild(createActionsCell(point));

  return row;
}

function renderEmptyRow(message) {
  const body = document.getElementById('pointsBody');
  if (!body) return;

  body.innerHTML = '';
  const row = document.createElement('tr');
  const cell = document.createElement('td');
  cell.colSpan = 10;
  cell.className = 'table-empty';
  cell.textContent = message;
  row.appendChild(cell);
  body.appendChild(row);
}

export function renderTableLoading() {
  renderEmptyRow('Cargando registros...');
  const status = document.getElementById('pointsStatus');
  if (status) status.textContent = 'Cargando información...';
}

/* =========================
   SORTING UTILITIES
========================= */

function getSortValue(point, column) {
  const value = point[column];
  if (value === null || value === undefined) return '';
  return String(value).toLowerCase();
}

function sortPoints(points, column, direction) {
  if (!column) return points;

  return [...points].sort((a, b) => {
    const valA = getSortValue(a, column);
    const valB = getSortValue(b, column);

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

function updateSortIndicators(sortedColumn, direction) {
  document.querySelectorAll('.sort-header').forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
    if (th.dataset.sort === sortedColumn) {
      th.classList.add(`sort-${direction}`);
    }
  });
}

export function renderPointsTable({ rows, total, page, totalPages }) {
  const body = document.getElementById('pointsBody');
  const status = document.getElementById('pointsStatus');

  if (!body) return;

  body.innerHTML = '';

  if (!total) {
    renderEmptyRow('No existen registros.');
    renderPagination(page, totalPages);
    if (status) status.textContent = '0 registros encontrados';
    return;
  }

  const fragment = document.createDocumentFragment();

  rows.forEach(point => {
    fragment.appendChild(
      createPointRow(point)
    );
  });

  body.appendChild(fragment);

  if (status) status.textContent = `${total} registros encontrados`;

  renderPagination(page, totalPages);
}

export function renderPagination(page, totalPages) {
  const pagination = document.getElementById('pointsPagination');
  if (!pagination) return;

  pagination.innerHTML = '';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.textContent = 'Anterior';
  prev.dataset.pageAction = 'prev';
  prev.disabled = page <= 1;

  const next = document.createElement('button');
  next.type = 'button';
  next.textContent = 'Siguiente';
  next.dataset.pageAction = 'next';
  next.disabled = page >= totalPages;

  const label = document.createElement('span');
  label.textContent = `Página ${page} de ${totalPages}`;

  pagination.append(prev, label, next);
}

/* =========================
   SORTING — BIND SORT HEADERS
========================= */

const SORT_COLUMNS = ['id', 'tipo', 'distrito', 'seccion', 'colonia', 'calle', 'encargado', 'municipio'];

function onSortClick(column, callback) {
  if (sortConfig.column === column) {
    sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
  } else {
    sortConfig.column = column;
    sortConfig.direction = 'asc';
  }

  updateSortIndicators(column, sortConfig.direction);
  callback(sortConfig);
}

export function bindSortHeaders(onSort) {
  const headers = document.querySelectorAll('thead th');

  headers.forEach((th, index) => {
    const column = SORT_COLUMNS[index];
    if (!column) return;

    th.dataset.sort = column;
    th.classList.add('sort-header');
    th.style.cursor = 'pointer';
    th.title = `Ordenar por ${th.textContent}`;

    th.addEventListener('click', () => onSortClick(column, onSort));
  });
}

export function applySorting(points, config = sortConfig) {
  if (!config.column) return points;
  return sortPoints(points, config.column, config.direction);
}

export function updatePointRow(point) {
  const row =
    document.querySelector(
      `#pointsBody tr[data-id="${point.id}"]`
    );

  if (!row) {
    return false;
  }

  row.replaceWith(
    createPointRow(point)
  );

  return true;
}

export function resetSort() {
  sortConfig = { column: null, direction: 'asc' };
  updateSortIndicators(null, 'asc');
}

/* =========================
   EVENT BINDING
========================= */

export function bindTableEvents(handlers) {
  const body = document.getElementById('pointsBody');
  body?.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;
    handlers[action]?.(id);
  });
}

export function bindPaginationEvents(onChangePage) {
  const pagination = document.getElementById('pointsPagination');
  pagination?.addEventListener('click', event => {
    const button = event.target.closest('button[data-page-action]');
    if (!button || button.disabled) return;
    onChangePage(button.dataset.pageAction);
  });
}
