package cn.tecgui.desktop.server.handler;

import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

public class UidHandshakeHandler extends DefaultHandshakeHandler {
    @Override
    protected Principal determineUser(org.springframework.http.server.ServerHttpRequest request,
                                      org.springframework.web.socket.WebSocketHandler wsHandler,
                                      Map<String, Object> attributes) {
        String uid = (String) attributes.get("uid");
        return uid != null ? () -> uid : null;
    }
}

