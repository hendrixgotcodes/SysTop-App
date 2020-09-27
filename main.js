const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  Notification
} = require('electron')
const log = require('electron-log');
let notifications;

const STORE = require('./app/js/store');

const store = new STORE({configName: 'settings', defaults: {
    settings:{
      cpuOverload: 90,
      alertFreq: 1
    }
}});


// Set env
process.env.NODE_ENV = 'development'

const isDev = process.env.NODE_ENV !== 'production' ? true : false
const isMac = process.platform === 'darwin' ? true : false

let mainWindow

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'APP NAME',
    width: isDev ? 800 : 500,
    height: 600,
    icon: `${__dirname}/assets/icons/icon.png`,
    resizable: isDev ? true : false,
    backgroundColor: 'white',
    webPreferences: {
      nodeIntegration: true,
    },
  })

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.loadFile('./app/index.html')

  mainWindow.webContents.on('dom-ready',()=>{
    mainWindow.webContents.send('get-settings',store.get('settings'))
  });

  ipcMain.on('save-settings', (e, settings)=>{
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



ipcMain.on('alert', (e,message) => {
  notifications.title = message.title
  notifications.body = message.message
  notifications.show();
})

app.allowRendererProcessReuse = true

app.setAppUserModelId(process.execPath)