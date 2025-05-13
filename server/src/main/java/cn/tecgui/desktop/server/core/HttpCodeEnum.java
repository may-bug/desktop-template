package cn.tecgui.desktop.server.core;

import lombok.Getter;

@Getter
public enum HttpCodeEnum {
    SUCCESS(200, "请求成功"),
    MOVED_PERMANENTLY(301, "资源已永久移动"),
    FOUND(302, "资源临时移动"),
    NOT_MODIFIED(304, "资源未修改"),
    BAD_REQUEST(400, "无效请求"),
    UNAUTHORIZED(401, "无权访问"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源未找到"),
    METHOD_NOT_ALLOWED(405, "方法不允许"),
    NOT_ACCEPTABLE(406, "不可接受"),
    UNSUPPORTED_MEDIA_TYPE(415, "不支持的媒体类型"),
    INTERNAL_SERVER_ERROR(500, "服务器错误"),
    NOT_IMPLEMENTED(501, "未实现"),
    BAD_GATEWAY(502, "坏网关"),
    SERVICE_UNAVAILABLE(503, "服务不可用"),
    GATEWAY_TIMEOUT(504, "网关超时");
    
    public final int code;
    public final String msg;
    HttpCodeEnum(int code, String msg) {
        this.code = code;
        this.msg = msg;
    }
}
