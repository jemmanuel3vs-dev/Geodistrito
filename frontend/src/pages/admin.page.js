import { importarExcel } from "../modules/import/import.js";
import { eventBus, EVENTS } from "../core/events.js";
import { getAllPoints, getPointById, updatePoint, deletePoint } from "../services/points.service.js";
import { getDashboardStats } from "../services/dashboard.service.js";
import {
    preparePointForAdmin,
    filterAdminPoints,
    paginateAdminPoints,
    getAdminFilters,
    clearAdminFilters
} from "../admin/filters.js";
import {
    renderTableLoading,
    renderPointsTable,
    bindTableEvents,
    bindPaginationEvents,
    bindSortHeaders,
    applySorting,
    resetSort
} from "../admin/table.js";
import { initEditPointModal, openEditPointModal } from "../admin/modal.edit.js";
import { renderAdminDashboard } from "../admin/dashboard.js";
import { showError, showSuccess, showInfo } from "../ui/toast.js";

const adminState = {
    points: [],
    filteredPoints: [],
    currentPage: 1,
    currentSort: { column: null, direction: 'asc' },
    map: null,
    tempMarker: null
};

export function initAdminPage() {
    initImportModal();
    initAdminMap();
    initEditPointModal({ onSave: handleSavePoint });
    initDeleteConfirmModal();
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
        adminState.currentPage = 1;
        adminState.currentSort = { column: null, direction: 'asc' };
        resetSort();

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

    bindTableEvents({
        view: handleViewPoint,
        edit: handleEditPoint,
        delete: handleDeletePoint
    });

    bindPaginationEvents(action => {
        adminState.currentPage += action === "next" ? 1 : -1;
        applyAdminFilters();
    });

    // Column sorting
    bindSortHeaders(sortConfig => {
        adminState.currentSort = sortConfig;
        applyAdminFilters();
    });

    eventBus.on(EVENTS.POINT_SAVED, reloadAdminData);
}

function applyAdminFilters() {
    const filters = getAdminFilters();

    adminState.filteredPoints = filterAdminPoints(adminState.points, filters);

    // Apply sorting then pagination
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

    adminState.points = adminState.points.map(point => {
        if (Number(point.id) !== Number(id)) return point;
        return preparePointForAdmin(updated);
    });

    loadAdminDashboard();
    applyAdminFilters();
    showSuccess("Punto actualizado correctamente");
}

/* =========================
   DELETE CONFIRM MODAL
========================= */

let deleteConfirmCallback = null;

function initDeleteConfirmModal() {
    const modal = document.createElement('div');
    modal.id = 'deleteConfirmModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-card" style="max-width:400px;text-align:center;">
            <h3>¿Eliminar punto?</h3>
            <p style="color:var(--text-soft);margin:16px 0;">Esta acción no se puede deshacer.</p>
            <div class="modal-actions" style="justify-content:center;">
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
    const point = adminState.points.find(p => Number(p.id) === Number(id));

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

/* =========================
   VIEW POINT ON MAP
========================= */

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
    const esc = value => {
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
        importarExcel({ onSuccess: reloadAdminData })
    );
}
