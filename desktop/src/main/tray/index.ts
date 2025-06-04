import { windowsContainer } from '../window/windows'
import { app, Menu, Tray } from 'electron'
import icon from '../../../resources/icon.png?asset'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initTray = () => {
  const iconPath = icon
  const tray = new Tray(iconPath)
  // 创建上下文菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示',
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      click: () => {
        windowsContainer['main'].show()
      }
    },
    {
      label: '退出',
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      click: () => {
        app.quit()
      }
    }
  ])

  // 设置Tray图标的上下文菜单
  tray.setContextMenu(contextMenu)

  // 设置Tray图标的提示文本
  tray.setToolTip('CodeLin')

  // 处理Tray图标的点击事件
  tray.on('click', () => {
    if (windowsContainer['main'].isVisible()) {
      windowsContainer['main'].hide()
    } else {
      windowsContainer['main'].show()
    }
  })
}

export { initTray }
