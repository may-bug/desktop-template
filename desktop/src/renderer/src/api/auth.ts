import { http } from '../utils/http'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const faceAuth = (data) => {
  return http.post('/face', data)
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const loginByAccountApi = (data) => {
  return http.post('/user/login', data)
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const loginOutAPI=()=>{
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  return http.post('/user/logout')
}

export { faceAuth, loginByAccountApi ,loginOutAPI }
