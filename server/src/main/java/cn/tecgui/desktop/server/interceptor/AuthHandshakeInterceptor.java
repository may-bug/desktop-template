package cn.tecgui.desktop.server.interceptor;

import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

public class AuthHandshakeInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {

        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;

            // 1. 从请求参数中获取token
            String token = servletRequest.getServletRequest().getParameter("token");

            // 2. 或者从header中获取
            // String token = servletRequest.getServletRequest().getHeader("Authorization");

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
        // 实现你的token验证逻辑
        // 例如JWT验证、数据库查询等
        return token != null && !token.isEmpty(); // 示例简单验证
    }

    private Object getUserFromToken(String token) {
        // 从token中解析用户信息
        return "user-info"; // 示例返回
    }
}
