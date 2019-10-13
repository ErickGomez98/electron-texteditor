const { app, BrowserWindow, Menu } = require('electron')
const shell = require('electron').shell

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
                { label: 'Guardar' },
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
