import { http } from '../utils/http'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const faceAuth = (data) => {
  return http.post('/face', data)
}

export { faceAuth }
