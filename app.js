import { db } from "./db.js";

const $d = document;
const selector = (tag, target = $d) => target.querySelector(`${tag}`);
const selectorAll = (tag, target = $d) => target.querySelectorAll(`${tag}`);

const deleteChildElements = (parentElement) => {
    let child = parentElement.lastElementChild;
    while (child) {
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }
};

const select = selector('[selector-ref="select"]');
const optionTemplate = selector('[selector-ref="option_template"]').content;
const cardTemplate = selector('[selector-ref="card_template"]').content;
const lista = selector('[selector-ref="cards_container"]');

const video = selector("[selector-ref='video']");
const startScanBtn = selector("[selector-ref='start_scan']");
const resultContainer = selector("[selector-ref='scan_result']");
/* if (!select || !optionTemplate) return; */
console.log(db);
// Crear las opciones dinámicamente desde db.editoriales
const crearCarta = (titulo) => {
    console.log(titulo);
    const newCard = cardTemplate.cloneNode(true);
    const card = selector(`[selector-ref="card"]`, newCard);
    const cardTitle = selector(`[selector-ref="title"]`, newCard);
    cardTitle.textContent = titulo.nombre;
    lista.appendChild(card);
};
db.editoriales.forEach((editorial) => {
    const newOption = optionTemplate.cloneNode(true);
    const option = selector(`[selector-ref="option"]`, newOption);
    option.value = editorial.tag;
    option.textContent = editorial.nombre;
    select.appendChild(newOption);
});
let html5QrcodeScanner = false;
const scannerContainer = selector("[selector-ref='scanner_container']");

startScanBtn.addEventListener("click", () => {
    resultContainer.textContent = "📷 Escaneando...";
    setTimeout(() => {
        try {
            const onScanSuccess = (decodedText, decodedResult) => {
                // handle the scanned code as you like, for example:

                contentText.innerHTML = `<p>${decodedText}</p>`;
                scannerContainer.style.display = "none";
                console.log(`Code matched = ${decodedText}`, decodedResult);
                db.editoriales.forEach((editorial) => {
                    editorial.titulos.forEach((titulo) => {
                        titulo.ediciones.forEach((edicion) => {
                            if (edicion.codigo === decodedText) {
                                html5QrCode
                                    .stop()
                                    .then((ignore) => {
                                        // QR Code scanning is stopped.
                                    })
                                    .catch((err) => {
                                        // Stop failed, handle it.
                                    });
                            }
                        });
                    });
                });
            };

            const onScanFailure = (error) => {
                // handle scan failure, usually better to ignore and keep scanning.
                // for example:
                console.warn(`Code scan error = ${error}`);
            };

            html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, /* verbose= */ false);
            html5QrcodeScanner.render(onScanSuccess, onScanFailure);
        } catch (error) {
            resultContainer.textContent = "❌ Error al acceder a la cámara.";
            console.error(error);
        }
    }, 3000);
});
// Evento al cambiar selección
select.addEventListener("change", (e) => {
    const selectedTag = e.target.value;
    const editorial = db.editoriales.find((ed) => ed.tag === selectedTag);
    deleteChildElements(lista);
    renderEditorial(editorial);
});
const contentText = selector('[selector-ref="content_text"]');
const content = selector('[selector-ref="content"]');
const renderEditorial = (editorial) => {
    contentText.innerHTML = "";

    if (!editorial) {
        contentText.innerHTML = "Selecciona una editorial para ver sus títulos.";
        return;
    }

    const titulo = document.createElement("h2");
    titulo.textContent = `Editorial: ${editorial.nombre}`;
    contentText.appendChild(titulo);
    console.log(editorial.titulos);

    editorial.titulos.forEach((tituloItem) => {
        crearCarta(tituloItem);
    });
};
