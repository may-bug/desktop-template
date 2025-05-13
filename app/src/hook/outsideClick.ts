import { DirectiveBinding } from 'vue'

/**
 * 点击某个元素外部触发事件
 * @param el
 * @param binding
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function onClickOutside(el: HTMLElement, binding: DirectiveBinding) {
  if (!el) return // 如果元素不存在，则直接返回，不执行任何操作
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handler = (event: MouseEvent) => {
    if (!el.contains(event.target as Node) && el !== event.target) {
      // 执行绑定的函数
      binding.value(event)
    }
  }
  document.addEventListener('click', handler)
  return handler
}

export { onClickOutside }
