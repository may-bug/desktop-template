package cn.tecgui.desktop.server.service.impl;

import cn.tecgui.desktop.server.service.RoomPermissionService;
import org.springframework.stereotype.Service;

@Service
public class DefaultRoomPermissionService implements RoomPermissionService {

    @Override
    public boolean canUserJoinRoom(String userId, String roomId) {
        // 实现你的权限验证逻辑，例如：
        // - 检查用户是否有权限加入该房间
        // - 检查房间是否为私有房间
        // - 检查用户是否在黑名单中
        return true; // 默认允许
    }
}
