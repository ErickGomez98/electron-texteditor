const { ipcRenderer, remote } = require('electron')


document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('realizar-busqueda')
    const cancelhButton = document.getElementById('cancelar-busqueda')
    const searchInput = document.getElementById('buscar')
    const mayusMinus = document.getElementById('checkbox-mayus-minus')
    let curretEditorText = ''
    let searchIndexOffset = 0

    const handleCancelSearch = () => {
        ipcRenderer.send('cancel-search-box');
        remote.getCurrentWindow().close()
    }

    const handleEnterKey = (e) => {
        if (e.key === 'Enter')
            searchButton.click()
    }

    /**
     * 
     * @param {stirng} texto Texto completo en donde buscar una palabra
     * @param {string} coincidencia Palabra a buscar en texto
     * @param {int} inicio Indice en caso de que se requiera empezar a buscar en otra posición
     * @param {boolean} mayus Indica si se deben de ingnorar las mayusculas y minusculas
     */
    const search = (texto, coincidencia, inicio, mayus) => {
        let coincidenciaL = coincidencia.length
        let textoL = texto.length

        if (coincidenciaL <= 0 || textoL <= 0)
            return -1

        let salto, offset = inicio || 0
        let scan = 0
        let ultimo = coincidenciaL - 1
        let skip = {}

        if (!mayus) {
            coincidencia = coincidencia.toUpperCase()
            texto = texto.toUpperCase()
        }

        /*
            Generar la tabla para saltar posiciones.
            Ejemplo, palabra "ayuda" generaría la tabla:
            {
                a: 4,
                y: 3,
                u: 2,
                d: 1
            }

            donde la key es la letra y el valor es la cantidad de saltos que se pueden dar.
        */
        for (scan = 0; scan < ultimo; scan++) {
            skip[coincidencia[scan]] = ultimo - scan
        }

        while (textoL >= coincidenciaL) {
            for (scan = ultimo; texto[offset + scan] === coincidencia[scan]; scan--) {
                if (scan === 0) { return offset }
            }
            salto = skip[texto[offset + ultimo]]
            salto = salto != null ? salto : coincidenciaL
            textoL -= salto
            offset += salto
        }

        return -1
    }

    const handleSearchClick = () => {
        const mayusCheckbox = mayusMinus.checked;
        const needle = searchInput.value;
        const index = search(curretEditorText, needle, searchIndexOffset, mayusCheckbox);

        if (index == -1) {
            remote.dialog.showErrorBox("Error", `No se encontró "${needle}"`)
        } else {
            searchIndexOffset = index + needle.length;
            ipcRenderer.send('search-found-event', { index, searchL: needle.length })
        }
    }

    cancelhButton.addEventListener('click', handleCancelSearch)

    searchInput.addEventListener('keydown', handleEnterKey)

    searchButton.addEventListener('click', handleSearchClick)



    ipcRenderer.on('receive-editor-text', (e, text) => {
        curretEditorText = text
    })


})