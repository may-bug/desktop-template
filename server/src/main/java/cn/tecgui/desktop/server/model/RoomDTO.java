package cn.tecgui.desktop.server.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomDTO {
    private String id;
    private String name;
    private String creatorName;
    private boolean isPrivate;
    private int maxUsers;
    private int userCount;
    private boolean joined;
}

