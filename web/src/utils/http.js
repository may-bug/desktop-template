import axios from 'axios'

const service= axios.create({
    baseURL: '/api',
    withCredentials: true,
    timeout: 5 * 1000,
    headers: {
        Accept: '*',
        'Codelin':window.localStorage.getItem('token'),
    }
})
service.interceptors.request.use((config) => {
    return config
})

service.interceptors.response.use((response) => {
    return response.data
})

export const http = {
    get(url, params){
        const config = {
            method: 'GET',
            url: url,
            params: params ? params : {},
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
        return service(config)
    },
    post(url, data){
        const config = {
            method: 'POST',
            url: url,
            data: data,
            headers: {
                'Content-Type': 'application/json',
            }
        }
        return service(config)
    }
}
