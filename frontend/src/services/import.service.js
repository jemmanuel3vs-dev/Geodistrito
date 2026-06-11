export async function uploadExcel(formData) {

    return fetch(

        "http://localhost:3000/api/import",

        {

            method: "POST",

            body: formData

        }

    );

}