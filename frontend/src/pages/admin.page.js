import { renderAdminDashboard } from "../admin/dashboard.js";
import {
    clearAdminFilters,
    filterAdminPoints,
    getAdminFilters,
    paginateAdminPoints,
    preparePointForAdmin
} from "../admin/filters.js";
import { initEditPointModal, openEditPointModal } from "../admin/modal.edit.js";
import {
    applySorting,
    bindPaginationEvents,
    bindSortHeaders,
    bindTableEvents,
    renderPointsTable,
    renderTableLoading,
    resetSort,
    updatePointRow
} from "../admin/table.js";
import { eventBus, EVENTS } from "../core/events.js";
import { importarExcel } from "../modules/import/import.js";
import { getDashboardStats } from "../services/dashboard.service.js";
import { deleteAllPoints, deletePoint, getAllPoints, getPointById, updatePoint } from "../services/points.service.js";
import { showError, showInfo, showSuccess } from "../ui/toast.js";

import {
   isAuthenticated,
   getUser,
   isAdmin
} from '../services/auth.service.js';

import {
  initHeader
} from '../components/header.js';

const adminState = {
    points: [],
    filteredPoints: [],
    currentPage: 1,
    currentSort: { column: null, direction: 'asc' },
    map: null,
    tempMarker: null
};

export async function initAdminPage() {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  const user = getUser();
  if (!user || !isAdmin()) {
    window.location.href = 'index.html';
    return;
  }

  initHeader();

  initImportModal();
  initAdminMap();
  initEditPointModal({ onSave: handleSavePoint });
  initDeleteConfirmModal();
  initDeleteAllConfirmModal();
  bindAdminEvents();
  reloadAdminData();
}

function reloadAdminData() {
    loadAdminDashboard();
    loadAdminPoints();
}

async function loadAdminDashboard() {
    try {
        const stats = await getDashboardStats();
        renderAdminDashboard(stats);
    } catch (error) {
        showError(error.message || "No se pudo cargar el dashboard");
    }
}

async function loadAdminPoints() {
    try {
        renderTableLoading();

        const points = await getAllPoints();
        const pointList = Array.isArray(points) ? points : [];

        adminState.points = pointList.map(preparePointForAdmin);

        if (!adminState.points.length) {
            adminState.currentPage = 1;
        }

        applyAdminFilters();
    } catch (error) {
        console.error(error);
        showError(error.message || "No se pudieron cargar los puntos");
        renderPointsTable({ rows: [], total: 0, page: 1, totalPages: 1 });
    }
}

function bindAdminEvents() {
    const applyFilters = debounce(() => {
        adminState.currentPage = 1;
        applyAdminFilters();
    }, 120);

    document.getElementById("adminSearch")?.addEventListener("input", applyFilters);
    document.getElementById("filterType")?.addEventListener("change", applyFilters);
    document.getElementById("filterDistrict")?.addEventListener("input", applyFilters);
    document.getElementById("filterSection")?.addEventListener("input", applyFilters);
    document.getElementById("filterColonia")?.addEventListener("input", applyFilters);
    document.getElementById("filterMunicipio")?.addEventListener("input", applyFilters);
    document.getElementById("filterEncargado")?.addEventListener("input", applyFilters);

    document.getElementById("btnApplyFilters")?.addEventListener("click", () => {
        adminState.currentPage = 1;
        applyAdminFilters();
    });

    document.getElementById("btnClearFilters")?.addEventListener("click", () => {
        clearAdminFilters();
        adminState.currentPage = 1;
        adminState.currentSort = { column: null, direction: 'asc' };
        resetSort();
        applyAdminFilters();
    });

    document.getElementById("btnRefreshDashboard")?.addEventListener("click", reloadAdminData);

    const dangerSection = document.getElementById("adminDangerSection");
    if (dangerSection) {
        dangerSection.hidden = !isAdmin();
    }

    document.getElementById("btnDeleteAllPoints")?.addEventListener("click", () => {
        if (!isAdmin()) {
            showError("No autorizado");
            return;
        }
        openDeleteAllConfirm();
    });

    document.getElementById("btnExportExcel")?.addEventListener("click", exportToExcel);
    document.getElementById("btnExportCsv")?.addEventListener("click", exportToCsv);
    document.getElementById("btnExportGeoJson")?.addEventListener("click", exportToGeoJson);

    bindTableEvents({
        view: handleViewPoint,
        edit: handleEditPoint,
        delete: handleDeletePoint
    });

    bindPaginationEvents(action => {
        adminState.currentPage += action === "next" ? 1 : -1;
        applyAdminFilters();
    });

    bindSortHeaders(sortConfig => {
        adminState.currentSort = sortConfig;
        applyAdminFilters();
    });

    eventBus.on(EVENTS.POINT_SAVED, () => {
        reloadAdminData();
    });
}

