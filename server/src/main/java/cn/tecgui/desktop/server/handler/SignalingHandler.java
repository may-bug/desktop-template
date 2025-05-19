package cn.tecgui.desktop.server.handler;

import cn.tecgui.desktop.server.components.SaTokenManager;
import cn.tecgui.desktop.server.service.DeviceSessionService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class SignalingHandler extends TextWebSocketHandler {

    private final DeviceSessionService deviceSessionService;
    private final SaTokenManager saTokenManager;  // 自定义用于解析token和uid
    private final Map<String, String> deviceAuthPasswordMap = new ConcurrentHashMap<>(); // 设备授权密码缓存

    public SignalingHandler(DeviceSessionService deviceSessionService, SaTokenManager saTokenManager) {
        this.deviceSessionService = deviceSessionService;
        this.saTokenManager = saTokenManager;
    }

    // 设备ID 和 用户ID 绑定
    private final ConcurrentHashMap<String, String> deviceToUserMap = new ConcurrentHashMap<>();

    // 连接时带上 token, uid, deviceId 作为参数
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        var uri = session.getUri();
        if (uri == null) {
            session.close(CloseStatus.BAD_DATA);
            return;
        }

        // 解析参数
        var queryParams = parseQueryParams(uri.getQuery());
        String token = queryParams.get("token");
        String uid = queryParams.get("uid");
        String deviceId = queryParams.get("deviceId");

        if (token == null || uid == null || deviceId == null) {
            session.close(CloseStatus.BAD_DATA.withReason("缺少 token/uid/deviceId 参数"));
            return;
        }

        // Sa-Token 解析验证
        String validUid = saTokenManager.getUidByToken(token);
        if (validUid == null || !validUid.equals(uid)) {
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Token 校验失败"));
            return;
        }

        // 绑定设备-用户
        deviceToUserMap.put(deviceId, uid);
        deviceSessionService.addDeviceSession(uid, deviceId, session);

        System.out.printf("用户 %s 设备 %s 建立连接\n", uid, deviceId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // 消息格式示例
        // { "type": "offer/answer/ice", "fromDevice": "deviceId1", "toDevice": "deviceId2", "data": {...} }
        ObjectMapper mapper = new ObjectMapper();
        JsonNode node = mapper.readTree(message.getPayload());

        String fromDevice = node.get("fromDevice").asText();
        String toDevice = node.get("toDevice").asText();
        String type = node.get("type").asText();

        // 设备授权检查（示例）
        if (!checkDeviceAuthorized(fromDevice)) {
            session.sendMessage(new TextMessage("{\"type\":\"error\",\"message\":\"设备未授权\"}"));
            return;
        }

        WebSocketSession toSession = deviceSessionService.getSessionByDeviceId(toDevice);
        if (toSession != null && toSession.isOpen()) {
            toSession.sendMessage(message);
        } else {
            session.sendMessage(new TextMessage("{\"type\":\"error\",\"message\":\"目标设备不在线\"}"));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        // 移除绑定和缓存
        deviceToUserMap.entrySet().removeIf(entry -> {
            String deviceId = entry.getKey();
            WebSocketSession ws = deviceSessionService.getSessionByDeviceId(deviceId);
            if (ws == null || ws == session) {
                deviceSessionService.removeDeviceSession(entry.getValue(), deviceId);
                System.out.printf("设备 %s 断开连接\n", deviceId);
                return true;
            }
            return false;
        });
    }

    // 设备授权控制密码
    public boolean setDevicePassword(String deviceId, String password) {
        deviceAuthPasswordMap.put(deviceId, password);
        return true;
    }

    public boolean checkDeviceAuthorized(String deviceId) {
        // 简单示例，授权密码为空即授权通过
        String pwd = deviceAuthPasswordMap.get(deviceId);
        return pwd == null || !pwd.isEmpty();
    }

    private Map<String, String> parseQueryParams(String query) {
        if (query == null) return Map.of();
        return Arrays.stream(query.split("&"))
                .map(s -> s.split("="))
                .filter(arr -> arr.length == 2)
                .collect(Collectors.toMap(arr -> arr[0], arr -> arr[1]));
    }
}
