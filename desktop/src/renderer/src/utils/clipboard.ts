// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const copyImageToClipboard = (data) => {
  return window.electron.ipcRenderer('copy-image-to-clipboard', data)
}

export { copyImageToClipboard }
