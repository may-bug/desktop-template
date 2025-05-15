package cn.tecgui.desktop.server.service;

import cn.tecgui.desktop.server.except.RoomNotFoundException;
import cn.tecgui.desktop.server.except.UnauthorizedAccessException;
import cn.tecgui.desktop.server.model.CreateRoomRequest;
import cn.tecgui.desktop.server.model.Room;
import cn.tecgui.desktop.server.model.RoomDTO;

import java.util.List;

public interface RoomService {
    List<RoomDTO> getAllRooms();
    Room createRoom(CreateRoomRequest request, String creatorId);
    void joinRoom(String roomId, String password, String userId) throws RoomNotFoundException, UnauthorizedAccessException;
    void leaveRoom(String roomId, String userId) throws RoomNotFoundException;
    boolean checkRoomExists(String roomId);
    void cleanupInactiveRooms();
    RoomDTO convertToDTO(Room room);
}