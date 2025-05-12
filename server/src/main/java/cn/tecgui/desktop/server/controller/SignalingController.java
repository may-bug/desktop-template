package cn.tecgui.desktop.server.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class SignalingController {

    private final SimpMessagingTemplate messagingTemplate;

    public SignalingController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/exchange")
    public void handleSignal(@Payload String message) {
        // 在这里可以根据你的需求处理消息，比如保存ICE候选、SDP等信息。
        // 这里简单地将消息发送到特定的主题上。
        messagingTemplate.convertAndSend("/topic/exchange", message);
    }
}
