import {
  app,
  BrowserWindow
} from 'electron'
import {
  Menu,
  MenuItem,
  dialog,
  ipcMain
} from 'electron';
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
const winURL = process.env.NODE_ENV === 'development' ?
  `http://localhost:9080` :
  `file://${__dirname}/index.html`

function createWindow() {
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

// var createStream = fs.createWriteStream("我的文件夹/cbj.txt");
// createStream.write("<p>我是你哥哥</p><br><p>我们都是你妈的儿子</p>")
// createStream.end();

// 删除所有子文件/文件夹
deleteFolderRecursive('我的文件夹', true)

//监听与渲染进程的通信
ipcMain.on('generateFolder', function (event, arg) {
  fs.mkdir(arg, {
    recursive: false
  }, (err) => {
    console.log(err)
  });
})

ipcMain.on('generateFile', function (event, arg) {
  let fileStream = fs.createWriteStream(arg)
  fileStream.end()
})

ipcMain.on('readFile', function (event, arg) {
  fs.readFile(arg, function (err, data) {
    if (err) {
      return console.error(err);
    }
    console.log("异步读取: " + data.toString());
    event.sender.send('readFile-reply', data.toString())
  });
})


ipcMain.on('rename', function (event, arg) {
  let obj = JSON.parse(arg)
  fs.rename(obj.oldPath, obj.newPath, (err) => {})
})

ipcMain.on('delete', function (event, arg) {
  deleteFolderRecursive(arg)
})

ipcMain.on('reserve', function (event, arg) {
  let obj = JSON.parse(arg)
  let fileStream = fs.createWriteStream(obj.path)
  fileStream.write(obj.content)
  fileStream.end()
})

function deleteFolderRecursive(path, remainSelf) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file) {
      var curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    if (!remainSelf) {
      fs.rmdirSync(path);
    }
  }
};


// deleteFolderRecursive('我的文件夹/新建文件夹')
// fs.rmdir('我的文件夹/新建文件夹', err => {
//   console.log(err)
// })
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