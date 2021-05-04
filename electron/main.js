const path = require('path');
const url = require('url');
const { app, BrowserWindow, Notification, ipcMain, protocol } = require('electron')
const { is } = require('electron-util');
const settings = require('./settings');
const ticker = require('./ticker');
const TrayGenerator = require('./tray-generator')

let config = settings.get();
let mainWindow = null;
let tray;
let n;

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      devTools: is.development,
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });
  if (is.development) {
    mainWindow.webContents.openDevTools({ /*mode: 'detach'*/ });
  }
  console.log('is.development', is.development)
  const startURL = is.development ? 'http://localhost:3000' : url.format({
    pathname: path.join(__dirname, "../build/index.html"),
    protocol: 'file:',
    slashes: true
  });
  mainWindow.loadURL(startURL)
};

function showNotification() {
  const notification = {
    title: config.notification.title,
    body: config.notification.description,
    actions: [
      {
        text: 'Close',
        type: 'button',
      }
    ],
  }
  n = new Notification(notification)
  n.on('action', () => { ticker.setNextTick.call(ticker); });
  n.on('close', () => { ticker.setNextTick.call(ticker); });
  n.on('click', () => { ticker.setNextTick.call(ticker); });
  n.show()
}

app.on('ready', () => {
  protocol.interceptFileProtocol('file', (request, callback) => {
    const url = request.url.substr(7)    /* all urls start with 'file://' */
    callback({ path: path.normalize(`${__dirname}/${url}`) })
  }, (err) => {
    if (err) console.error('Failed to register protocol')
  })
  createMainWindow();
  tray = new TrayGenerator(mainWindow);
  tray.createTray();
  ipcMain.on('SAVE_SETTINGS_AND_RUN', (event, data) => {
    if (
      data.selectedHour !== config.selectedHour ||
      data.selectedMinute !== config.selectedMinute ||
      data.interval !== config.interval ||
      data.notification.title !== config.notification.title ||
      data.notification.description !== config.notification.description
    ) {
      settings.save(data, (err) => {
        console.log('New config saved');
      })
    }
    ticker.run(data, showNotification);
  });
  ipcMain.on('STOP', (event, data) => {
    ticker.stop();
  });
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('UPDATE_SETTINGS', config);
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.dock.hide();