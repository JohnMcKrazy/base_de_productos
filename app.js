import { db } from "./db.js";

const $d = document;
const selector = (tag, target = $d) => target.querySelector(`${tag}`);
const selectorAll = (tag, target = $d) => target.querySelectorAll(`${tag}`);
const ref = (ref) => selector(`[selector-ref='${ref}']`);

const pageBody = selector("BODY");

const select = ref("select");
const optionTemplate = ref("option_template").content;
const cardTemplate = ref("card_template").content;
const editorialLista = ref("editorial_cards_container");
const codelLista = ref("code_cards_container");

const video = ref("video");
const resultContainer = ref("scan_result");
const light = "light";
const dark = "dark";
const themeBtn = ref("theme");
const changeTheme = () => {
    let current = pageBody.getAttribute("color-scheme");
    if (current === dark) {
        pageBody.setAttribute("color-scheme", light);
    } else {
        pageBody.setAttribute("color-scheme", dark);
    }
};
const deleteChildElements = (parentElement) => {
    let child = parentElement.lastElementChild;
    while (child) {
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }
};
/* themeBtn.addEventListener("click", changeTheme); */
const sanitizeInput = (inputValue) => {
    const div = document.createElement("div");
    div.textContent = inputValue;
    return div.innerHTML;
};
const crearItem = (tipo, item, edicion = "null") => {
    console.log(tipo, item);

    const newCard = cardTemplate.cloneNode(true);
    const card = selector(`[selector-ref="card"]`, newCard);
    const cardTitle = selector(`[selector-ref="title"]`, newCard);

    const cardSubtitle = selector(`[selector-ref="subtitle"]`, newCard);
    cardTitle.textContent = item.nombre;
    cardSubtitle.textContent = item.subtitle;

    if (edicion) {
        const descripcion = document.createElement("span");
        const id = document.createElement("span");
        descripcion.textContent = edicion.descripcion;
        id.textContent = edicion.id;
        card.append(descripcion);
        card.append(id);
    }
    return newCard;
};
const startActions = (action) => {
    if (action === "start") {
        selectorAll('[container-ref="ui"]').forEach((container) => {
            container.setAttribute("visibility", "hidde");
        });
        ref("start_container").setAttribute("visibility", "show");
    } else {
        ref("start_container").setAttribute("visibility", "hidde");
        ref(`${action}_container`).setAttribute("visibility", "show");
    }
};
selector('[scan-ref="code"]').addEventListener("click", () => {
    startActions("code");
});

selector("[btn-action='search_code']").addEventListener("click", () => {
    const currentSearch = sanitizeInput(selector("[input-name='code']").value);
    console.log("search code " + currentSearch);
    deleteChildElements(codelLista);
    db.editoriales.forEach((editorial) => {
        editorial.items.forEach((item) => {
            item.ediciones.forEach((edicion) => {
                if (edicion.codigo === currentSearch) {
                    let newCard = crearItem("edicion", item, edicion);
                    codelLista.append(newCard);
                }
            });
        });
    });
});
selector('[scan-ref="manual"]').addEventListener("click", () => {
    startActions("manual");

    console.log(db);
    // Crear las opciones dinámicamente desde db.editoriales

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
        deleteChildElements(editorialLista);
        renderEditorial(editorial);
    });

    const content = ref("content");
    const editorialTitle = selector("[content-text='editorial']");
    const renderEditorial = (editorial) => {
        editorialTitle.textContent = "";

        if (!editorial) {
            editorialTitle.textContent = "Selecciona una editorial para ver sus títulos.";
            return;
        }

        editorialTitle.textContent = `Editorial: ${editorial.nombre}`;
        console.log(editorial.items);

        editorial.items.forEach((item) => {
            let newCard = crearItem("editorial", item);
            editorialLista.appendChild(newCard);
        });
    };
});
selector('[scan-ref="scanner"]').addEventListener("click", () => {
    startActions("scanner");

    resultContainer.textContent = "📷 Escaneando...";
    try {
        const onScanSuccess = (decodedText, decodedResult) => {
            // handle the scanned code as you like, for example:

            editorialTitle.innerHTML = decodedText;
            ref("scanner_container").setAttribute("visibility", "hidde");

            console.log(`Code matched = ${decodedText}`, decodedResult);
            db.editoriales.forEach((editorial) => {
                editorial.items.forEach((item) => {
                    item.ediciones.forEach((edicion) => {
                        if (edicion.codigo === decodedText) {
                            crearItem("item", item);
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

        let codeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
        codeScanner.render(onScanSuccess, onScanFailure);
    } catch (error) {
        resultContainer.textContent = "❌ Error al acceder a la cámara.";
        console.error(error);
    }
});

selectorAll(`[selector-ref='back_to_start']`).forEach((btn) =>
    btn.addEventListener("click", () => {
        startActions("start");
    })
);
