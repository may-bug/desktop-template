package cn.tecgui.desktop.server.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room implements Serializable {
    private String id;
    private String name;
    private String creatorId;
    private String creatorName;
    private boolean isPrivate;
    private String password;
    private int maxUsers;
    private Set<String> userIds = new HashSet<>();
    private long createdAt;
    private long lastActiveTime;
}