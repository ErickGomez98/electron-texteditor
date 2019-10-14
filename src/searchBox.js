const { ipcRenderer, remote } = require('electron')


document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('realizar-busqueda')
    const cancelhButton = document.getElementById('cancelar-busqueda')
    const searchInput = document.getElementById('buscar')
    const mayusMinus = document.getElementById('checkbox-mayus-minus')
    let curretEditorText = ''

    const handleCancelSearch = () => {
        remote.getCurrentWindow().close()
    }

    const handleEnterKey = (e) => {
        if (e.key === 'Enter')
            searchButton.click()
    }

    const badCharList = (string, size) => {
        let badChar = [];
        for (let i = 0; i < 256; i++) {
            badChar[i] = -1;
        }

        for (let i = 0; i < size; i++) {
            badChar[+string[i]] = i;
            console.log(+string[i])
        }

        console.log(badChar);
        return badChar;
    }

    const search = (text, s) => {
        const m = s.length;
        const n = text.length;

        const badChar = badCharList(s, m)
    }

    const handleSearchClick = () => {
        const mayusCheckbox = mayusMinus.checked;
        console.log(mayusCheckbox)
        console.log(curretEditorText)
        search(curretEditorText, 'ayuda');

    }

    cancelhButton.addEventListener('click', handleCancelSearch)

    searchInput.addEventListener('keydown', handleEnterKey)

    searchButton.addEventListener('click', handleSearchClick)



    ipcRenderer.on('receive-editor-text', (e, text) => {
        curretEditorText = text
    })
})