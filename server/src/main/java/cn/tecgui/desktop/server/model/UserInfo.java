package cn.tecgui.desktop.server.model;

import lombok.Data;

// UserInfo.java
@Data
public class UserInfo {
    private String userId;

    public UserInfo(UserSession userSession) {
        this.userId = userSession.getUserId();
    }
}
