const { app, BrowserWindow,ipcMain } = require('electron');
const { sendCom,queryFiles } = require('../electron-api/api');
let mainWindow
function createWindow() {
    mainWindow= new BrowserWindow({
    width: 1366,
    height: 1000,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule:true
    }
  });

  ipcMain.on('sendCom', (event,data) => {
    sendCom(data).then((results)=>{
      mainWindow.webContents.send('sendCom', results);
    })
  });

  ipcMain.on('queryFiles', (event,data) => {
    queryFiles(data).then((results)=>{
      mainWindow.webContents.send('queryFiles', results);
    })
  });

  mainWindow.loadURL("http://localhost:8080"); // 这里是你的 Vue 项目的开发服务器地址

  mainWindow.on('closed', () => {
    ipcMain.removeAllListeners('sendCom')
    ipcMain.removeAllListeners('queryFiles')
    mainWindow = null;
  });
}
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    console.log('quit')
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
