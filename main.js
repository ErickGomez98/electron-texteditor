const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const fs = require('fs')
require('electron-reload')(__dirname);

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

    let menu = Menu.buildFromTemplate([])

    Menu.setApplicationMenu(menu)
}


// Buscar win
let winSearchBox
const createSearchWindow = (txt) => {
    winSearchBox = new BrowserWindow({
        width: 440,
        height: 100,
        webPreferences: {
            nodeIntegration: true
        },
        frame: false,
    })

    winSearchBox.loadFile('./src/searchBox.html')

    // winSearchBox.webContents.openDevTools()

    winSearchBox.on('closed', () => {
        winSearchBox = null
    })

    winSearchBox.webContents.once('dom-ready', () => {
        winSearchBox.webContents.send('receive-editor-text', txt)
    })
}




// ************** EVENTS ******************

app.on('ready', createWindow)


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

ipcMain.on('save-as-file-event', async (event, text) => {
    const savePath = await dialog.showSaveDialog({
        filters: [
            { name: 'Documento de texto', extensions: ['txt'] },
            { name: 'Todos los archivos', extensions: ['*'] }
        ],
        title: 'Guardar como',
        defaultPath: '*.txt'
    });
    if (!savePath.canceled) {
        fs.writeFile(savePath.filePath, text, (err) => {
            if (!err) {
                win.webContents.send('save-file-event-success', { ...savePath, text })
            }
        })
    }
})

ipcMain.on('save-file-event', (ev, args) => {
    fs.writeFile(args.file, args.text, (err) => {
        if (!err) {
            win.webContents.send('save-file-event-success', { filePath: args.file, text: args.text })
        }
    })
});


ipcMain.on('open-file-event', async (ev, args) => {
    const openPath = await dialog.showOpenDialog({
        filters: [
            { name: 'Documento de texto', extensions: ['txt'] },
        ],
        title: 'Abrir archivo',
        properties: ['openFile']
    })

    if (!openPath.canceled) {
        fs.readFile(openPath.filePaths[0], 'utf8', (err, data) => {
            if (err) throw err
            win.webContents.send('open-file-event-success', { filePath: openPath.filePaths[0], text: data })
        })
    }
});

ipcMain.on('preparing-search-box', (e, text) => {
    createSearchWindow(text)
})

ipcMain.on('cancel-search-box', (e, text) => {
    win.webContents.send('cancel-search-box');
})


ipcMain.on('search-found-event', (ev, args) => {
    win.webContents.send('search-found', args)
})