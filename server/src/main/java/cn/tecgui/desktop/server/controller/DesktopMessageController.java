package cn.tecgui.desktop.server.controller;

import cn.tecgui.desktop.server.model.ControlMessage;
import cn.tecgui.desktop.server.service.DeviceSessionService;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class DesktopMessageController {
    private final SimpMessagingTemplate messagingTemplate;
    private final DeviceSessionService deviceSessionService;

    public DesktopMessageController(SimpMessagingTemplate messagingTemplate, DeviceSessionService deviceSessionService) {
        this.messagingTemplate = messagingTemplate;
        this.deviceSessionService = deviceSessionService;
    }

    /**
     * 发起请求
     */
    @MessageMapping("/control/desktop/request")
    public void handleControl(@Payload ControlMessage message, @Header("simpSessionId") String sessionId) {
        ControlMessage msg = new ControlMessage();
        switch (message.getType()) {
            case "request":
                messagingTemplate.convertAndSendToUser(
                        message.getTo(), "/queue/control/desktop/notify", message
                );
                break;
            case "answer":
                msg.setTo(message.getTo());
                msg.setFrom(message.getFrom());
                msg.setType(message.getType());
                msg.setInfo(message.getInfo());
                messagingTemplate.convertAndSendToUser(message.getFrom(), "/queue/control/desktop/notify", msg);
                break;
            case "reject":
                msg.setTo(message.getTo());
                msg.setFrom(message.getFrom());
                msg.setType(message.getType());
                msg.setInfo(message.getInfo());
                messagingTemplate.convertAndSendToUser(message.getFrom(), "/queue/control/desktop/notify", msg);
                break;
            case "closed":
                msg.setTo(message.getTo());
                msg.setFrom(message.getFrom());
                msg.setType(message.getType());
                msg.setInfo(message.getInfo());
                messagingTemplate.convertAndSendToUser(message.getFrom(), "/queue/control/desktop/notify", msg);
                break;
            case "timeout":
                msg.setTo(message.getTo());
                msg.setFrom(message.getFrom());
                msg.setType(message.getType());
                msg.setInfo(message.getInfo());
                messagingTemplate.convertAndSendToUser(message.getFrom(), "/queue/control/desktop/notify", msg);
                break;
            default:
                break;
        }
    }
}
