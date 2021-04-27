const path = require('path');
const { app, BrowserWindow, Notification, ipcMain } = require('electron')
const { is } = require('electron-util');
const CronJob = require('cron').CronJob;
const homedir = require('os').homedir();
const fs = require('fs');
const TrayGenerator = require('./tray-generator')
const configFilePath = `${homedir}/.alert.config.json`;
const defaultConfig = {
    selectedHour: 8,
    selectedMinute: 30,
    interval: 180,
};
let savedConfig = {};
if(fs.existsSync(configFilePath)) {
    savedConfig = JSON.parse(fs.readFileSync(configFilePath).toString());
}
let settings = {
    ...defaultConfig,
    ...savedConfig,
};
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
        webSecurity: false
    },
  });
  if (is.development) {
    mainWindow.webContents.openDevTools({ /*mode: 'detach'*/ });
  } 
  console.log('is.development', is.development);
  const startURL = is.development ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`;
  mainWindow.loadURL(startURL)
};

function showNotification() {
    const notification = {
        title: 'Basic Notification',
        body: 'Notification from the Main process',
        actions: [
            {
                text: 'Close',
                type: 'button',
            }
        ],
    }
    n = new Notification(notification)
    n.on('action', function() {
        console.log('replay')
    });
    n.on('close', function() {
        console.log('close')
    });
    n.on('click', function() {
        console.log('click')
    });
    n.show()
}

app.on('ready', () => {
    console.log('ready');
    createMainWindow();
    tray = new TrayGenerator(mainWindow);
    tray.createTray();

    ipcMain.on('SAVE_SETTINGS_AND_RUN', (event, data) => {
        if(data.selectedHour !== settings.selectedHour || data.selectedMinute !== settings.selectedMinute || data.interval !== settings.interval) {
            // save new settings
        }
        // run
    });

    
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('settings', settings)
        mainWindow.webContents.send('UPDATE_SETTINGS', settings);
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) {
//         createWindow()
//     }
// })

app.dock.hide();

//mainWindow.webContents.send('MSG_FROM_MAIN', 'hello renderer');

// var job = new CronJob('*/10 * * * * *', function() {
//     console.log('You will see this message every second');
//     // showNotification();
// });
// job.start();