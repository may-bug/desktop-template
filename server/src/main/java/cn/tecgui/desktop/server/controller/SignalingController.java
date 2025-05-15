package cn.tecgui.desktop.server.controller;

import cn.tecgui.desktop.server.model.data.SignalMessage;
import cn.tecgui.desktop.server.service.SignalingService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.Set;

@Controller
public class SignalingController {

    private final SignalingService signalingService;

    public SignalingController(SignalingService signalingService) {
        this.signalingService = signalingService;
    }

    @MessageMapping("/signal")
    public void handleSignal(SignalMessage message) {
        signalingService.handleSignal(message);
    }

    @MessageMapping("/users")
    @SendTo("/topic/users")
    public Set<String> getActiveUsers() {
        return signalingService.getActiveUsers();
    }
}
