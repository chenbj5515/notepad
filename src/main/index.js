import { app, BrowserWindow } from 'electron'
import { Menu, MenuItem, dialog, ipcMain } from 'electron';
import electron from 'electron'

import '../renderer/store'
var fs = require('fs')
var path = require('path')
const ipc = require('electron').ipcMain
//是否可以安全退出

let safeExit = false;
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 640,
    minHeight: 640,
    useContentSize: true,
    width: 960,
    minWidth: 960,
    titleBarStyle: 'hidden'
    // type: 'textured',
  })
  
  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

var str = '我的文件夹'

fs.mkdir(str, { recursive: true }, (err) => {
  // if (err) throw err;
});

//监听与渲染进程的通信
ipcMain.on('generateFolder',function(event, arg){
  console.log(arg)
  fs.mkdir(arg, { recursive: false }, (err) => {
    console.log(err)
  });
})

ipcMain.on('rename',function(event, arg) {
  fs.rename(arg.oldPath, arg.newPath, (err) => {
    console.log(err)
  })
}
// ipcMain.on('createFile',function(){
//   mainWindow.minimize();
// })
// //登录窗口最大化
// ipcMain.on('window-max',function(){
//   if(mainWindow.isMaximized()){
//       mainWindow.restore();  
//   }else{
//       mainWindow.maximize(); 
//   }
// })
// ipcMain.on('window-close',function(){
//   mainWindow.close();
// })

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
