const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  Notification
} = require('electron')
const log = require('electron-log');
let notifications;

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
}

app.on('ready', () => {

  notifications = new Notification();

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