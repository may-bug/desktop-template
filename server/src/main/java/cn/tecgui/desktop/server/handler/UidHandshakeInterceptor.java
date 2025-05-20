package cn.tecgui.desktop.server.handler;

import cn.tecgui.desktop.server.components.SaTokenManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@Slf4j
public class UidHandshakeInterceptor implements HandshakeInterceptor {
    private final SaTokenManager tokenManager;

    public UidHandshakeInterceptor(SaTokenManager tokenManager) {
        this.tokenManager = tokenManager;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {

        URI uri = request.getURI();
        String query = uri.getQuery();
        Map<String, String> params = parseQueryParams(query);
        String deviceId = params.get("deviceId");
        String token = params.get("token");
        if (token == null || deviceId == null) {
            log.error("缺少 token/deviceId 参数");
            return false;
        }
        log.info("WebSocket handshake: deviceId = {}", deviceId);
        attributes.put("uid", deviceId);
        String validUid = tokenManager.getUidByToken(token);
        if (validUid == null) {
            log.error("Token 校验失败");
            return false;
        }
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception ex) {
    }

    private Map<String, String> parseQueryParams(String query) {
        Map<String, String> map = new HashMap<>();
        if (query != null) {
            String[] pairs = query.split("&");
            for (String pair : pairs) {
                int idx = pair.indexOf("=");
                if (idx > 0 && idx < pair.length() - 1) {
                    String key = pair.substring(0, idx);
                    String value = pair.substring(idx + 1);
                    map.put(key, value);
                }
            }
        }
        return map;
    }
}
