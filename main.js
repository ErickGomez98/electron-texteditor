const { app, BrowserWindow, Menu } = require('electron')

let win
const createWindow = () => {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    win.loadFile('index.html')

    win.webContents.openDevTools()

    win.on('closed', () => {
        win = null
    })

    let menu = Menu.buildFromTemplate([
        {
            label: 'Menu',
            submenu: [
                { label: 'aveda' },
                { label: 'aveda 2' },
                { label: 'aveda 3' }
            ]
        }
    ])

    Menu.setApplicationMenu(menu)



}

app.on('ready', createWindow)


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
