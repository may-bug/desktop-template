package cn.tecgui.desktop.server.handler;

import cn.tecgui.desktop.server.service.SignalingService;
import cn.tecgui.desktop.server.model.IceCandidateMessage;
import cn.tecgui.desktop.server.model.JoinRoomRequest;
import cn.tecgui.desktop.server.model.SdpMessage;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Slf4j
public class SignalingSocketHandler extends TextWebSocketHandler {

    private final SignalingService signalingService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SignalingSocketHandler(SignalingService signalingService) {
        this.signalingService = signalingService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("WebSocket connection established: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try {
            JsonNode root = objectMapper.readTree(message.getPayload());
            String type = root.path("type").asText();
            switch (type) {
                case "join":
                    JoinRoomRequest joinRequest = objectMapper.readValue(message.getPayload(), JoinRoomRequest.class);
                    signalingService.joinRoom(joinRequest.getRoomId(), joinRequest.getUserId(), session);
                    break;
                case "offer":
                    SdpMessage offerMsg = objectMapper.readValue(message.getPayload(), SdpMessage.class);
                    signalingService.sendOffer(offerMsg);
                    break;
                case "answer":
                    SdpMessage answerMsg = objectMapper.readValue(message.getPayload(), SdpMessage.class);
                    signalingService.sendAnswer(answerMsg);
                    break;
                case "ice-candidate":
                    IceCandidateMessage iceMsg = objectMapper.readValue(message.getPayload(), IceCandidateMessage.class);
                    signalingService.sendIceCandidate(iceMsg);
                    break;
                case "leave":
                    signalingService.leaveRoom(session);
                    break;
                default:
                    log.warn("Unknown message type: {}", type);
            }
        } catch (Exception e) {
            log.error("Error handling message: {}", e.getMessage());
            session.sendMessage(new TextMessage("{\"error\":\"" + e.getMessage() + "\"}"));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        log.info("WebSocket connection closed: {}, status: {}", session.getId(), status);
        signalingService.leaveRoom(session);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.error("WebSocket transport error: {}", exception.getMessage());
        signalingService.leaveRoom(session);
    }
}