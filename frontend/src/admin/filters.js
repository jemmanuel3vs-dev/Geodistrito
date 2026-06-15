const SEARCH_FIELDS = [
  'tipo',
  'colonia',
  'calle',
  'encargado'
];

export const PAGE_SIZE = 20;

function normalize(value) {

  return String(value ?? '')
    .trim()
    .toLowerCase();

}

export function preparePointForAdmin(point) {

  const searchIndex =
    SEARCH_FIELDS
      .map(field => normalize(point[field]))
      .join(' ');

  return {
    ...point,
    __searchIndex: searchIndex
  };

}

export function filterAdminPoints(
  points,
  filters
) {

  const search = normalize(filters.search);
  const tipo = normalize(filters.tipo);
  const distrito = normalize(filters.distrito);

  return points.filter(point => {

    const matchesSearch =
      !search ||
      point.__searchIndex.includes(search);

    const matchesTipo =
      !tipo ||
      tipo === 'all' ||
      normalize(point.tipo) === tipo;

    const matchesDistrito =
      !distrito ||
      normalize(point.distrito) === distrito;

    return (
      matchesSearch &&
      matchesTipo &&
      matchesDistrito
    );

  });

}

export function paginateAdminPoints(
  points,
  page,
  pageSize = PAGE_SIZE
) {

  const totalPages =
    Math.max(
      1,
      Math.ceil(points.length / pageSize)
    );

  const safePage =
    Math.min(
      Math.max(page, 1),
      totalPages
    );

  const start =
    (safePage - 1) * pageSize;

  return {
    page: safePage,
    totalPages,
    rows: points.slice(
      start,
      start + pageSize
    )
  };

}

export function getAdminFilters() {

  return {
    search:
      document.getElementById('adminSearch')
        ?.value || '',
    tipo:
      document.getElementById('filterType')
        ?.value || 'all',
    distrito:
      document.getElementById('filterDistrict')
        ?.value || ''
  };

}

export function clearAdminFilters() {

  const search =
    document.getElementById('adminSearch');

  const type =
    document.getElementById('filterType');

  const district =
    document.getElementById('filterDistrict');

  if (search) {
    search.value = '';
  }

  if (type) {
    type.value = 'all';
  }

  if (district) {
    district.value = '';
  }

}
