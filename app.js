import { db } from "./db.js";

const $d = document;
const selector = (tag, target = $d) => target.querySelector(`${tag}`);
const selectorAll = (tag, target = $d) => target.querySelectorAll(`${tag}`);
const ref = (ref) => selector(`[selector-ref='${ref}']`);

const pageBody = selector("BODY");

const select = ref("select");
const optionTemplate = ref("option_template").content;
const cardTemplate = ref("card_template").content;
const lista = ref("cards_container");

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
themeBtn.addEventListener("click", changeTheme);
const crearItem = (tipo, item) => {
    console.log(tipo, item);

    const newCard = cardTemplate.cloneNode(true);
    const card = selector(`[selector-ref="card"]`, newCard);
    const cardTitle = selector(`[selector-ref="title"]`, newCard);

    const cardSubtitle = selector(`[selector-ref="subtitle"]`, newCard);
    cardTitle.textContent = item.nombre;
    switch (tipo) {
        case "editorial":
            cardSubtitle.textContent = item.subtitle;
    }

    return newCard;
};
selector('[scan-ref="manual"]').addEventListener("click", () => {
    ref("start_content").setAttribute("visibility", "hidde");
    ref("manual_container").setAttribute("visibility", "show");
    const deleteChildElements = (parentElement) => {
        let child = parentElement.lastElementChild;
        while (child) {
            parentElement.removeChild(child);
            child = parentElement.lastElementChild;
        }
    };

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
        deleteChildElements(lista);
        renderEditorial(editorial);
    });
    const content = ref("content");
    const contentText = ref("content_text");
    const renderEditorial = (editorial) => {
        contentText.textContent = "";

        if (!editorial) {
            contentText.textContent = "Selecciona una editorial para ver sus títulos.";
            return;
        }

        contentText.textContent = `Editorial: ${editorial.nombre}`;
        console.log(editorial.items);

        editorial.items.forEach((item) => {
            let newCard = crearItem("editorial", item);
            lista.appendChild(newCard);
        });
    };
});
selector('[scan-ref="scanner"]').addEventListener("click", () => {
    ref("start_content").setAttribute("visibility", "hidde");
    ref("scanner_container").setAttribute("visibility", "show");

    resultContainer.textContent = "📷 Escaneando...";
    try {
        const onScanSuccess = (decodedText, decodedResult) => {
            // handle the scanned code as you like, for example:

            contentText.innerHTML = `<p>${decodedText}</p>`;
            scannerContainer.style.display = "none";
            console.log(`Code matched = ${decodedText}`, decodedResult);
            db.editoriales.forEach((editorial) => {
                editorial.items.forEach((titulo) => {
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

        let html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    } catch (error) {
        resultContainer.textContent = "❌ Error al acceder a la cámara.";
        console.error(error);
    }
});
/* 





let html5QrcodeScanner = false;
const scannerContainer = selector("[selector-ref='scanner_container']");
db.editoriales.forEach((editorial) => {
    editorial.items.forEach((tituloItem) => {
        crearCarta(tituloItem);
    });
});
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
                    editorial.items.forEach((titulo) => {
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

            html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
            html5QrcodeScanner.render(onScanSuccess, onScanFailure);
        } catch (error) {
            resultContainer.textContent = "❌ Error al acceder a la cámara.";
            console.error(error);
        }
    }, 3000);
});
 */