function applyAdminFilters() {
    const filters = getAdminFilters();

    adminState.filteredPoints = filterAdminPoints(adminState.points, filters);

    const sorted = applySorting(adminState.filteredPoints, adminState.currentSort);

    const pagination = paginateAdminPoints(sorted, adminState.currentPage);

    adminState.currentPage = pagination.page;

    renderPointsTable({
        rows: pagination.rows,
        total: adminState.filteredPoints.length,
        page: pagination.page,
        totalPages: pagination.totalPages
    });
}

function exportToExcel() {
    if (!adminState.filteredPoints.length) {
        showError("No hay datos para exportar");
        return;
    }

    if (typeof XLSX === 'undefined') {
        showError("Librería XLSX no disponible");
        return;
    }

    const data = adminState.filteredPoints.map((p, i) => ({
        '#': i + 1,
        ID: p.id,
        Tipo: p.tipo,
        Distrito: p.distrito,
        Sección: p.seccion,
        Colonia: p.colonia,
        Calle: p.calle,
        Encargado: p.encargado,
        Municipio: p.municipio,
        URL: p.url,
        Latitud: p.lat,
        Longitud: p.lng
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Puntos');
    XLSX.writeFile(wb, `geodistrito_puntos_${new Date().toISOString().slice(0, 10)}.xlsx`);

    showSuccess(`Exportados ${data.length} registros a Excel`);
}

function exportToCsv() {
    if (!adminState.filteredPoints.length) {
        showError("No hay datos para exportar");
        return;
    }

    const headers = '#,ID,Tipo,Distrito,Sección,Colonia,Calle,Encargado,Municipio,URL,Latitud,Longitud';
    const rows = adminState.filteredPoints.map((p, i) =>
        [i + 1, p.id, p.tipo, p.distrito, p.seccion, p.colonia, p.calle, p.encargado, p.municipio, p.url, p.lat, p.lng]
            .map(v => `"${v ?? ''}"`).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `geodistrito_puntos_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    showSuccess(`Exportados ${rows.length} registros a CSV`);
}

function exportToGeoJson() {
    if (!adminState.filteredPoints.length) {
        showError("No hay datos para exportar");
        return;
    }

    const features = adminState.filteredPoints
        .filter(p => p.lat && p.lng)
        .map(p => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [parseFloat(p.lng), parseFloat(p.lat)]
            },
            properties: {
                id: p.id,
                tipo: p.tipo,
                distrito: p.distrito,
                seccion: p.seccion,
                colonia: p.colonia,
                calle: p.calle,
                encargado: p.encargado,
                municipio: p.municipio,
                url: p.url
            }
        }));

    const geojson = {
        type: 'FeatureCollection',
        features
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `geodistrito_puntos_${new Date().toISOString().slice(0, 10)}.geojson`;
    link.click();
    URL.revokeObjectURL(link.href);

    showSuccess(`Exportados ${features.length} puntos a GeoJSON`);
}

async function handleEditPoint(id) {
    try {
        const point = await getPointById(id);
        openEditPointModal(point);
    } catch (error) {
        showError(error.message || "No se pudo cargar el punto");
    }
}

async function handleSavePoint(id, payload) {
    const updated = await updatePoint(id, payload);
    const updatedPoint = preparePointForAdmin(updated);
    const filters = getAdminFilters();
    const previousPoint = adminState.points.find(point => Number(point.id) === Number(id));

    adminState.points = adminState.points.map(point => {
        if (Number(point.id) !== Number(id)) return point;
        return updatedPoint;
    });

    loadAdminDashboard();

    const stayedVisible =
        previousPoint &&
        !adminState.currentSort.column &&
        filterAdminPoints([previousPoint], filters).length === 1 &&
        filterAdminPoints([updatedPoint], filters).length === 1 &&
        updatePointRow(updatedPoint);

    if (!stayedVisible) {
        applyAdminFilters();
    } else {
        adminState.filteredPoints = adminState.filteredPoints.map(point =>
            Number(point.id) === Number(id)
                ? updatedPoint
                : point
        );
    }

    showSuccess("Punto actualizado correctamente");
}

let deleteConfirmCallback = null;

function initDeleteConfirmModal() {
    const modal = document.createElement('div');
    modal.id = 'deleteConfirmModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-card delete-modal-card">
            <h3>¿Deseas eliminar este punto?</h3>
            <p class="delete-modal-copy">Esta acción no se puede deshacer.</p>
            <div class="modal-actions delete-modal-actions">
                <button type="button" class="btn-secondary-outline" data-cancel-delete>Cancelar</button>
                <button type="button" class="btn-danger" data-confirm-delete>Eliminar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('[data-cancel-delete]').addEventListener('click', closeDeleteConfirm);
    modal.addEventListener('click', event => {
        if (event.target === modal) closeDeleteConfirm();
    });
    modal.querySelector('[data-confirm-delete]').addEventListener('click', () => {
        closeDeleteConfirm();
        if (deleteConfirmCallback) deleteConfirmCallback();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeDeleteConfirm();
    });
}

function openDeleteConfirm(onConfirm) {
    const modal = document.getElementById('deleteConfirmModal');
    if (!modal) return;
    deleteConfirmCallback = onConfirm;
    modal.classList.add('open');
}

function closeDeleteConfirm() {
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) modal.classList.remove('open');
    deleteConfirmCallback = null;
}

async function handleDeletePoint(id) {
    openDeleteConfirm(async () => {
        try {
            await deletePoint(id);
            adminState.points = adminState.points.filter(item => Number(item.id) !== Number(id));
            loadAdminDashboard();
            applyAdminFilters();
            showSuccess("Punto eliminado correctamente");
        } catch (error) {
            showError(error.message || "No se pudo eliminar el punto");
        }
    });
}


let deleteAllStep = 'intro';
let isDeletingAll = false;

function initDeleteAllConfirmModal() {
    const modal = document.createElement('div');
    modal.id = 'deleteAllConfirmModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-card delete-modal-card">
            <h3>¿Deseas eliminar TODOS los registros?</h3>
            <p class="delete-modal-copy">Esta acción eliminará todos los puntos registrados y no se puede deshacer.</p>
            <div id="deleteAllSecondStep" hidden>
                <label for="deleteAllPhrase">Escribe: <strong>ELIMINAR TODO</strong></label>
                <input id="deleteAllPhrase" class="danger-confirm-input" type="text" autocomplete="off">
            </div>
            <div class="modal-actions delete-modal-actions">
                <button type="button" class="btn-secondary-outline" data-cancel-delete-all>Cancelar</button>
                <button type="button" class="btn-danger" data-confirm-delete-all>Eliminar</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('[data-cancel-delete-all]').addEventListener('click', closeDeleteAllConfirm);
    modal.addEventListener('click', event => {
        if (event.target === modal) closeDeleteAllConfirm();
    });
    modal.querySelector('[data-confirm-delete-all]').addEventListener('click', handleDeleteAllConfirmStep);

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeDeleteAllConfirm();
    });
}

function openDeleteAllConfirm() {
    const modal = document.getElementById('deleteAllConfirmModal');
    const secondStep = document.getElementById('deleteAllSecondStep');
    const input = document.getElementById('deleteAllPhrase');
    const confirmButton = modal?.querySelector('[data-confirm-delete-all]');

    if (!modal) return;

    deleteAllStep = 'intro';
    isDeletingAll = false;

    if (secondStep) secondStep.hidden = true;
    if (input) input.value = '';
    if (confirmButton) {
        confirmButton.disabled = false;
        confirmButton.textContent = 'Eliminar';
    }

    modal.classList.add('open');
}

function closeDeleteAllConfirm() {
    const modal = document.getElementById('deleteAllConfirmModal');
    if (modal) modal.classList.remove('open');
    deleteAllStep = 'intro';
    isDeletingAll = false;
}

async function handleDeleteAllConfirmStep() {
    const modal = document.getElementById('deleteAllConfirmModal');
    const secondStep = document.getElementById('deleteAllSecondStep');
    const input = document.getElementById('deleteAllPhrase');
    const confirmButton = modal?.querySelector('[data-confirm-delete-all]');

    if (deleteAllStep === 'intro') {
        deleteAllStep = 'phrase';
        if (secondStep) secondStep.hidden = false;
        if (confirmButton) confirmButton.textContent = 'Eliminar definitivamente';
        input?.focus();
        return;
    }

    if (input?.value !== 'ELIMINAR TODO') {
        showError('Debes escribir ELIMINAR TODO exactamente');
        input?.focus();
        return;
    }

    if (isDeletingAll) return;

    try {
        isDeletingAll = true;
        if (confirmButton) {
            confirmButton.disabled = true;
            confirmButton.textContent = 'Eliminando...';
        }

        const totalBeforeDelete = adminState.points.length;
        const response = await deleteAllPoints();
        const deleted = Number(response.deleted ?? totalBeforeDelete) || 0;

        adminState.points = [];
        adminState.filteredPoints = [];
        adminState.currentPage = 1;

        closeDeleteAllConfirm();
        loadAdminDashboard();
        applyAdminFilters();
        showSuccess(`Se eliminaron ${deleted} registros.`);
    } catch (error) {
        showError(error.message || 'No se pudieron eliminar los registros');
    } finally {
        isDeletingAll = false;
        if (confirmButton) {
            confirmButton.disabled = false;
            confirmButton.textContent = 'Eliminar definitivamente';
        }
    }
}
function handleViewPoint(id) {
    const point = adminState.points.find(p => Number(p.id) === Number(id));
    if (!point) {
        showError("Punto no encontrado");
        return;
    }

    const lat = Number(point.lat);
    const lng = Number(point.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
        showError("El punto no tiene coordenadas válidas");
        return;
    }

    const map = initAdminMap();
    if (!map) {
        showError("No se pudo inicializar el mapa");
        return;
    }

    map.setView([lat, lng], 16);
    if (adminState.tempMarker) {
        map.removeLayer(adminState.tempMarker);
    }
    adminState.tempMarker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(createPointPopup(point))
        .openPopup();

    document.getElementById("adminMap")?.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    showInfo("Punto ubicado en el mapa");
}

function initAdminMap() {
    if (adminState.map) return adminState.map;
    const container = document.getElementById("adminMap");
    if (!container || typeof L === "undefined") return null;

    adminState.map = L.map(container).setView([23.2494, -106.4111], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap"
    }).addTo(adminState.map);

    setTimeout(() => adminState.map.invalidateSize(), 0);
    return adminState.map;
}

function createPointPopup(point) {
    const esc = (value) => {
        const div = document.createElement("div");
        div.textContent = value ?? "-";
        return div.innerHTML;
    };
    return `
        <div class="popup-card">
            <h3>${esc(point.tipo)}</h3>
            <p><strong>Distrito:</strong> ${esc(point.distrito)}</p>
            <p><strong>Sección:</strong> ${esc(point.seccion)}</p>
            <p><strong>Colonia:</strong> ${esc(point.colonia)}</p>
            <p><strong>Calle:</strong> ${esc(point.calle)}</p>
        </div>
    `;
}

function debounce(fn, delay) {
    let timer = null;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

function initImportModal() {
    const modal = document.getElementById("excelModal");
    if (!modal) return;

    document.getElementById("btnImportExcel")?.addEventListener("click", () => {
        modal.style.display = "block";
    });

    document.getElementById("closeExcelModal")?.addEventListener("click", () => {
        modal.style.display = "none";
    });

    document.getElementById("cancelImport")?.addEventListener("click", () => {
        modal.style.display = "none";
    });

    document.getElementById("excelFile")?.addEventListener("change", e => {
        document.getElementById("selectedFile").textContent =
            e.target.files[0]?.name || "Ningún archivo seleccionado";
    });

    document.getElementById("confirmImport")?.addEventListener("click", () =>
        importarExcel({ onSuccess: () => reloadAdminData() })
    );

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
}


