package cn.tecgui.desktop.server.core;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HttpResponse<T> {
    private int code;
    private String msg;
    private T data;

    /**
     * 返回一个成功的HttpResponse对象。
     * @param msg 成功的消息内容。
     * @return 返回一个包含成功状态码、消息和空数据的HttpResponse对象。
     */
    public static <T> HttpResponse<T> success(String msg) {
        return new HttpResponse<>(HttpCodeEnum.SUCCESS.code, msg, null);
    }
    
    /**
     * 返回成功的HttpResponse。
     * @param data 需要返回的数据。
     * @return 返回一个包含成功状态码、消息和数据的HttpResponse对象。
     */
    public static <T> HttpResponse<T> success(T data) {
        return new HttpResponse<>(HttpCodeEnum.SUCCESS.code, HttpCodeEnum.SUCCESS.msg, data);
    }

    /**
     * 返回成功的HttpResponse。
     * @param msg 成功的消息内容。
     * @param data 需要返回的数据。
     * @return 返回一个包含成功消息和数据的HttpResponse对象。
     */
    public static <T> HttpResponse<T> success(String msg,T data) {
        return new HttpResponse<>(HttpCodeEnum.SUCCESS.code, msg, data);
    }
    
    /**
     * 返回一个成功的HttpResponse对象。
     * @param code 状态码，表示请求的处理结果。
     * @param msg 消息，对处理结果的简单描述。
     * @param data 数据，泛型类型，可以是任何类型的数据。
     * @return 返回一个新的HttpResponse对象，其中包含了状态码、消息和数据。
     */
    public static <T> HttpResponse<T> success(int code, String msg, T data) {
            return new HttpResponse<>(code, msg, data);
    }

    /**
     * 返回一个失败的HttpResponse对象。
     * @param msg 错误信息。
     * @return 返回一个状态码为500，消息为msg，数据为null的HttpResponse对象。
     */
    public static <T> HttpResponse<T> fail(String msg) {
        return new HttpResponse<>(HttpCodeEnum.INTERNAL_SERVER_ERROR.code, msg, null);
    }

    /**
     * 创建一个失败的HttpResponse对象。
     * @param code 错误代码，用于标识错误的类型。
     * @param msg 错误信息，描述错误的详细信息。
     * @return 返回一个包含错误代码、错误信息和空数据的HttpResponse对象。
     */
    public static <T> HttpResponse<T> fail(int code, String msg) {
        return new HttpResponse<>(HttpCodeEnum.INTERNAL_SERVER_ERROR.code, msg, null);
    }

    /**
     * 获取HttpResponse对象。
     * @param code 响应码，用于表示请求的处理结果。
     * @param msg 响应消息，用于提供对处理结果的详细描述。
     * @param data 响应数据，可以是任何类型的数据，根据实际需求进行设置。
     * @return 返回一个包含code、msg和data的HttpResponse对象。
     */
    public static <T> HttpResponse<T> get(int code, String msg, T data) {
        HttpResponse<T> response = new HttpResponse<>(code, msg, data);
        response.setCode(code);
        response.setMsg(msg);
        response.setData(data);
        return response;
    }
}
