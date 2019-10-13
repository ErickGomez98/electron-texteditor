const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const fs = require('fs')

let win
const createWindow = () => {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    win.loadFile('./src/index.html')

    win.webContents.openDevTools()

    win.on('closed', () => {
        win = null
    })

    let menu = Menu.buildFromTemplate([
        {
            label: 'Archivo',
            submenu: [
                {
                    label: 'Nuevo', click() {
                        createWindow()
                    }
                },
                { label: 'Abrir' },
                {
                    label: 'Guardar', click() {
                        win.webContents.send('check-save-file-event')
                    }
                },
                { label: 'Guardar Como' },
                { type: 'separator' },
                {
                    label: 'Salir', click() {
                        app.quit()
                    }
                }
            ]
        },
        {
            label: 'Buscar',
            submenu: [
                { label: 'Texto' },
            ]
        },
    ])

    Menu.setApplicationMenu(menu)



}

app.on('ready', createWindow)


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

ipcMain.on('save-as-file-event', async (event, text) => {
    console.log('mostrar dialog pa guardar el archivo')
    console.log('el texto: ', text);
    const savePath = await dialog.showSaveDialog({
        filters: [
            { name: 'Documento de texto', extensions: ['txt'] },
            { name: 'Todos los archivos', extensions: ['*'] }
        ],
        title: 'Guardar como',
        defaultPath: '*.txt'
    });
    console.log(savePath)
    if (!savePath.canceled) {
        fs.writeFile(savePath.filePath, text, (err) => {
            if (!err) {
                win.webContents.send('save-file-event-success', { ...savePath, text })
            }
        })
    }
})

ipcMain.on('save-file-event', (ev, args) => {
    console.log('nomas guardar el archivo, no mostrar dialog')
    console.log(args.file)
    fs.writeFile(args.file, args.text, (err) => {
        if (!err) {
            win.webContents.send('save-file-event-success', { filePath: args.file, text: args.text })
        }
    })
});