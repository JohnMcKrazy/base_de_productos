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

const video = selector("video");
const startScanBtn = selector("start_scan");
const resultContainer = selector("scan_result");
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

// Evento al cambiar selección
select.addEventListener("change", (e) => {
    const selectedTag = e.target.value;
    const editorial = db.editoriales.find((ed) => ed.tag === selectedTag);
    deleteChildElements(lista);
    renderEditorial(editorial);
});
const content = selector('[selector-ref="content"]');
const renderEditorial = (editorial) => {
    content.innerHTML = "";

    if (!editorial) {
        content.innerHTML = "<p>Selecciona una editorial para ver sus títulos.</p>";
        return;
    }

    const titulo = document.createElement("h2");
    titulo.textContent = `Editorial: ${editorial.nombre}`;
    content.appendChild(titulo);
    console.log(editorial.titulos);

    editorial.titulos.forEach((tituloItem) => {
        crearCarta(tituloItem);
    });
};

const onScanSuccess = (decodedText, decodedResult) => {
    // handle the scanned code as you like, for example:
    content.innerHTML = `<p>${decodedText}</p>`;
    console.log(`Code matched = ${decodedText}`, decodedResult);
};

const onScanFailure = (error) => {
    // handle scan failure, usually better to ignore and keep scanning.
    // for example:
    console.warn(`Code scan error = ${error}`);
};

let html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, /* verbose= */ false);
html5QrcodeScanner.render(onScanSuccess, onScanFailure);

const fileinput = document.getElementById("qr-input-file");
fileinput.addEventListener("change", (e) => {
    if (e.target.files.length == 0) {
        // No file selected, ignore
        return;
    }

    const imageFile = e.target.files[0];
    // Scan QR Code
    html5QrCode
        .scanFile(imageFile, true)
        .then((decodedText) => {
            // success, use decodedText
            console.log(decodedText);
        })
        .catch((err) => {
            // failure, handle it.
            console.log(`Error scanning file. Reason: ${err}`);
        });
});
