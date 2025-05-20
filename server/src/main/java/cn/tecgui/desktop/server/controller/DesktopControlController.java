package cn.tecgui.desktop.server.controller;

import cn.tecgui.desktop.server.model.ControlMessage;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class DesktopControlController {

    private final SimpMessagingTemplate messagingTemplate;

    public DesktopControlController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * 接收前端发来的控制请求，发送给指定用户（设备）
     */
    @MessageMapping("/control/send")  // 对应前端的 /app/control/send
    public void handleControl(@Payload ControlMessage message, @Header("simpSessionId") String sessionId) {
        // 发送到目标设备用户的专属订阅通道（例如 /user/DEVICE_ID/queue/control_notify）
        messagingTemplate.convertAndSendToUser(
                message.getTo(), "/queue/control_notify", message
        );
    }
}
