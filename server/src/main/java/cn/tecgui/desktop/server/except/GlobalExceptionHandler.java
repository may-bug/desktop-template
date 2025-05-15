package cn.tecgui.desktop.server.except;

import cn.dev33.satoken.exception.NotLoginException;
import cn.tecgui.desktop.server.core.HttpResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotLoginException.class)
    public HttpResponse<String> handleNotLogin(NotLoginException e) {
        return HttpResponse.get(401,"未登录",null);
    }

    @ExceptionHandler(RoomNotFoundException.class)
    public HttpResponse<String> handleRoomNotFound(RoomNotFoundException e) {
        return HttpResponse.get(404,"资源未授权",null);
    }

    @ExceptionHandler(RoomFullException.class)
    public HttpResponse<String> handleRoomFull(RoomFullException e) {
        return HttpResponse.get(403,"拒绝访问",null);
    }

    @ExceptionHandler(UnauthorizedAccessException.class)
    public HttpResponse<String> handleUnauthorized(UnauthorizedAccessException e) {
        return HttpResponse.get(401,"未登录",null);
    }
}
