package cn.tecgui.desktop.server.service;

import cn.tecgui.desktop.server.except.PermissionDeniedException;
import cn.tecgui.desktop.server.except.RoomFullException;
import cn.tecgui.desktop.server.model.UserInfo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class DataService {
    private static final int MAX_ROOM_SIZE = 20;
    private final RoomPermissionService roomPermissionService;
    // 房间ID -> 房间内的会话集合
    private final Map<String, Set<WebSocketSession>> rooms = new ConcurrentHashMap<>();

    // 会话ID -> 用户信息
    private final Map<String, UserInfo> sessionUserMap = new ConcurrentHashMap<>();

    // 用户ID -> 会话
    private final Map<String, WebSocketSession> userSessionMap = new ConcurrentHashMap<>();

    public DataService(RoomPermissionService roomPermissionService) {
        this.roomPermissionService = roomPermissionService;
    }

    public Collection<WebSocketSession> getAllSessions() {
        return new ArrayList<>(userSessionMap.values());
    }

    public UserInfo getUserInfo(String sessionId) {
        return sessionUserMap.get(sessionId);
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private String userId;
        private String roomId;
    }

    // 用户加入房间
    public void joinRoom(String roomId, String userId, WebSocketSession session) throws PermissionDeniedException {
        // 权限验证
        if (!roomPermissionService.canUserJoinRoom(userId, roomId)) {
            throw new PermissionDeniedException("User " + userId + " has no permission to join room " + roomId);
        }

        // 房间人数限制
        Set<WebSocketSession> roomSessions = rooms.get(roomId);
        if (roomSessions != null && roomSessions.size() >= MAX_ROOM_SIZE) {
            throw new RoomFullException("Room " + roomId + " is full (max " + MAX_ROOM_SIZE + " users)");
        }
        rooms.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(session);

        UserInfo userInfo = new UserInfo();
        userInfo.setUserId(userId);
        userInfo.setRoomId(roomId);

        sessionUserMap.put(session.getId(), userInfo);
        userSessionMap.put(userId, session);

        log.info("User {} joined room {}", userId, roomId);
    }

    // 用户离开房间
    public void leaveRoom(WebSocketSession session) {
        UserInfo userInfo = sessionUserMap.get(session.getId());
        if (userInfo != null) {
            String roomId = userInfo.getRoomId();
            String userId = userInfo.getUserId();

            Set<WebSocketSession> roomSessions = rooms.get(roomId);
            if (roomSessions != null) {
                roomSessions.remove(session);
                if (roomSessions.isEmpty()) {
                    rooms.remove(roomId);
                }
            }

            sessionUserMap.remove(session.getId());
            userSessionMap.remove(userId);

            log.info("User {} left room {}", userId, roomId);
        }
    }

    // 获取房间内的其他用户
    public Set<WebSocketSession> getRoomPeers(WebSocketSession session) {
        UserInfo userInfo = sessionUserMap.get(session.getId());
        if (userInfo == null) return Collections.emptySet();

        Set<WebSocketSession> peers = new HashSet<>(rooms.get(userInfo.getRoomId()));
        peers.remove(session); // 排除自己
        return peers;
    }

    // 获取特定用户的会话
    public WebSocketSession getUserSession(String userId) {
        return userSessionMap.get(userId);
    }
}
