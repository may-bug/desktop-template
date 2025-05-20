package cn.tecgui.desktop.server.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ControlMessage {
    // 控制端id
    private String from;
    // 被控端id
    private String to;
    // 控制类型，例如 "request", "accept", "reject", "closed" ,""
    private String type;
    // 控制密码
    private String password;
    private Map<String,Object> info;
}

