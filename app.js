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
const cardTemplate = selector('[selector-ref="card-template"]').content;
const lista = selector('[selector-ref="cards-container"]');

const video = selector("video");
const startScanBtn = selector("start-scan");
const resultContainer = selector("scan-result");
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
const renderEditorial = (editorial) => {
    const content = selector('[selector-ref="content"]');
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
