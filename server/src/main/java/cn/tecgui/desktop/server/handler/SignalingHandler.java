package cn.tecgui.desktop.server.handler;

import cn.tecgui.desktop.server.components.SaTokenManager;
import cn.tecgui.desktop.server.service.DeviceSessionService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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
    private final SimpMessagingTemplate messagingTemplate;
    private final DeviceSessionService deviceSessionService;
    private final SaTokenManager saTokenManager;

    public SignalingHandler(SimpMessagingTemplate messagingTemplate, DeviceSessionService deviceSessionService, SaTokenManager saTokenManager) {
        this.messagingTemplate = messagingTemplate;
        this.deviceSessionService = deviceSessionService;
        this.saTokenManager = saTokenManager;
    }

    private final ConcurrentHashMap<String, String> deviceToUserMap = new ConcurrentHashMap<>();

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

        deviceToUserMap.put(deviceId, uid);
        deviceSessionService.addDeviceSession(uid, deviceId, session);

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
            case "answer":
                handleAnswer(to, node, from);
                break;
            case "candidate":
                handleCandidate(to, node);
                break;
            case "control":
                handleControlRequest(to, from);
                break;
            case "reused":
                handleReused(to, node, from);
                break;
            default:
                session.sendMessage(new TextMessage("{\"type\":\"error\",\"message\":\"unknown type\"}"));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        deviceToUserMap.entrySet().removeIf(entry -> {
            String deviceId = entry.getKey();
            WebSocketSession ws = deviceSessionService.getSessionByDeviceId(deviceId);
            if (ws == null || ws == session) {
                deviceSessionService.removeDeviceSession(entry.getValue(), deviceId);
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
        WebSocketSession targetSession = deviceSessionService.getSessionByDeviceId(toDeviceId);
        if (targetSession != null && targetSession.isOpen()) {
            targetSession.sendMessage(new TextMessage(node.toString()));
        } else {
            log.warn("目标设备 {} 不在线，offer 转发失败", toDeviceId);
        }
    }

    private void handleAnswer(String toDeviceId, JsonNode node, String fromDeviceId) throws Exception {
        WebSocketSession targetSession = deviceSessionService.getSessionByDeviceId(toDeviceId);
        if (targetSession != null && targetSession.isOpen()) {
            targetSession.sendMessage(new TextMessage(node.toString()));
            sendNotifyToDeviceOwner(toDeviceId, "accept", fromDeviceId);
        } else {
            log.warn("目标设备 {} 不在线，answer 转发失败", toDeviceId);
        }
    }

    private void handleCandidate(String toDeviceId, JsonNode node) throws Exception {
        WebSocketSession targetSession = deviceSessionService.getSessionByDeviceId(toDeviceId);
        if (targetSession != null && targetSession.isOpen()) {
            targetSession.sendMessage(new TextMessage(node.toString()));
        } else {
            log.warn("目标设备 {} 不在线，candidate 转发失败", toDeviceId);
        }
    }

    private void handleReused(String toDeviceId, JsonNode node, String fromDeviceId) throws Exception {
        WebSocketSession targetSession = deviceSessionService.getSessionByDeviceId(toDeviceId);
        if (targetSession != null && targetSession.isOpen()) {
            targetSession.sendMessage(new TextMessage(node.toString()));
            sendNotifyToDeviceOwner(toDeviceId, "reject", fromDeviceId);
        } else {
            log.warn("目标设备 {} 不在线，reused 转发失败", toDeviceId);
        }
    }

    private void handleControlRequest(String toDeviceId, String fromDeviceId) throws Exception {
        sendNotifyToDeviceOwner(toDeviceId, "join", fromDeviceId);
        log.info("已通知设备 {} 的用户，来自设备 {}", toDeviceId, fromDeviceId);
    }

    /**
     * 通过 STOMP 向设备所有者推送通知
     */
    private void sendNotifyToDeviceOwner(String targetDeviceId, String event, String fromDeviceId) {
        String targetUid = deviceToUserMap.get(targetDeviceId);
        if (targetUid == null) {
            log.warn("找不到设备 {} 对应的用户，通知失败", targetDeviceId);
            return;
        }

        ObjectMapper mapper = new ObjectMapper();
        var notifyMsg = mapper.createObjectNode();
        notifyMsg.put("type", "control_notify");
        notifyMsg.put("event", event);
        notifyMsg.put("from", fromDeviceId);

        messagingTemplate.convertAndSendToUser(targetUid, "/queue/control_notify", notifyMsg);
        log.info("推送通知给用户 {}，设备 {}，事件 {}，来自设备 {}", targetUid, targetDeviceId, event, fromDeviceId);
    }
}
