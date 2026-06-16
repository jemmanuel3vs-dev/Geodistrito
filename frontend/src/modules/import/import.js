import { uploadExcel } from "../../services/import.service.js";
import { showError, showSuccess } from "../../ui/toast.js";

export async function importarExcel({ onSuccess } = {}) {
    const input = document.getElementById("excelFile");

    if (!input.files.length) {
        showError("Selecciona un archivo.");
        return;
    }

    const formData = new FormData();
    formData.append("excel", input.files[0]);

    try {
        const data = await uploadExcel(formData);

        showSuccess(data.message || "Importación completada");

        document.getElementById("excelModal").style.display = "none";
        input.value = "";
        document.getElementById("selectedFile").textContent = "Ningún archivo seleccionado";

        await onSuccess?.(data);
    } catch (e) {
        showError(e.message || "Error al importar");
    }
}
