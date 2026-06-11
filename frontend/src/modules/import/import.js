import { uploadExcel } from "../../services/import.service.js";

export async function importarExcel() {

    const input = document.getElementById("excelFile");

    if (!input.files.length) {
        alert("Selecciona un archivo.");
        return;
    }

    const formData = new FormData();
    formData.append("excel", input.files[0]);

    try {

        const response = await uploadExcel(formData);

        if (!response.ok) {

            const texto = await response.text();

            console.error("Respuesta del servidor:", texto);

            throw new Error(texto);

        }

        const data = await response.json();

        console.log("Respuesta del servidor:", data);

        alert(data.message);

        document.getElementById("excelModal").style.display = "none";

    } catch (e) {

        console.error("ERROR:", e);

        alert(e.message);

    }

}