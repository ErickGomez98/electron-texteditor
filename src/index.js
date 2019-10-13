const { ipcRenderer } = require('electron')

document.addEventListener('DOMContentLoaded', () => {
    const mainEditor = document.getElementById('mainTextEditor')
    let docTitle = document.title;
    let curretText = '';
    // Guarda el nombre del archivo una vez se guarde el archivo
    let fileSavedAs = false;


    const handleEditorChange = () => {
        console.log("current: ", curretText)
        console.log("modified: ", getEditorText())
        if (getEditorText() !== curretText) {
            document.title = '* ' + docTitle
        } else {
            document.title = docTitle
        }
    }

    const handlePasteFn = (e) => {
        e.preventDefault()
        document.execCommand("insertHTML", false, (e.originalEvent || e).clipboardData.getData('text/plain'));
    }

    const getEditorText = () => {
        return mainEditor.innerText || mainEditor.textContent
    }


    // Event listeners
    mainEditor.addEventListener('input', handleEditorChange)

    mainEditor.addEventListener('paste', handlePasteFn)


    // Guardar archivo
    ipcRenderer.on('check-save-file-event', (event, arg) => {
        if (!fileSavedAs) {
            ipcRenderer.send('save-as-file-event', getEditorText())
        } else {
            ipcRenderer.send('save-file-event', { file: fileSavedAs, text: getEditorText() })
        }
    })

    // Guardar archivo success
    ipcRenderer.on('save-file-event-success', (event, arg) => {
        console.log(arg)
        fileSavedAs = arg.filePath;
        const splitted = arg.filePath.split('\\')
        document.title = splitted[splitted.length - 1] + ' : Editor de texto';
        docTitle = splitted[splitted.length - 1] + ' : Editor de texto';
        curretText = arg.text;
    })

})

