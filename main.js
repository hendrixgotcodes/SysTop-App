const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  Notification,
  Tray
} = require('electron')
const log = require('electron-log');
let notifications;
const path = require('path');

let tray;
let icon = path.join(__dirname, 'assets', 'icons', 'tray_icon.png');

const STORE = require('./app/js/store');

const store = new STORE({
  configName: 'settings',
  defaults: {
    settings: {
      cpuOverload: 90,
      alertFreq: 1
    }
  }
});


// Set env
process.env.NODE_ENV = 'production'

const isDev = process.env.NODE_ENV !== 'production' ? true : false
const isMac = process.platform === 'darwin' ? true : false

let mainWindow

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'APP NAME',
    width: isDev ? 800 : 500,
    height: 600,
    icon: icon,
    resizable: isDev ? true : false,
    backgroundColor: 'white',
    webPreferences: {
      nodeIntegration: true,
    },
    opacity: 0.98
  })

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.loadFile('./app/index.html')

  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.send('get-settings', store.get('settings'))
  });

  ipcMain.on('save-settings', (e, settings) => {
    store.set('settings', settings);

    mainWindow.webContents.send('get-settings', store.get('settings'));

  });
}

app.on('ready', () => {

  notifications = new Notification();

  console.log(app.getPath('logs'));

  createMainWindow()

  const mainMenu = Menu.buildFromTemplate(menu)
  Menu.setApplicationMenu(mainMenu)

  const trayMenuTemplate = [{
    label: 'Close Systop',
    click: (e) => {
      app.isQuitting = true;
      app.quit();
    }
  }]
  const trayMenu = Menu.buildFromTemplate(trayMenuTemplate)

  tray = new Tray(icon);
  tray.on("click", () => {
    if (mainWindow.isVisible() === true) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  })
  tray.setContextMenu(trayMenu);

  mainWindow.on("close",(e)=>{
  
    if(!app.isQuitting){
    e.preventDefault();
      mainWindow.hide();
      return false
    }
    
    return true
  
  
  })
  
})


const menu = [
  ...(isMac ? [{
    role: 'appMenu'
  }] : []),
  {
    role: 'fileMenu',
  },
  ...(isDev ? [{
    label: 'Developer',
    submenu: [{
        role: 'reload'
      },
      {
        role: 'forcereload'
      },
      {
        type: 'separator'
      },
      {
        role: 'toggledevtools'
      },
    ],
  }, ] : []),
]

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
})

app.on('activate', () => {

  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})



ipcMain.on('alert', (e, message) => {
  notifications.title = message.title
  notifications.body = message.message
  notifications.show();
})

app.allowRendererProcessReuse = true

app.setAppUserModelId(process.execPath)