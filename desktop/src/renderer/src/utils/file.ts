// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const saveImage = (data) => {
  return window.electron.ipcRenderer.invoke('file-save-image', data)
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const saveRecording=(data)=>{
  return window.electron.ipcRenderer.invoke('file-save-recording', data)
}

export { saveImage, saveRecording }
