import { http } from '../utils/http'

/**
 * 获取uid
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getUidAPI = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  return http.get('/user/qr/generateUid')
}

/**
 * 获取二维码
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getQrAPI = (data) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  return http.get('/user/qr/generateQr', data)
}

/**
 * 轮询二维码状态
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const qrPollingAPI = (data) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  return http.get('/user/qr/polling', data)
}
