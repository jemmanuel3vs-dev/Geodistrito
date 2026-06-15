import { importarExcel } from "../modules/import/import.js";
import {
    getAllPoints,
    getPointById,
    updatePoint,
    deletePoint
} from "../services/points.service.js";
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
    bindPaginationEvents
} from "../admin/table.js";
import {
    initEditPointModal,
    openEditPointModal
} from "../admin/modal.edit.js";
import {
    renderAdminDashboard
} from "../admin/dashboard.js";
import {
    showError,
    showSuccess,
    showInfo
} from "../ui/toast.js";

const adminState = {
    points: [],
    filteredPoints: [],
    currentPage: 1,
    map: null,
    tempMarker: null
};

export function initAdminPage() {

    initImportModal();
    initAdminMap();
    initEditPointModal({
        onSave: handleSavePoint
    });
    bindAdminEvents();
    loadAdminPoints();

}

async function loadAdminPoints() {

    try {

        renderTableLoading();

        const points =
            await getAllPoints();

        const pointList =
            Array.isArray(points)
            ? points
            : [];

        adminState.points =
            pointList.map(
                preparePointForAdmin
            );

        renderAdminDashboard(
            adminState.points
        );

        adminState.currentPage = 1;

        applyAdminFilters();

    } catch (error) {

        console.error(error);

        showError(
            error.message ||
            "No se pudieron cargar los puntos"
        );

        renderPointsTable({
            rows: [],
            total: 0,
            page: 1,
            totalPages: 1
        });

    }

}

function bindAdminEvents() {

    const applyFilters = debounce(() => {
        adminState.currentPage = 1;
        applyAdminFilters();
    }, 120);

    document
        .getElementById("adminSearch")
        ?.addEventListener(
            "input",
            applyFilters
        );

    document
        .getElementById("filterType")
        ?.addEventListener(
            "change",
            applyFilters
        );

    document
        .getElementById("filterDistrict")
        ?.addEventListener(
            "input",
            applyFilters
        );

    document
        .getElementById("btnApplyFilters")
        ?.addEventListener(
            "click",
            () => {
                adminState.currentPage = 1;
                applyAdminFilters();
            }
        );

    document
        .getElementById("btnClearFilters")
        ?.addEventListener(
            "click",
            () => {
                clearAdminFilters();
                adminState.currentPage = 1;
                applyAdminFilters();
            }
        );

    document
        .getElementById("btnRefreshDashboard")
        ?.addEventListener(
            "click",
            loadAdminPoints
        );

    bindTableEvents({
        view: handleViewPoint,
        edit: handleEditPoint,
        delete: handleDeletePoint
    });

    bindPaginationEvents(action => {

        adminState.currentPage +=
            action === "next"
            ? 1
            : -1;

        applyAdminFilters();

    });

}

function applyAdminFilters() {

    const filters =
        getAdminFilters();

    adminState.filteredPoints =
        filterAdminPoints(
            adminState.points,
            filters
        );

    const pagination =
        paginateAdminPoints(
            adminState.filteredPoints,
            adminState.currentPage
        );

    adminState.currentPage =
        pagination.page;

    renderPointsTable({
        rows: pagination.rows,
        total: adminState.filteredPoints.length,
        page: pagination.page,
        totalPages: pagination.totalPages
    });

}

async function handleEditPoint(id) {

    try {

        const point =
            await getPointById(id);

        openEditPointModal(
            point
        );

    } catch (error) {

        showError(
            error.message ||
            "No se pudo cargar el punto"
        );

    }

}

async function handleSavePoint(
    id,
    payload
) {

    const updated =
        await updatePoint(
            id,
            payload
        );

    adminState.points =
        adminState.points.map(point => {

            if (Number(point.id) !== Number(id)) {
                return point;
            }

            return preparePointForAdmin(
                updated
            );

        });

    renderAdminDashboard(
        adminState.points
    );

    applyAdminFilters();

    showSuccess(
        "Punto actualizado correctamente"
    );

}

