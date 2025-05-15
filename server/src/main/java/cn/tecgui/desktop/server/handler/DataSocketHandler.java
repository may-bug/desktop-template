package cn.tecgui.desktop.server.handler;

import cn.tecgui.desktop.server.components.RateLimiter;
import cn.tecgui.desktop.server.components.SensitiveWordFilter;
import cn.tecgui.desktop.server.except.PermissionDeniedException;
import cn.tecgui.desktop.server.service.DataService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Set;

@Slf4j
public class DataSocketHandler extends TextWebSocketHandler {
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final DataService dataService;
//    private final RateLimiter rateLimiter;
    private final SensitiveWordFilter sensitiveWordFilter;

    public DataSocketHandler(DataService dataService, SensitiveWordFilter filter) {
        this.dataService = dataService;
//        this.rateLimiter = rateLimiter;
        this.sensitiveWordFilter = filter;
    }


    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("WebSocket connection established: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // 记录最后活动时间
        session.getAttributes().put("lastActivity", System.currentTimeMillis());
        DataService.UserInfo userInfo = dataService.getUserInfo(session.getId());
//        if (userInfo == null || !rateLimiter.allowMessage(userInfo.getUserId())) {
//            session.sendMessage(new TextMessage("{\"error\":\"Message rate limit exceeded\"}"));
//            return;
//        }
        try {
            JsonNode root = objectMapper.readTree(message.getPayload());
            String type = root.path("type").asText();
            String roomId = root.path("roomId").asText();
            String userId = root.path("userId").asText();

            switch (type) {
                case "join":
                    handleJoin(session, roomId, userId);
                    break;
                case "offer":
                    handleOffer(session, root, roomId, userId);
                    break;
                case "answer":
                    handleAnswer(session, root, roomId, userId);
                    break;
                case "ice-candidate":
                    handleIceCandidate(session, root, roomId, userId);
                    break;
                case "message":
                    handleGroupMessage(session, root, roomId, userId);
                    break;
                default:
                    log.warn("Unknown message type: {}", type);
            }
        } catch (Exception | PermissionDeniedException e) {
            log.error("Error handling message: {}", e.getMessage());
            session.sendMessage(new TextMessage("{\"error\":\"" + e.getMessage() + "\"}"));
        }
    }

    private void handleJoin(WebSocketSession session, String roomId, String userId) throws Exception, PermissionDeniedException {
        dataService.joinRoom(roomId, userId, session);
        ObjectNode node = objectMapper.createObjectNode();
        node.put("type", "new-peer");
        node.put("userId", userId);

        broadcastToRoom(roomId, session, node.toString());
    }

    private void handleOffer(WebSocketSession session, JsonNode root, String roomId, String userId) throws Exception {
        String targetUserId = root.path("targetUserId").asText();
        WebSocketSession targetSession = dataService.getUserSession(targetUserId);

        if (targetSession != null && targetSession.isOpen()) {
            ObjectNode node = objectMapper.createObjectNode();
            node.put("type", "offer");
            node.put("senderId", userId);
            node.set("offer", root.path("offer"));

            targetSession.sendMessage(new TextMessage(node.toString()));
        }
    }

    private void handleAnswer(WebSocketSession session, JsonNode root, String roomId, String userId) throws Exception {
        String targetUserId = root.path("targetUserId").asText();
        WebSocketSession targetSession = dataService.getUserSession(targetUserId);

        if (targetSession != null && targetSession.isOpen()) {
            ObjectNode node = objectMapper.createObjectNode();
            node.put("type", "answer");
            node.put("senderId", userId);
            node.set("answer", root.path("answer"));

            targetSession.sendMessage(new TextMessage(node.toString()));
        }
    }

    private void handleIceCandidate(WebSocketSession session, JsonNode root, String roomId, String userId) throws Exception {
        String targetUserId = root.path("targetUserId").asText();
        WebSocketSession targetSession = dataService.getUserSession(targetUserId);

        if (targetSession != null && targetSession.isOpen()) {
            ObjectNode node = objectMapper.createObjectNode();
            node.put("type", "ice-candidate");
            node.put("senderId", userId);
            node.set("candidate", root.path("candidate"));

            targetSession.sendMessage(new TextMessage(node.toString()));
        }
    }

    private void handleGroupMessage(WebSocketSession session, JsonNode root, String roomId, String userId) throws Exception {
        String originalContent = root.path("content").asText();
        String filteredContent = sensitiveWordFilter.filter(originalContent);

        ObjectNode node = objectMapper.createObjectNode();
        node.put("type", "message");
        node.put("senderId", userId);
        node.put("content", filteredContent);

        broadcastToRoom(roomId, session, node.toString());
    }

    private void broadcastToRoom(String roomId, WebSocketSession excludeSession, String message) throws Exception {
        Set<WebSocketSession> peers = dataService.getRoomPeers(excludeSession);
        for (WebSocketSession peer : peers) {
            if (peer.isOpen()) {
                peer.sendMessage(new TextMessage(message));
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        log.info("WebSocket connection closed: {}, status: {}", session.getId(), status);
        dataService.leaveRoom(session);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.error("WebSocket transport error: {}", exception.getMessage());
        dataService.leaveRoom(session);
    }
}