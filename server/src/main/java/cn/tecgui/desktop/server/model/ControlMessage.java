package cn.tecgui.desktop.server.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ControlMessage {
    private String from;
    private String to;
    private String type; // 控制类型，例如 "request", "accept", "reject", "release"
    private String content; // 附带的额外内容，如 token、连接地址等
}

