package cn.tecgui.desktop.server.service;

public interface RoomPermissionService {
    boolean canUserJoinRoom(String userId, String roomId);
}
