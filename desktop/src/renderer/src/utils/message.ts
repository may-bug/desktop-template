export interface PayLoad {
  type: string
  to: string
  from: string
  timestamp: string
}
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const sendDesktopMessage = (payload: PayLoad) => {
  window.electron.ipcRenderer.send('send-desktop-message', payload)
}

export { sendDesktopMessage }
