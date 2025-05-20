import { subDesktopMessage } from './desktopMessage'
import { ipcMain } from 'electron'
import { store } from '../store'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initMessage = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipcMain.on('sub-desktop-message', (_event) => {
    const deviceId = store.get('deviceId')
    const token = store.get('token')
    subDesktopMessage(token, deviceId)
  })
}

export { initMessage }
