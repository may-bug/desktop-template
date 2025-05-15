package cn.tecgui.desktop.server.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// UserInfo.java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInfo {
    private String userId;

    public UserInfo(UserSession userSession) {
        this.userId = userSession.getUserId();
    }
}
