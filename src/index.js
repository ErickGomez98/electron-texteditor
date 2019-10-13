const { ipcRenderer } = require('electron')
console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"

document.addEventListener('DOMContentLoaded', () => {
    const mainEditor = document.getElementById('mainTextEditor')
    const docTitle = document.title;

    const handleEditorChange = () => {
        if (mainEditor.innerHTML !== "") {
            document.title = '* ' + docTitle
        } else {
            document.title = docTitle
        }
    }


    mainEditor.addEventListener('input', handleEditorChange)



    ipcRenderer.on('asynchronous-reply', (event, arg) => {
        console.log(arg) // prints "pong"
    })
    ipcRenderer.send('asynchronous-message', 'ping')
})

