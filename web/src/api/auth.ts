import { http } from '../utils/http'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const loginByAccountAPI = (data) => {
  return http.post('/account/login', data)
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const loginOutAPI = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  return http.post('/account/logout')
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const isLoginAPI = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  return http.get('/account/isLogin')
}

export { loginByAccountAPI, loginOutAPI, isLoginAPI }
