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
}
