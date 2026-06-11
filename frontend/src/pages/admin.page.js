import { importarExcel } from "../modules/import/import.js";
export function initAdminPage() {

    initImportModal();

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