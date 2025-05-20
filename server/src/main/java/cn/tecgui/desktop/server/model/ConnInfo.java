package cn.tecgui.desktop.server.model;

import cn.tecgui.desktop.server.core.DesktopStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConnInfo {
    private String uid;
    private String password;
    private String device;
    private DesktopStatusEnum status;
    private Map<String,Object> content;
}
