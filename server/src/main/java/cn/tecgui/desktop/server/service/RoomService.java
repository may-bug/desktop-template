package cn.tecgui.desktop.server.service;

import cn.tecgui.desktop.server.except.RoomFullException;
import cn.tecgui.desktop.server.except.SignalingException;
import cn.tecgui.desktop.server.model.Room;
import cn.tecgui.desktop.server.model.UserSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;

import java.util.Collection;
import java.util.Collections;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

// RoomService.java
@Service
public class RoomService {

    private static final Logger logger = LoggerFactory.getLogger(RoomService.class);
    private static final int MAX_ROOM_CAPACITY = 10;
    private final ConcurrentMap<String, Room> rooms = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, String> sessionToRoomMap = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, String> sessionToUserMap = new ConcurrentHashMap<>();

    public synchronized Room joinRoom(String roomId, UserSession userSession) {
        Room room = rooms.computeIfAbsent(roomId, id -> new Room(id));

        if (room.getUserCount() >= MAX_ROOM_CAPACITY) {
            throw new RoomFullException("Room " + roomId + " is full");
        }

        if (room.getUser(userSession.getUserId()) != null) {
            throw new SignalingException("User " + userSession.getUserId() + " already in room");
        }

        room.addUser(userSession);
        sessionToRoomMap.put(userSession.getSession().getId(), roomId);
        sessionToUserMap.put(userSession.getSession().getId(), userSession.getUserId());

        logger.info("User {} joined room {}", userSession.getUserId(), roomId);
        return room;
    }

    public Room getRoom(String roomId) {
        Room room = rooms.get(roomId);
        if (room == null) {
            throw new SignalingException("Room " + roomId + " not found");
        }
        return room;
    }

    public synchronized Room leaveRoom(WebSocketSession session) {
        String roomId = sessionToRoomMap.get(session.getId());
        if (roomId == null) {
            return null;
        }

        Room room = rooms.get(roomId);
        if (room == null) {
            return null;
        }

        String userId = sessionToUserMap.get(session.getId());
        if (userId != null) {
            room.removeUser(userId);
            logger.info("User {} left room {}", userId, roomId);
        }

        sessionToRoomMap.remove(session.getId());
        sessionToUserMap.remove(session.getId());

        if (room.getUserCount() == 0) {
            rooms.remove(roomId);
            logger.info("Room {} removed (no users left)", roomId);
        }

        return room;
    }

    public Collection<Room> getAllRooms() {
        return Collections.unmodifiableCollection(rooms.values());
    }
}