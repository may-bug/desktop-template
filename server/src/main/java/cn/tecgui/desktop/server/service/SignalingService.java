package cn.tecgui.desktop.server.service;

import cn.tecgui.desktop.server.model.data.SignalMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class SignalingService {

    private final SimpMessagingTemplate messagingTemplate;
    private final Set<String> activeUsers = ConcurrentHashMap.newKeySet();
    private final ConcurrentHashMap<String, SignalMessage> pendingCalls = new ConcurrentHashMap<>();

    public SignalingService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void handleSignal(SignalMessage message) {
        log.info("Processing signal type: {} from {} to {}",
                message.getType(), message.getSender(), message.getReceiver());

        switch (message.getType()) {
            case "join":
                handleJoin(message);
                break;
            case "leave":
                handleLeave(message);
                break;
            case "offer":
                handleOffer(message);
                break;
            case "answer":
                handleAnswer(message);
                break;
            case "candidate":
                forwardIceCandidate(message);
                break;
            case "accept":
                handleAccept(message);
                break;
            case "reject":
                handleReject(message);
                break;
            case "call-ended":
                handleCallEnded(message);
                break;
            default:
                log.warn("Unknown signal type: {}", message.getType());
        }
    }

    private void handleJoin(SignalMessage message) {
        String userId = message.getSender();
        activeUsers.add(userId);
        log.info("User {} joined. Active users: {}", userId, activeUsers);

        messagingTemplate.convertAndSend("/topic/users", activeUsers);
    }

    private void handleLeave(SignalMessage message) {
        String userId = message.getSender();
        activeUsers.remove(userId);
        pendingCalls.remove(userId);
        log.info("User {} left. Active users: {}", userId, activeUsers);

        messagingTemplate.convertAndSend("/topic/users", activeUsers);
    }

    // 在 SignalingService.java 中添加调试日志
    private void handleOffer(SignalMessage message) {
        log.info("处理offer - 发送方: {}, 接收方: {}, 类型: {}",
                message.getSender(), message.getReceiver(), message.getData().get("callType"));

        // 检查接收方是否在线
        if (!activeUsers.contains(message.getReceiver())) {
            log.warn("接收方 {} 不在线", message.getReceiver());
            sendReject(message.getSender(), message.getReceiver(), "user-offline");
            return;
        }

        // 存储通话请求
        pendingCalls.put(message.getReceiver(), message);

        // 构建通话请求消息
        SignalMessage request = new SignalMessage();
        request.setType("call-request");
        request.setSender(message.getSender());
        request.setReceiver(message.getReceiver());
        request.setData(Map.of(
                "callType", message.getData().get("callType"),
                "timestamp", System.currentTimeMillis()
        ));

        log.info("准备发送call-request到 {}", message.getReceiver());
        messagingTemplate.convertAndSendToUser(
                message.getReceiver(),
                "/queue/call-request",
                request
        );
    }

    private void handleAnswer(SignalMessage message) {
        // 转发answer前检查是否存在对应的offer
        SignalMessage originalOffer = pendingCalls.get(message.getSender());
        if (originalOffer == null || !originalOffer.getSender().equals(message.getReceiver())) {
            sendReject(message.getSender(), message.getReceiver(), "no-pending-call");
            return;
        }

        forwardSessionDescription(message);
        pendingCalls.remove(message.getSender());
    }

    private void handleAccept(SignalMessage message) {
        SignalMessage offer = pendingCalls.get(message.getSender());
        if (offer == null) {
            sendReject(message.getSender(), message.getReceiver(), "no-pending-call");
            return;
        }

        // 通知发起方通话被接受
        messagingTemplate.convertAndSendToUser(
                message.getReceiver(),
                "/queue/call-accepted",
                Map.of(
                        "sender", message.getSender(),
                        "timestamp", System.currentTimeMillis()
                )
        );

        pendingCalls.remove(message.getSender());
    }

    private void handleReject(SignalMessage message) {
        pendingCalls.remove(message.getSender());
        forwardReject(message);
    }

    private void handleCallEnded(SignalMessage message) {
        // 清理任何可能存在的待处理请求
        pendingCalls.entrySet().removeIf(entry ->
                entry.getValue().getSender().equals(message.getSender()) ||
                        entry.getValue().getReceiver().equals(message.getSender())
        );

        forwardCallEnded(message);
    }

    private void forwardSessionDescription(SignalMessage message) {
        String receiver = message.getReceiver();
        log.debug("Forwarding session description to {}", receiver);
        messagingTemplate.convertAndSendToUser(
                receiver,
                "/queue/signal",
                message
        );
    }

    private void forwardIceCandidate(SignalMessage message) {
        String receiver = message.getReceiver();
        messagingTemplate.convertAndSendToUser(
                receiver,
                "/queue/signal",
                message
        );
    }

    private void forwardReject(SignalMessage message) {
        String receiver = message.getReceiver();
        messagingTemplate.convertAndSendToUser(
                receiver,
                "/queue/call-rejected",
                message
        );
    }

    private void forwardCallEnded(SignalMessage message) {
        String receiver = message.getReceiver();
        messagingTemplate.convertAndSendToUser(
                receiver,
                "/queue/call-ended",
                message
        );
    }

    private void sendReject(String sender, String receiver, String reason) {
        SignalMessage reject = new SignalMessage();
        reject.setType("reject");
        reject.setSender(sender);
        reject.setReceiver(receiver);
        reject.setData(Map.of("reason", reason));
        forwardReject(reject);
    }

    public Set<String> getActiveUsers() {
        return new HashSet<>(activeUsers);
    }
}