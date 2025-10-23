import { db } from "./db.js";
const API = "https://docs.google.com/spreadsheets/d/168CbH6UqvhrdAsS0D0bRrqMDU2NVlL58NuaB2AU2r5Y/edit";

const $d = document;
const selector = (tag, target = $d) => target.querySelector(`${tag}`);
const selectorAll = (tag, target = $d) => target.querySelectorAll(`${tag}`);
const ref = (ref) => selector(`[selector-ref='${ref}']`);
const template = (template) => selector(`[template-ref='${template}']`);

const pageBody = selector("BODY");

const select = ref("select");
const optionTemplate = template("option").content;
const cardTemplate = template("card").content;
const editionContentTemplate = template("edition_content").content;
const editorialContentTemplate = template("editorial_content").content;
const itemBadgeTemplate = template("item_badge").content;
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
const noImgLink = "https://img.freepik.com/vector-premium/vector-icono-imagen-predeterminado-pagina-imagen-faltante-diseno-sitio-web-o-aplicacion-movil-no-hay-foto-disponible_87543-11093.jpg";
const editionBadgeTemplate = template("edicion_badge").content;
const createItemBagde = (item) => {
    const newItemClone = itemBadgeTemplate.cloneNode(true);
    const newItem = selector(`[selector-ref="item_badge"]`, newItemClone);
    const code = selector(`[selector-ref="code"]`, newItemClone);
    const edicion = selector(`[selector-ref="edition"]`, newItemClone);
    const img = selector(`[selector-ref="img"]`, newItemClone);
    console.log(item);
    code.textContent = item.code;
    edicion.textContent = item.edicion;
    if (item.imagen === "" || item.imagen === undefined) {
        img.setAttribute("src", noImgLink);
    } else {
        img.setAttribute("src", item.imagen);
    }
    return newItem;
};
const templateItemBadge = template("item_badge").content;
const crearItem = (tipo, item, edicion = "null") => {
    console.log(tipo, item);

    const newCard = cardTemplate.cloneNode(true);
    const card = selector(`[selector-ref="card"]`, newCard);
    const cardTitle = selector(`[selector-ref="title"]`, newCard);
    cardTitle.textContent = item.nombre;

    if (tipo === "edicion") {
        const newEditionClone = editionContentTemplate.cloneNode(true);
        const newEdition = selector(`[selector-ref="edition_content"]`, newEditionClone);
        const editionDescription = selector(`[selector-ref="description"]`, newEditionClone);
        const editionCode = selector(`[selector-ref="code"]`, newEditionClone);
        const edition = selector(`[selector-ref="edition"]`, newEditionClone);
        const editionImg = selector(`[selector-ref="img"]`, newEditionClone);
        if (edicion.imagen === "" || edicion.imagen === undefined) {
            editionImg.setAttribute("src", noImgLink);
        } else {
            editionImg.setAttribute("src", edicion.imagen);
        }

        editionDescription.textContent = edicion.descripcion;
        edition.textContent = edicion.edicion;
        editionCode.textContent = edicion.codigo;
        console.log(newEdition);
        card.appendChild(newEdition);
    } else if (tipo === "editorial") {
        const newEditorialClone = editorialContentTemplate.cloneNode(true);
        const newEditorial = selector(`[selector-ref="editorial_content"]`, newEditorialClone);

        item.ediciones.forEach((edicion) => {
            console.log(item);
            let thisItem = createItemBagde(edicion);
            newEditorial.appendChild(thisItem);
        });
        card.appendChild(newEditorial);
    }
    return card;
};
const inputCode = selector("[input-name='code']");
const scannerConfig = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    formatsToSupport: [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.RSS_14,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.CODE_93,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.RSS_EXPANDED,
    ],
};
const html5QrCode = new Html5Qrcode("reader");

const startActions = (action) => {
    if (action === "start") {
        selectorAll('[container-ref="ui"]').forEach((container) => {
            if (container.getAttribute("visibility") === "show") {
                const ref = container.getAttribute("container-name");
                container.setAttribute("visibility", "hidde");
                if (ref === "scanner") {
                    html5QrCode.stop();
                }
            }
            inputCode.value = "";
            deleteChildElements(codelLista);
            deleteChildElements(editorialLista);
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
const createTitle = (title) => {
    const newTitle = document.createElement("h1");
    newTitle.textContent = title;
    return newTitle;
};
selector("[btn-action='search_code']").addEventListener("click", () => {
    const currentSearch = sanitizeInput(inputCode.value);
    console.log("search code " + currentSearch);
    deleteChildElements(codelLista);
    let newCard;
    if (currentSearch !== "") {
        db.editoriales.forEach((editorial) => {
            editorial.items.forEach((item) => {
                item.ediciones.forEach((edicion) => {
                    if (edicion.codigo === currentSearch) {
                        newCard = crearItem("edicion", item, edicion);
                    }
                });
            });
        });
        console.log(newCard + " no esta vacio el input");
        if (newCard === "" || newCard === undefined) {
            newCard = createTitle("No se cuenta con ese producto en el inventario");
            console.log(newCard + " el new card esta vacio");
        }
    } else {
        newCard = createTitle("No se cuenta con ese producto en el inventario");
        console.log(newCard + " esta vacio el input");
    }

    console.log(newCard);
    codelLista.appendChild(newCard);
});
const setOptions = () => {
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
    db.editoriales.forEach((editorial) => {
        const newOption = optionTemplate.cloneNode(true);
        const option = selector(`[selector-ref="option"]`, newOption);
        option.value = editorial.nombre;
        option.textContent = editorial.nombre;
        select.appendChild(newOption);
    });

    // Evento al cambiar selección
    select.addEventListener("change", (e) => {
        const selectedTag = e.target.value;
        const editorial = db.editoriales.find((ed) => ed.nombre === selectedTag);
        console.log(editorial);
        deleteChildElements(editorialLista);
        renderEditorial(editorial);
    });
};
setOptions();
selector('[scan-ref="manual"]').addEventListener("click", () => {
    startActions("manual");
});
const onScanSuccess = (decodedText, decodedResult) => {
    console.log(decodedText);

    let itemSearched;
    ref("scan_code").textContent = `${decodedText}`;
    console.log(`Code matched = ${decodedText}`, decodedResult);
    db.editoriales.forEach((editorial) => {
        editorial.items.forEach((item) => {
            item.ediciones.forEach((edicion) => {
                if (edicion.codigo === decodedText.toString()) {
                    itemSearched = crearItem("edicion", item, edicion);
                }
            });
        });
    });
    deleteChildElements(resultContainer);
    html5QrCode.stop();
    resultContainer.appendChild(itemSearched);
};
const startScanner = () => {
    deleteChildElements(resultContainer);
    html5QrCode.start({ facingMode: "environment" }, scannerConfig, onScanSuccess);
};
ref("start_scanner").addEventListener("click", startScanner);

selector('[scan-ref="scanner"]').addEventListener("click", () => {
    startActions("scanner");
    startScanner();
    /* codeScanner.render(onScanSuccess, onScanFailure); */
});

selectorAll(`[selector-ref='back_to_start']`).forEach((btn) =>
    btn.addEventListener("click", () => {
        startActions("start");
    })
);
selector(`[selector-ref='tema']`).addEventListener("click", changeTheme);
