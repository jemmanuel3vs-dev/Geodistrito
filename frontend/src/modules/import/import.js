import { uploadExcel } from "../../services/import.service.js";

export async function importarExcel({
    onSuccess
} = {}) {

    const input = document.getElementById("excelFile");

    if (!input.files.length) {
        alert("Selecciona un archivo.");
        return;
    }

    const formData = new FormData();
    formData.append("excel", input.files[0]);

    try {

        const data = await uploadExcel(formData);

        alert(data.message);

        document.getElementById("excelModal").style.display = "none";
        input.value = "";
        document.getElementById("selectedFile").textContent =
            "Ningún archivo seleccionado";

        await onSuccess?.(data);

    } catch (e) {

        alert(e.message);

    }

}