async function handleDeletePoint(id) {

    const point =
        findPoint(id);

    const accepted =
        confirm(
            `¿Eliminar el punto ${point?.tipo || id}?`
        );

    if (!accepted) {
        return;
    }

    try {

        await deletePoint(id);

        adminState.points =
            adminState.points.filter(
                item => Number(item.id) !== Number(id)
            );

        renderAdminDashboard(
            adminState.points
        );

        applyAdminFilters();

        showSuccess(
            "Punto eliminado correctamente"
        );

    } catch (error) {

        showError(
            error.message ||
            "No se pudo eliminar el punto"
        );

    }

}

function handleViewPoint(id) {

    const point =
        findPoint(id);

    if (!point) {
        showError("Punto no encontrado");
        return;
    }

    const lat =
        Number(point.lat);

    const lng =
        Number(point.lng);

    if (
        Number.isNaN(lat) ||
        Number.isNaN(lng)
    ) {
        showError("El punto no tiene coordenadas válidas");
        return;
    }

    const map =
        initAdminMap();

    if (!map) {
        showError("No se pudo inicializar el mapa");
        return;
    }

    map.setView(
        [lat, lng],
        16
    );

    if (adminState.tempMarker) {
        map.removeLayer(
            adminState.tempMarker
        );
    }

    adminState.tempMarker =
        L.marker([lat, lng])
            .addTo(map)
            .bindPopup(createPointPopup(point))
            .openPopup();

    document
        .getElementById("adminMap")
        ?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    showInfo(
        "Punto ubicado en el mapa"
    );

}

function initAdminMap() {

    if (adminState.map) {
        return adminState.map;
    }

    const container =
        document.getElementById("adminMap");

    if (!container || typeof L === "undefined") {
        return null;
    }

    adminState.map =
        L.map(container).setView(
            [23.2494, -106.4111],
            12
        );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                "&copy; OpenStreetMap"
        }
    ).addTo(adminState.map);

    setTimeout(() => {
        adminState.map.invalidateSize();
    }, 0);

    return adminState.map;

}

function findPoint(id) {

    return adminState.points.find(
        point => Number(point.id) === Number(id)
    );

}

function createPointPopup(point) {

    return `
        <div class="popup-card">
            <h3>${escapeHtml(point.tipo)}</h3>
            <p><strong>Distrito:</strong> ${escapeHtml(point.distrito)}</p>
            <p><strong>Sección:</strong> ${escapeHtml(point.seccion)}</p>
            <p><strong>Colonia:</strong> ${escapeHtml(point.colonia)}</p>
            <p><strong>Calle:</strong> ${escapeHtml(point.calle)}</p>
        </div>
    `;

}

function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "-";

    return div.innerHTML;

}

function debounce(
    fn,
    delay
) {

    let timer = null;

    return (...args) => {

        clearTimeout(timer);

        timer =
            setTimeout(
                () => fn(...args),
                delay
            );

    };

}

function initImportModal() {

    const modal =
        document.getElementById(
            "excelModal"
        );

    if (!modal) return;

    document
    .getElementById("btnImportExcel")
    ?.addEventListener(
        "click",
        () => {
            modal.style.display = "block";
        }
    );

    document
    .getElementById("closeExcelModal")
    ?.addEventListener(
        "click",
        () => {
            modal.style.display = "none";
        }
    );

    document
    .getElementById("cancelImport")
    ?.addEventListener(
        "click",
        () => {
            modal.style.display = "none";
        }
    );

    document
    .getElementById("excelFile")
    ?.addEventListener(
        "change",
        e => {

            document.getElementById(
                "selectedFile"
            ).textContent =
                e.target.files[0]?.name ||
                "Ningún archivo seleccionado";

        }
    );

    document
.getElementById("confirmImport")
?.addEventListener(
    "click",
    importarExcel
);

}
