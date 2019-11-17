const { app, BrowserWindow, Menu, ipcMain } = require("electron");
let win;
const createWindow = () => {
  win = new BrowserWindow({
    width: 650,
    height: 500,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile("./src/index.html");

  //   win.webContents.openDevTools();

  win.on("closed", () => {
    win = null;
  });

  let menu = Menu.buildFromTemplate([]);

  Menu.setApplicationMenu(menu);
};

// Nuevo registro Window
let windowNew;
const createNewWindow = editing => {
  windowNew = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: true
    }
  });

  windowNew.loadFile("./src/nuevoRegistro.html");

  //   windowNew.webContents.openDevTools();

  windowNew.on("closed", () => {
    windowNew = null;
  });

  windowNew.webContents.once("dom-ready", () => {
    windowNew.webContents.send("is-editing", editing);
  });
};

// ************** EVENTS ******************

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("agregar-nuevo-open-view", (ev, editing) => {
  createNewWindow(editing);
});

ipcMain.on("capturar-registro", (ev, data) => {
  windowNew.close();
  win.webContents.send("agregar-registro-tree", data);
});
