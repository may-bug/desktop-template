import { Message } from '@arco-design/web-vue'
import { onClickOutside } from '../hook/outsideClick'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const init = (app) => {
  /**
   * 注入arco信息弹窗
   */
  Message._context = app._context
  /**
   * 指令注册 v-outside-click
   */
  app.directive('outside-click', {
    mounted(el, binding) {
      if (!el) return
      let justDisplayed = true
      setTimeout(() => {
        justDisplayed = false
        el.__onClickOutside__ = onClickOutside(el, binding)
      }, 100)
      el.__justDisplayed__ = justDisplayed
    },
    unmounted(el) {
      if (el && el.__onClickOutside__) {
        document.removeEventListener('click', el.__onClickOutside__)
        delete el.__onClickOutside__
      }
    }
  })
}
