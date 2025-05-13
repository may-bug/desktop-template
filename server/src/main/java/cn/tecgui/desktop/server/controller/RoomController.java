package cn.tecgui.desktop.server.controller;

import cn.tecgui.desktop.server.model.RoomInfo;
import cn.tecgui.desktop.server.service.RoomService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public List<RoomInfo> getAllRooms() {
        return roomService.getAllRooms().stream()
                .map(room -> {
                    RoomInfo info = new RoomInfo();
                    info.setRoomId(room.getId());
                    info.setUserCount(room.getUserCount());
                    return info;
                })
                .collect(Collectors.toList());
    }
}
