package cn.tecgui.desktop.server.handler;

import cn.tecgui.desktop.server.components.SaTokenManager;
import cn.tecgui.desktop.server.service.DeviceSessionService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Component
public class SignalingHandler extends TextWebSocketHandler {
    private final DeviceSessionService deviceSessionService;
    private final SaTokenManager saTokenManager;

    private final ConcurrentHashMap<String, WebSocketSession> deviceSessionCache = new ConcurrentHashMap<>();

    public SignalingHandler(DeviceSessionService deviceSessionService, SaTokenManager saTokenManager) {
        this.deviceSessionService = deviceSessionService;
        this.saTokenManager = saTokenManager;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        var uri = session.getUri();
        if (uri == null) {
            session.close(CloseStatus.BAD_DATA);
            return;
        }

        var queryParams = parseQueryParams(uri.getQuery());
        String token = queryParams.get("token");
        String uid = queryParams.get("uid");
        String deviceId = queryParams.get("deviceId");

        if (token == null || uid == null || deviceId == null) {
            session.close(CloseStatus.BAD_DATA.withReason("缺少 token/uid/deviceId 参数"));
            log.error("缺少 token/uid/deviceId 参数");
            return;
        }

        String validUid = saTokenManager.getUidByToken(token);
        if (validUid == null || !validUid.equals(uid)) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Token 校验失败"));
            log.error("Token 校验失败");
            return;
        }

        deviceSessionCache.put(deviceId, session);
        deviceSessionService.deviceToUserMap.put(deviceId, uid);

        log.info("用户 {} 设备 {} 建立连接", uid, deviceId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode node = mapper.readTree(message.getPayload());
        String type = node.get("type").asText();
        if (type.equals("ping")) {
            return;
        }
        String to = node.has("to") ? node.get("to").asText() : null;
        String from = node.has("form") ? node.get("form").asText() : null;
        switch (type) {
            case "offer":
                handleOffer(to, node);
                break;
            case "candidate":
                handleCandidate(to, node);
                break;
            default:
                session.sendMessage(new TextMessage("{\"type\":\"error\",\"message\":\"unknown type\"}"));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        deviceSessionService.deviceToUserMap.entrySet().removeIf(entry -> {
            String deviceId = entry.getKey();
            WebSocketSession ws =getSessionByDeviceId(deviceId);
            if (ws == null || ws == session) {
                deviceSessionService.removeDeviceSession(deviceId);
                log.info("设备 {} 断开连接", deviceId);
                return true;
            }
            return false;
        });
    }

    private Map<String, String> parseQueryParams(String query) {
        if (query == null) return Map.of();
        return Arrays.stream(query.split("&"))
                .map(s -> s.split("="))
                .filter(arr -> arr.length == 2)
                .collect(Collectors.toMap(arr -> arr[0], arr -> arr[1]));
    }

    private void handleOffer(String toDeviceId, JsonNode node) throws Exception {
        WebSocketSession targetSession =getSessionByDeviceId(toDeviceId);
        if (targetSession != null && targetSession.isOpen()) {
            targetSession.sendMessage(new TextMessage(node.toString()));
        } else {
            log.warn("目标设备 {} 不在线，offer 转发失败", toDeviceId);
        }
    }

    private void handleCandidate(String toDeviceId, JsonNode node) throws Exception {
        WebSocketSession targetSession =getSessionByDeviceId(toDeviceId);
        if (targetSession != null && targetSession.isOpen()) {
            targetSession.sendMessage(new TextMessage(node.toString()));
        } else {
            log.warn("目标设备 {} 不在线，candidate 转发失败", toDeviceId);
        }
    }

    private WebSocketSession getSessionByDeviceId(String deviceId) {
        return deviceSessionCache.get(deviceId);
    }
}
