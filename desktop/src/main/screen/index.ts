import { desktopCapturer, dialog, ipcMain, systemPreferences } from 'electron'
// import robot from '@node-robotics/robotjs'
import { keyboard, mouse, Button, Key } from '@nut-tree/nut-js'
import os from 'os'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const moveMouseCrossPlatform = async (x: number, y: number) => {
  const platform = os.platform()

  if (platform === 'darwin') {
    if (!systemPreferences.isTrustedAccessibilityClient(false)) {
      await dialog.showMessageBox({
        type: 'warning',
        message: '请在「系统设置 > 隐私与安全性 > 辅助功能」中启用本应用，否则无法控制鼠标或键盘。'
      })
    }
    // macOS 优先用 robotjs 更稳定
    // robot.moveMouse(x, y)
  } else {
    // 其他平台默认 nut-js
    return mouse.setPosition({ x, y })
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initScreen = () => {
  /**
   *  处理获取桌面源的请求
   */
  ipcMain.handle('get-desktop-sources', async () => {
    return await desktopCapturer.getSources({
      types: ['screen']
    })
  })

  mouse.config.autoDelayMs = 0
  keyboard.config.autoDelayMs = 0

  ipcMain.on('remote-control-event', async (event, payload) => {
    console.log(payload)
    switch (payload.event) {
      case 'mousemove':
        await moveMouseCrossPlatform(Math.floor(payload.x), Math.floor(payload.y))
        break
      case 'click':
        await mouse.click(payload.button === 2 ? Button.RIGHT : Button.LEFT)
        break
      case 'wheel':
        await mouse.scrollDown(payload.deltaY)
        break
      case 'keydown':
        try {
          const key = Key[payload.key.toUpperCase()]
          if (key) await keyboard.pressKey(key)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          console.warn('不支持的按键:', payload.key)
        }
        break
      case 'keyup':
        await keyboard.releaseKey(Key[payload.key.toUpperCase()])
        break
    }
  })
}

export { initScreen }
