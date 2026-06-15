function text(value) {

  return value ?? '-';

}

function formatDate(value) {

  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString(
    'es-MX',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }
  );

}

function appendCell(row, value) {

  const cell =
    document.createElement('td');

  cell.textContent =
    text(value);

  row.appendChild(cell);

}

function createActionButton(
  label,
  action,
  id,
  className
) {

  const button =
    document.createElement('button');

  button.type = 'button';
  button.textContent = label;
  button.dataset.action = action;
  button.dataset.id = id;
  button.className = className;

  return button;

}

function createActionsCell(point) {

  const cell =
    document.createElement('td');

  const actions =
    document.createElement('div');

  actions.className =
    'table-action-buttons';

  actions.append(
    createActionButton(
      'Ver',
      'view',
      point.id,
      'btn-view'
    ),
    createActionButton(
      'Editar',
      'edit',
      point.id,
      'btn-edit'
    ),
    createActionButton(
      'Eliminar',
      'delete',
      point.id,
      'btn-delete'
    )
  );

  cell.appendChild(actions);

  return cell;

}

function renderEmptyRow(message) {

  const body =
    document.getElementById('pointsBody');

  if (!body) {
    return;
  }

  body.innerHTML = '';

  const row =
    document.createElement('tr');

  const cell =
    document.createElement('td');

  cell.colSpan = 10;
  cell.className = 'table-empty';
  cell.textContent = message;

  row.appendChild(cell);
  body.appendChild(row);

}

export function renderTableLoading() {

  renderEmptyRow('Cargando registros...');

  const status =
    document.getElementById('pointsStatus');

  if (status) {
    status.textContent =
      'Cargando información...';
  }

}

export function renderPointsTable({
  rows,
  total,
  page,
  totalPages
}) {

  const body =
    document.getElementById('pointsBody');

  const status =
    document.getElementById('pointsStatus');

  if (!body) {
    return;
  }

  body.innerHTML = '';

  if (!total) {
    renderEmptyRow('No existen registros.');
    renderPagination(page, totalPages);

    if (status) {
      status.textContent =
        '0 registros encontrados';
    }

    return;
  }

  const fragment =
    document.createDocumentFragment();

  rows.forEach(point => {

    const row =
      document.createElement('tr');

    appendCell(row, point.id);
    appendCell(row, point.tipo);
    appendCell(row, point.distrito);
    appendCell(row, point.seccion);
    appendCell(row, point.municipio);
    appendCell(row, point.colonia);
    appendCell(row, point.calle);
    appendCell(row, point.encargado);
    appendCell(row, formatDate(point.created_at));
    row.appendChild(createActionsCell(point));

    fragment.appendChild(row);

  });

  body.appendChild(fragment);

  if (status) {
    status.textContent =
      `${total} registros encontrados`;
  }

  renderPagination(
    page,
    totalPages
  );

}

export function renderPagination(
  page,
  totalPages
) {

  const pagination =
    document.getElementById('pointsPagination');

  if (!pagination) {
    return;
  }

  pagination.innerHTML = '';

  const prev =
    document.createElement('button');

  prev.type = 'button';
  prev.textContent = 'Anterior';
  prev.dataset.pageAction = 'prev';
  prev.disabled = page <= 1;

  const next =
    document.createElement('button');

  next.type = 'button';
  next.textContent = 'Siguiente';
  next.dataset.pageAction = 'next';
  next.disabled = page >= totalPages;

  const label =
    document.createElement('span');

  label.textContent =
    `Página ${page} de ${totalPages}`;

  pagination.append(
    prev,
    label,
    next
  );

}

export function bindTableEvents(handlers) {

  const body =
    document.getElementById('pointsBody');

  body?.addEventListener('click', event => {

    const button =
      event.target.closest('button[data-action]');

    if (!button) {
      return;
    }

    const id =
      Number(button.dataset.id);

    const action =
      button.dataset.action;

    handlers[action]?.(id);

  });

}

export function bindPaginationEvents(onChangePage) {

  const pagination =
    document.getElementById('pointsPagination');

  pagination?.addEventListener('click', event => {

    const button =
      event.target.closest('button[data-page-action]');

    if (!button || button.disabled) {
      return;
    }

    onChangePage(button.dataset.pageAction);

  });

}
