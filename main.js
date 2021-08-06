const {app, BrowserWindow} = require('electron')
const { sampleCallFrame, pessimisticallyEnableDebugger } = require('./debug');

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  })

  mainWindow.loadFile('index.html')
  pessimisticallyEnableDebugger(mainWindow.webContents);
  

  // I got sick of waiting for BrowserWindow Unresponsive
  setTimeout(async () => {
    const samples = await sampleCallFrame(mainWindow.webContents, {
      numSamples: 5,
      timeToWaitBetween: 500
    });
    console.log(`Collected samples while paused`, samples)
  }, 5000)
}
    
app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})