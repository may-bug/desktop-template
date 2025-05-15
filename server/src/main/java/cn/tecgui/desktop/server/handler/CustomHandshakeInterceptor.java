package cn.tecgui.desktop.server.handler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Slf4j
public class CustomHandshakeInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        String userId = request.getURI().getQuery();
        if (userId != null) {
            // 解析查询字符串，假设格式为 "userId=123"
            String[] params = userId.split("&");
            for (String param : params) {
                String[] keyValue = param.split("=");
                if ("userId".equals(keyValue[0]) && keyValue.length > 1) {
                    attributes.put("userId", keyValue[1]);
                    return true;
                }
            }
        }
        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {}
}