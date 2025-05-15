import {http} from "../utils/http.js"

/**
 * 登录
 * @param data
 * @returns {Promise<AxiosResponse<any>> | *}
 */
export const login = (data) => {
    return http.post("/account/login", data)
}

/**
 * 登录状态
 * @param data
 * @returns {Promise<AxiosResponse<any>> | *}
 */
export const isLogin= () => {
    return http.get("/account/isLogin")
}

/**
 * 退出登录
 * @returns {Promise<AxiosResponse<any>> | *}
 */
export const logout = () => {
    return http.get("/account/logout")
}