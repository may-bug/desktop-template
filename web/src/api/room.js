import {http} from "../utils/http.js";

/**
 * 房间列表
 * @returns {Promise<AxiosResponse<any>> | *}
 */
export const roomList=()=>{
    return http.get("/room/list")
}

/**
 * 创建房间
 * @returns {Promise<AxiosResponse<any>> | *}
 */
export const roomCreate=(data)=>{
    return http.post("/room/create",data)
}

/**
 * 加入房间
 * @param id
 * @param data
 * @returns {Promise<AxiosResponse<any>> | *}
 */
export const roomJoin=(id,data)=>{
    return http.post(`/room/${id}/join`,data)
}

/**
 * 离开房间
 * @param id
 * @param data
 * @returns {Promise<AxiosResponse<any>> | *}
 */
export const roomLeave=(id,data)=>{
    return http.post(`/room/${id}/leave`,data)
}