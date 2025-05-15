package cn.tecgui.desktop.server.interceptor;

import cn.dev33.satoken.stp.StpUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.HashMap;
import java.util.Map;

public class AuthHandshakeInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {

        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;

            // 1. 从请求参数中获取token
            String token = servletRequest.getServletRequest().getParameter("token");

            // 3. 验证token逻辑
            if (!isValidToken(token)) {
                // 返回HTTP 403禁止访问
                response.setStatusCode(HttpStatus.FORBIDDEN);
                return false;
            }
            // 可以将用户信息存入attributes，后续handler中可以使用
            attributes.put("user", getUserFromToken(token));
        }

        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // 握手成功后可以执行的操作
    }

    private boolean isValidToken(String token) {
        if(token == null || token.isEmpty()) return false;
        return StpUtil.getLoginId(token) != null;
    }

    private Map<String,Object> getUserFromToken(String token) {
        // 从token中解析用户信息
        Map<String,Object> result = new HashMap<>();
        return result; // 示例返回
    }
}
