package cn.tecgui.desktop.server.handler;

import org.springframework.web.socket.server.support.DefaultHandshakeHandler;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.http.server.ServerHttpRequest;
import java.security.Principal;
import java.util.Map;

public class CustomHandshakeHandler extends DefaultHandshakeHandler {

    @Override
    protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler, Map<String, Object> attributes) {
        String userId = (String) attributes.get("userId");
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException("Missing userId in handshake attributes.");
        }

        // 返回一个匿名的 Principal 对象，名字就是 userId
        return () -> userId;
    }
}
