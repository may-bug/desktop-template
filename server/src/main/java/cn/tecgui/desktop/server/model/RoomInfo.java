package cn.tecgui.desktop.server.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// RoomInfo.java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomInfo {
    private String type;
    private String roomId;
    private List<UserInfo> users;

    public void setUserCount(int userCount) {
        System.out.println(userCount);
    }
}
