import { Modal } from '@arco-design/web-vue'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const updateInfo = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  window.electron.ipcRenderer.on('has-update', (value) => {
    console.log(value)
    Modal.info({
      title: 'Update',
      content: 'Update'
    })
  })
}

export { updateInfo }
